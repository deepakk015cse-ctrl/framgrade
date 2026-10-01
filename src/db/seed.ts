import * as dotenv from 'dotenv';
dotenv.config();

import { db, pool } from './index.ts';
import {
  users,
  farmerProfiles,
  buyerProfiles,
  crops,
  locations,
  marketPrices,
  produceListings,
  bids,
  transactions,
  notifications,
  pricePredictions,
} from './schema.ts';
import { eq } from 'drizzle-orm';

export async function seedDatabase() {
  console.log('Seeding FarmGrade PostgreSQL database...');

  // 1. Check if crops already exist
  const existingCrops = await db.select().from(crops);
  if (existingCrops.length > 0) {
    console.log('Database already seeded, skipping seed.');
    return;
  }

  // 2. Insert Crops
  const insertedCrops = await db
    .insert(crops)
    .values([
      { name: 'Tomato', localName: 'Thakkali (தக்காளி)', category: 'Vegetables', defaultUnit: 'kg', icon: '🍅' },
      { name: 'Onion', localName: 'Vengayam (வெங்காயம்)', category: 'Vegetables', defaultUnit: 'kg', icon: '🧅' },
      { name: 'Potato', localName: 'Urulaikizhangu (உ உருளைக்கிழங்கு)', category: 'Vegetables', defaultUnit: 'kg', icon: '🥔' },
      { name: 'Paddy', localName: 'Nellu (நெல்)', category: 'Grains', defaultUnit: 'quintal', icon: '🌾' },
      { name: 'Banana', localName: 'Vazhaipazham (வாழைப்பழம்)', category: 'Fruits', defaultUnit: 'kg', icon: '🍌' },
      { name: 'Green Chilli', localName: 'Pachai Milagai (பச்சை மிளகாய்)', category: 'Cash Crops', defaultUnit: 'kg', icon: '🌶️' },
      { name: 'Cotton', localName: 'Paruthi (பருத்தி)', category: 'Cash Crops', defaultUnit: 'quintal', icon: '☁️' },
      { name: 'Maize', localName: 'Makka Cholam (மக்காச்சோளம்)', category: 'Grains', defaultUnit: 'quintal', icon: '🌽' },
    ])
    .returning();

  console.log(`Inserted ${insertedCrops.length} crops.`);

  // 3. Insert Locations
  const insertedLocations = await db
    .insert(locations)
    .values([
      { name: 'Tiruchengode APMC Mandi', district: 'Namakkal', state: 'Tamil Nadu', distanceKm: 6 },
      { name: 'Salem Central Regulated Market', district: 'Salem', state: 'Tamil Nadu', distanceKm: 32 },
      { name: 'Erode Agricultural Marketing Yard', district: 'Erode', state: 'Tamil Nadu', distanceKm: 24 },
      { name: 'Namakkal Uzhavar Sandhai', district: 'Namakkal', state: 'Tamil Nadu', distanceKm: 18 },
    ])
    .returning();

  console.log(`Inserted ${insertedLocations.length} locations.`);

  // 4. Insert Users
  const insertedUsers = await db
    .insert(users)
    .values([
      {
        uid: 'farmer-murugan-101',
        name: 'Murugan Selvam',
        phone: '9876543210',
        email: 'murugan.farmer@farmgrade.in',
        role: 'farmer',
      },
      {
        uid: 'farmer-annamalai-102',
        name: 'Annamalai K.',
        phone: '9842109876',
        email: 'annamalai.farmer@farmgrade.in',
        role: 'farmer',
      },
      {
        uid: 'farmer-lakshmi-103',
        name: 'Lakshmi Narayanan',
        phone: '9845012345',
        email: 'lakshmi.farmer@farmgrade.in',
        role: 'farmer',
      },
      {
        uid: 'buyer-ramesh-201',
        name: 'Ramesh Kumar',
        phone: '9443210987',
        email: 'ramesh@freshbasket.in',
        role: 'buyer',
      },
      {
        uid: 'buyer-priya-202',
        name: 'Priya Sundaram',
        phone: '9841234567',
        email: 'priya@tamilnadufarms.co',
        role: 'buyer',
      },
      {
        uid: 'kiosk-selvi-301',
        name: 'Selvi Mani',
        phone: '9898989898',
        email: 'kiosk.tiruchengode@farmgrade.in',
        role: 'kiosk_operator',
      },
      {
        uid: 'admin-harish-001',
        name: 'FarmGrade Administrator',
        phone: '9000000000',
        email: 'admin@farmgrade.in',
        role: 'admin',
      },
    ])
    .returning();

  console.log(`Inserted ${insertedUsers.length} users.`);

  const murugan = insertedUsers[0];
  const annamalai = insertedUsers[1];
  const lakshmi = insertedUsers[2];
  const ramesh = insertedUsers[3];
  const priya = insertedUsers[4];

  // 5. Insert Profiles
  await db.insert(farmerProfiles).values([
    {
      userId: murugan.id,
      village: 'Tiruchengode Rural',
      district: 'Namakkal',
      state: 'Tamil Nadu',
      preferredLanguage: 'ta',
    },
    {
      userId: annamalai.id,
      village: 'Rasipuram North',
      district: 'Namakkal',
      state: 'Tamil Nadu',
      preferredLanguage: 'ta',
    },
    {
      userId: lakshmi.id,
      village: 'Paramathi Velur',
      district: 'Namakkal',
      state: 'Tamil Nadu',
      preferredLanguage: 'en',
    },
  ]);

  await db.insert(buyerProfiles).values([
    {
      userId: ramesh.id,
      businessName: 'FreshBasket Retail Chain',
      village: 'Tiruchengode Town',
      district: 'Namakkal',
      state: 'Tamil Nadu',
      buyerType: 'Retail Chain',
    },
    {
      userId: priya.id,
      businessName: 'Greenfield Agro Wholesalers',
      village: 'Shevapet Market Yard',
      district: 'Salem',
      state: 'Tamil Nadu',
      buyerType: 'Wholesaler',
    },
  ]);

  // 6. Insert Market Prices (APMC mandi benchmarks)
  const tomatoCrop = insertedCrops.find((c) => c.name === 'Tomato')!;
  const onionCrop = insertedCrops.find((c) => c.name === 'Onion')!;
  const potatoCrop = insertedCrops.find((c) => c.name === 'Potato')!;
  const paddyCrop = insertedCrops.find((c) => c.name === 'Paddy')!;
  const bananaCrop = insertedCrops.find((c) => c.name === 'Banana')!;
  const chilliCrop = insertedCrops.find((c) => c.name === 'Green Chilli')!;

  await db.insert(marketPrices).values([
    {
      cropId: tomatoCrop.id,
      location: 'Tiruchengode APMC',
      price: 32,
      minPrice: 28,
      maxPrice: 36,
      unit: 'kg',
      source: 'APMC Mandi Portal',
      trend: 'up',
      changePercent: '+8.5%',
    },
    {
      cropId: onionCrop.id,
      location: 'Salem Regulated Market',
      price: 28,
      minPrice: 24,
      maxPrice: 32,
      unit: 'kg',
      source: 'Agmarknet Live',
      trend: 'stable',
      changePercent: '+0.5%',
    },
    {
      cropId: potatoCrop.id,
      location: 'Erode Market Yard',
      price: 24,
      minPrice: 20,
      maxPrice: 26,
      unit: 'kg',
      source: 'APMC Mandi Portal',
      trend: 'down',
      changePercent: '-3.8%',
    },
    {
      cropId: paddyCrop.id,
      location: 'Paramathi Velur Mandi',
      price: 2450,
      minPrice: 2350,
      maxPrice: 2550,
      unit: 'quintal',
      source: 'Agmarknet Live',
      trend: 'up',
      changePercent: '+2.9%',
    },
    {
      cropId: bananaCrop.id,
      location: 'Tiruchengode Uzhavar Sandhai',
      price: 35,
      minPrice: 30,
      maxPrice: 40,
      unit: 'kg',
      source: 'APMC Mandi Portal',
      trend: 'up',
      changePercent: '+5.0%',
    },
    {
      cropId: chilliCrop.id,
      location: 'Salem Wholesale Yard',
      price: 120,
      minPrice: 110,
      maxPrice: 135,
      unit: 'kg',
      source: 'Agmarknet Live',
      trend: 'stable',
      changePercent: '+1.2%',
    },
  ]);

  // 7. Insert Produce Listings
  const insertedListings = await db
    .insert(produceListings)
    .values([
      {
        farmerId: murugan.id,
        cropId: tomatoCrop.id,
        quantity: 450,
        unit: 'kg',
        quality: 'Grade A+ (Premium)',
        village: 'Tiruchengode Rural',
        availableDate: 'Tomorrow morning 08:00 AM',
        status: 'active',
        suggestedMinPrice: 30,
        suggestedMaxPrice: 35,
        expectedPrice: 33,
        notes: 'Plucked fresh at dawn. Uniform red firmness with zero blemish. Packed in clean 25kg crates.',
      },
      {
        farmerId: annamalai.id,
        cropId: onionCrop.id,
        quantity: 1200,
        unit: 'kg',
        quality: 'Grade A (Very Good)',
        village: 'Rasipuram North',
        availableDate: 'Within 2 days',
        status: 'negotiating',
        suggestedMinPrice: 26,
        suggestedMaxPrice: 30,
        expectedPrice: 28,
        notes: 'Well-cured medium-large red onions with dry outer skin. Stored in ventilated dry godown.',
      },
      {
        farmerId: lakshmi.id,
        cropId: paddyCrop.id,
        quantity: 80,
        unit: 'quintal',
        quality: 'Grade A+ (Premium)',
        village: 'Paramathi Velur',
        availableDate: 'Immediate',
        status: 'active',
        suggestedMinPrice: 2400,
        suggestedMaxPrice: 2550,
        expectedPrice: 2500,
        notes: 'BPT 5204 fine grain paddy. Moisture certified at 13.5% at village agricultural testing kiosk.',
      },
      {
        farmerId: murugan.id,
        cropId: bananaCrop.id,
        quantity: 350,
        unit: 'kg',
        quality: 'Grade A (Very Good)',
        village: 'Tiruchengode Rural',
        availableDate: 'Yesterday',
        status: 'sold',
        suggestedMinPrice: 32,
        suggestedMaxPrice: 38,
        expectedPrice: 35,
        notes: 'Poovan banana bunches, tree-ripened, pesticide-free harvest.',
      },
    ])
    .returning();

  console.log(`Inserted ${insertedListings.length} produce listings.`);

  // 8. Insert Price Predictions
  await db.insert(pricePredictions).values([
    {
      listingId: insertedListings[0].id,
      cropName: 'Tomato',
      minPrice: 30,
      maxPrice: 35,
      confidence: 'High (94%)',
      modelVersion: 'gemini-2.5-market-pro',
      explanation: 'Festive season demand surge in Salem & Erode mandis with low local arrivals this week.',
    },
    {
      listingId: insertedListings[1].id,
      cropName: 'Onion',
      minPrice: 26,
      maxPrice: 30,
      confidence: 'Medium (88%)',
      modelVersion: 'gemini-2.5-market-pro',
      explanation: 'Moderate arrivals from Nashik stabilising local retail pricing.',
    },
    {
      listingId: insertedListings[2].id,
      cropName: 'Paddy',
      minPrice: 2400,
      maxPrice: 2550,
      confidence: 'High (96%)',
      modelVersion: 'gemini-2.5-market-pro',
      explanation: 'Mill procurement active across Cauvery delta basin, 13.5% moisture earns top grade premium.',
    },
  ]);

  // 9. Insert Bids
  const insertedBids = await db
    .insert(bids)
    .values([
      {
        listingId: insertedListings[0].id,
        buyerId: ramesh.id,
        bidPrice: 32,
        quantity: 450,
        totalAmount: 14400,
        pickupPreference: 'Buyer Pickup from Farm Gate',
        paymentTerms: 'Immediate UPI',
        notes: 'Ready with insulated transport truck. Can collect directly at your farm tomorrow 9:00 AM.',
        status: 'pending',
      },
      {
        listingId: insertedListings[1].id,
        buyerId: priya.id,
        bidPrice: 28,
        quantity: 1200,
        totalAmount: 33600,
        pickupPreference: 'Village Kiosk hub delivery',
        paymentTerms: 'Immediate UPI',
        notes: 'Full lot procurement for wholesale distribution. Immediate UPI transfer upon kiosk weighment.',
        status: 'accepted',
      },
      {
        listingId: insertedListings[3].id,
        buyerId: ramesh.id,
        bidPrice: 35,
        quantity: 350,
        totalAmount: 12250,
        pickupPreference: 'Buyer Pickup from Farm Gate',
        paymentTerms: 'Immediate UPI',
        notes: 'Completed direct farm pickup.',
        status: 'completed',
      },
    ])
    .returning();

  console.log(`Inserted ${insertedBids.length} bids.`);

  // 10. Insert Completed Transaction
  await db.insert(transactions).values([
    {
      listingId: insertedListings[3].id,
      farmerId: murugan.id,
      buyerId: ramesh.id,
      agreedPrice: 35,
      quantity: 350,
      totalAmount: 12250,
      paymentStatus: 'paid',
      paymentMethod: 'Immediate UPI',
      weighmentSlipNo: 'FG-W984-TKD',
      status: 'completed',
    },
  ]);

  // 11. Insert Sample Notifications
  await db.insert(notifications).values([
    {
      userId: murugan.id,
      title: 'New Bid Received!',
      message: 'Ramesh Kumar (FreshBasket) submitted an offer of ₹32/kg for your 450 kg Tomato lot.',
      read: false,
    },
    {
      userId: ramesh.id,
      title: 'Bid Accepted!',
      message: 'Farmer Annamalai K. accepted your bid of ₹28/kg for 1200 kg Onion.',
      read: true,
    },
  ]);

  console.log('PostgreSQL seed completed successfully!');
}

// Run if called directly
if (process.argv[1]?.endsWith('seed.ts')) {
  seedDatabase()
    .then(() => {
      console.log('Seeding finished.');
      process.exit(0);
    })
    .catch((err) => {
      console.error('Seeding error:', err);
      process.exit(1);
    });
}
