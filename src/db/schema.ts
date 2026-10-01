import { relations } from 'drizzle-orm';
import {
  boolean,
  integer,
  pgTable,
  serial,
  text,
  timestamp
} from 'drizzle-orm/pg-core';

// 1. Users table (Farmers, Buyers, Kiosk Operators, Admins)
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').unique(), // Firebase Auth UID or system user ID
  name: text('name').notNull(),
  phone: text('phone').notNull().unique(),
  email: text('email'),
  role: text('role').notNull().default('farmer'), // 'farmer' | 'buyer' | 'kiosk_operator' | 'admin'
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 2. Farmer Profiles
export const farmerProfiles = pgTable('farmer_profiles', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull()
    .unique(),
  village: text('village').notNull(),
  district: text('district').notNull(),
  state: text('state').notNull(),
  preferredLanguage: text('preferred_language').default('en').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 3. Buyer Profiles
export const buyerProfiles = pgTable('buyer_profiles', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull()
    .unique(),
  businessName: text('business_name').notNull(),
  village: text('village'),
  district: text('district').notNull(),
  state: text('state').notNull(),
  buyerType: text('buyer_type').notNull(), // 'Wholesaler' | 'Retail Chain' | 'FPO Partner' | 'Processing Unit'
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 5. Crops master catalog
export const crops = pgTable('crops', {
  id: serial('id').primaryKey(),
  name: text('name').notNull().unique(),
  localName: text('local_name'),
  category: text('category').notNull(), // 'Vegetables' | 'Grains' | 'Fruits' | 'Cash Crops'
  defaultUnit: text('default_unit').notNull().default('kg'),
  icon: text('icon'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 11. Locations / Mandis master
export const locations = pgTable('locations', {
  id: serial('id').primaryKey(),
  name: text('name').notNull().unique(),
  district: text('district').notNull(),
  state: text('state').notNull(),
  distanceKm: integer('distance_km').default(10),
  coordinates: text('coordinates'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 4. Produce Listings
export const produceListings = pgTable('produce_listings', {
  id: serial('id').primaryKey(),
  farmerId: integer('farmer_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  cropId: integer('crop_id')
    .references(() => crops.id, { onDelete: 'restrict' })
    .notNull(),
  quantity: integer('quantity').notNull(),
  unit: text('unit').notNull().default('kg'),
  quality: text('quality').notNull(), // 'Grade A+' | 'Grade A' | 'Grade B'
  village: text('village').notNull(),
  availableDate: text('available_date').notNull(),
  status: text('status').notNull().default('active'), // 'active' | 'negotiating' | 'sold' | 'archived'
  suggestedMinPrice: integer('suggested_min_price'),
  suggestedMaxPrice: integer('suggested_max_price'),
  expectedPrice: integer('expected_price'),
  photoUrl: text('photo_url'),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 6. Market Prices (APMC mandi prices benchmark)
export const marketPrices = pgTable('market_prices', {
  id: serial('id').primaryKey(),
  cropId: integer('crop_id')
    .references(() => crops.id, { onDelete: 'cascade' })
    .notNull(),
  location: text('location').notNull(),
  price: integer('price').notNull(),
  minPrice: integer('min_price'),
  maxPrice: integer('max_price'),
  unit: text('unit').notNull().default('kg'),
  source: text('source').notNull(), // 'APMC Mandi Portal' | 'Agmarknet' | 'Field Survey'
  trend: text('trend').default('stable'), // 'up' | 'down' | 'stable'
  changePercent: text('change_percent').default('0%'),
  recordedAt: timestamp('recorded_at').defaultNow().notNull(),
});

// 7. Bids
export const bids = pgTable('bids', {
  id: serial('id').primaryKey(),
  listingId: integer('listing_id')
    .references(() => produceListings.id, { onDelete: 'cascade' })
    .notNull(),
  buyerId: integer('buyer_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  bidPrice: integer('bid_price').notNull(),
  quantity: integer('quantity').notNull(),
  totalAmount: integer('total_amount').notNull(),
  distanceKm: integer('distance_km').default(8),
  buyerLocation: text('buyer_location'),
  buyerType: text('buyer_type').default('Wholesaler'),
  pickupPreference: text('pickup_preference'),
  paymentTerms: text('payment_terms').notNull(),
  notes: text('notes'),
  status: text('status').notNull().default('pending'), // 'pending' | 'selected' | 'awaiting_buyer_confirmation' | 'confirmed' | 'backup_offered' | 'accepted' | 'rejected' | 'countered' | 'cancelled' | 'completed'
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 8. Transactions / Settlement
export const transactions = pgTable('transactions', {
  id: serial('id').primaryKey(),
  listingId: integer('listing_id')
    .references(() => produceListings.id, { onDelete: 'restrict' })
    .notNull(),
  farmerId: integer('farmer_id')
    .references(() => users.id, { onDelete: 'restrict' })
    .notNull(),
  buyerId: integer('buyer_id')
    .references(() => users.id, { onDelete: 'restrict' })
    .notNull(),
  bidId: integer('bid_id'),
  agreedPrice: integer('agreed_price').notNull(),
  quantity: integer('quantity').notNull(),
  totalAmount: integer('total_amount').notNull(),
  paymentStatus: text('payment_status').notNull().default('pending'), // 'paid' | 'pending' | 'processing'
  paymentMethod: text('payment_method').default('Immediate UPI'),
  weighmentSlipNo: text('weighment_slip_no'),
  status: text('status').notNull().default('awaiting_buyer_confirmation'), // 'awaiting_buyer_confirmation' | 'confirmed' | 'completed' | 'cancelled'
  selectedAt: timestamp('selected_at').defaultNow(),
  confirmedAt: timestamp('confirmed_at'),
  cancelledAt: timestamp('cancelled_at'),
  cancellationReason: text('cancellation_reason'),
  backupOffersCount: integer('backup_offers_count').default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 9. Notifications
export const notifications = pgTable('notifications', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  title: text('title').notNull(),
  message: text('message').notNull(),
  read: boolean('read').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 10. Price Predictions (AI Fair Price Engine)
export const pricePredictions = pgTable('price_predictions', {
  id: serial('id').primaryKey(),
  listingId: integer('listing_id')
    .references(() => produceListings.id, { onDelete: 'set null' }),
  cropName: text('crop_name').notNull(),
  minPrice: integer('min_price').notNull(),
  maxPrice: integer('max_price').notNull(),
  expectedPrice: integer('expected_price'),
  confidence: text('confidence').default('Medium (78%)'),
  confidenceScore: integer('confidence_score').default(78),
  modelVersion: text('model_version').default('baseline-hedonic-v1.0'),
  explanation: text('explanation'),
  featuresJson: text('features_json'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// RELATIONS DEFINITIONS
export const usersRelations = relations(users, ({ one, many }) => ({
  farmerProfile: one(farmerProfiles, {
    fields: [users.id],
    references: [farmerProfiles.userId],
  }),
  buyerProfile: one(buyerProfiles, {
    fields: [users.id],
    references: [buyerProfiles.userId],
  }),
  produceListings: many(produceListings),
  bids: many(bids),
  farmerTransactions: many(transactions, { relationName: 'farmerTransactions' }),
  buyerTransactions: many(transactions, { relationName: 'buyerTransactions' }),
  notifications: many(notifications),
}));

export const farmerProfilesRelations = relations(farmerProfiles, ({ one }) => ({
  user: one(users, {
    fields: [farmerProfiles.userId],
    references: [users.id],
  }),
}));

export const buyerProfilesRelations = relations(buyerProfiles, ({ one }) => ({
  user: one(users, {
    fields: [buyerProfiles.userId],
    references: [users.id],
  }),
}));

export const cropsRelations = relations(crops, ({ many }) => ({
  listings: many(produceListings),
  marketPrices: many(marketPrices),
}));

export const produceListingsRelations = relations(produceListings, ({ one, many }) => ({
  farmer: one(users, {
    fields: [produceListings.farmerId],
    references: [users.id],
  }),
  crop: one(crops, {
    fields: [produceListings.cropId],
    references: [crops.id],
  }),
  bids: many(bids),
  transactions: many(transactions),
  pricePredictions: many(pricePredictions),
}));

export const marketPricesRelations = relations(marketPrices, ({ one }) => ({
  crop: one(crops, {
    fields: [marketPrices.cropId],
    references: [crops.id],
  }),
}));

export const bidsRelations = relations(bids, ({ one }) => ({
  listing: one(produceListings, {
    fields: [bids.listingId],
    references: [produceListings.id],
  }),
  buyer: one(users, {
    fields: [bids.buyerId],
    references: [users.id],
  }),
}));

export const transactionsRelations = relations(transactions, ({ one }) => ({
  listing: one(produceListings, {
    fields: [transactions.listingId],
    references: [produceListings.id],
  }),
  farmer: one(users, {
    fields: [transactions.farmerId],
    references: [users.id],
    relationName: 'farmerTransactions',
  }),
  buyer: one(users, {
    fields: [transactions.buyerId],
    references: [users.id],
    relationName: 'buyerTransactions',
  }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
}));

export const pricePredictionsRelations = relations(pricePredictions, ({ one }) => ({
  listing: one(produceListings, {
    fields: [pricePredictions.listingId],
    references: [produceListings.id],
  }),
}));
