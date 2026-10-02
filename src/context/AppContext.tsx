import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  ProduceListing,
  Bid,
  SaleTransaction,
  MandiPrice,
  UserRole,
  Language,
  ToastMessage,
  ConfirmationModalState
} from '../types';
import { translations, translateText, applyDomLocalization } from '../locales/translations';
import { api } from '../services/api';
import { sanitizeFarmerErrorMessage, farmerNotifications } from '../services/notificationService';


export interface AuthUser {
  id: number;
  name: string;
  phone: string;
  email?: string | null;
  role: UserRole;
  village?: string;
  district?: string;
  businessName?: string;
  preferredLanguage?: Language;
  preferredCrops?: string[];
  mobileVerified?: boolean;
  emailVerified?: boolean;
  googleConnected?: boolean;
}

interface AppContextType {
  role: UserRole;
  setRole: (role: UserRole) => void;
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (identifier: string, password?: string, role?: string, method?: 'mobile' | 'email') => Promise<{ success: boolean; role?: UserRole; error?: string }>;
  socialLogin: (data: { provider: string; email?: string; name?: string; phone?: string; role?: string }) => Promise<{ success: boolean; role?: UserRole; error?: string }>;
  register: (data: any) => Promise<{ success: boolean; role?: UserRole; error?: string }>;
  updateUserProfile: (updates: Partial<AuthUser>) => Promise<{ success: boolean; error?: string }>;
  deleteAccount: (passwordOrMobile: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  requestLogout: (onLoggedOut?: () => void) => void;
  simpleMode: boolean;
  setSimpleMode: (enabled: boolean) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  listings: ProduceListing[];
  addListing: (listing: Omit<ProduceListing, 'id' | 'createdAt' | 'bidsCount' | 'status'>) => void;
  bids: Bid[];
  addBid: (bid: Omit<Bid, 'id' | 'createdAt' | 'status'>) => void;
  acceptBid: (bidId: string) => void;
  rejectBid: (bidId: string) => void;
  cancelBid: (bidId: string) => void;
  completeBid: (bidId: string) => void;
  sales: SaleTransaction[];
  mandiPrices: MandiPrice[];
  toasts: ToastMessage[];
  addToast: (toast: Omit<ToastMessage, 'id'>) => void;
  removeToast: (id: string) => void;
  confirmationState: ConfirmationModalState;
  showConfirmation: (options: {
    title?: string;
    message?: string;
    confirmText?: string;
    cancelText?: string;
    type?: 'warning' | 'problem' | 'info' | 'success';
    onConfirm: () => void | Promise<void>;
    onCancel?: () => void;
  }) => void;
  hideConfirmation: () => void;
  showFarmerError: (error: unknown) => void;
  sihDemo: SihDemoState;
  selectSihDemoBuyer: (buyerId: string) => Promise<void>;
  simulateSihBuyerCancel: () => Promise<void>;
  confirmSihBackupSale: () => Promise<void>;
  resetSihDemo: () => void;
}

export interface SihDemoBuyer {
  id: string;
  code: 'Buyer A' | 'Buyer B' | 'Buyer C';
  name: string;
  company: string;
  location: string;
  distanceKm: number;
  rating: number;
  bidPricePerUnit: number;
  totalAmount: number;
  paymentTerms: string;
  pickupDate: string;
  status: 'pending' | 'selected' | 'cancelled' | 'backup' | 'confirmed';
}

export interface SihDemoReceipt {
  receiptNumber: string;
  weighmentSlipId: string;
  saleDate: string;
  farmerName: string;
  village: string;
  buyerName: string;
  buyerCompany: string;
  cropName: string;
  quantity: number;
  unit: string;
  finalPricePerUnit: number;
  totalAmount: number;
  paymentMethod: string;
  upiRef: string;
}

export interface SihDemoState {
  farmerName: string;
  village: string;
  cropName: string;
  variety: string;
  quantity: number;
  unit: string;
  currentMarketPrice: number;
  aiPriceMin: number;
  aiPriceMax: number;
  selectedBuyerId: string | null;
  stage: 'bids_open' | 'buyer_selected' | 'buyer_cancelled' | 'backup_offered' | 'sale_completed';
  buyers: SihDemoBuyer[];
  completedSaleReceipt: SihDemoReceipt | null;
  isLoading: boolean;
}


export const sihDemoMandiPrice: MandiPrice = {
  id: 'mandi-salem-tomato',
  cropName: 'Tomato (தக்காளி / देशी टमाटर)',
  variety: 'Hybrid / Shivam',
  mandiName: 'Salem Regulated Market (APMC)',
  district: 'Salem',
  minPrice: 22,
  modalPrice: 24,
  maxPrice: 26,
  unit: 'kg',
  trend: 'stable',
  changePercent: 2.1,
  lastUpdated: 'Today, 08:30 AM',
  historicalTrend: [
    { day: 'Mon', price: 23 },
    { day: 'Tue', price: 23 },
    { day: 'Wed', price: 24 },
    { day: 'Thu', price: 24 },
    { day: 'Fri', price: 24 },
    { day: 'Sat', price: 24 }
  ]
};

export const sihDemoListing: ProduceListing = {
  id: 'sih-demo-ravi-salem',
  cropKey: 'tomato',
  cropName: 'Tomato (நாட்டு தக்காளி / देशी टमाटर)',
  cropTamilName: 'நாட்டு தக்காளி',
  cropHindiName: 'देशी टमाटर',
  variety: 'Shivam Hybrid Grade A',
  quantity: 500,
  unit: 'kg',
  grade: 'Grade A',
  qualityLabel: 'Very Good',
  basePriceExpected: 25,
  aiRecommendedPriceMin: 24,
  aiRecommendedPriceMax: 27,
  harvestDate: '2026-09-24',
  availableDate: 'Ready for Pickup (Today)',
  listingDate: '2026-09-24',
  location: 'Salem',
  district: 'Salem',
  distanceKm: 4,
  farmerName: 'Ravi',
  farmerPhone: '+91 98421 99001',
  status: 'negotiating',
  bidsCount: 3,
  createdAt: '2026-09-24T06:00:00Z',
  kioskAssisted: true,
  imageUrl: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600&auto=format&fit=crop&q=80',
  notes: 'Fresh harvest tomatoes from Salem ready for direct pickup.'
};

export const sihDemoBids: Bid[] = [
  {
    id: 'sih-bid-buyer-a',
    listingId: 'sih-demo-ravi-salem',
    cropName: 'Tomato (நாட்டு தக்காளி)',
    buyerName: 'Buyer A (Salem Fresh Mart)',
    buyerCompany: 'Salem Agro Fresh Procure',
    buyerPhone: '+91 98401 22334',
    buyerRating: 4.8,
    bidPricePerUnit: 25,
    requestedQuantity: 500,
    totalAmount: 12500,
    offeredPickupDate: 'Today by 3:00 PM',
    pickupPreference: 'Buyer Pickup from Farm Gate',
    paymentTerms: 'Immediate UPI',
    status: 'pending',
    createdAt: '2026-09-24T07:15:00Z',
    notes: 'Direct farm-gate collection with immediate UPI payment.'
  },
  {
    id: 'sih-bid-buyer-b',
    listingId: 'sih-demo-ravi-salem',
    cropName: 'Tomato (நாட்டு தக்காளி)',
    buyerName: 'Buyer B (Kovai Wholesale Aggregator)',
    buyerCompany: 'Kovai Agri Logistics Ltd',
    buyerPhone: '+91 98422 66778',
    buyerRating: 4.9,
    bidPricePerUnit: 27,
    requestedQuantity: 500,
    totalAmount: 13500,
    offeredPickupDate: 'Today by 5:00 PM',
    pickupPreference: 'Buyer Pickup from Farm Gate',
    paymentTerms: 'Immediate UPI',
    status: 'pending',
    createdAt: '2026-09-24T07:30:00Z',
    notes: 'Top offer matching highest AI fair price band (₹27/kg).'
  },
  {
    id: 'sih-bid-buyer-c',
    listingId: 'sih-demo-ravi-salem',
    cropName: 'Tomato (நாட்டு தக்காளி)',
    buyerName: 'Buyer C (Nilgiris Retail Hub)',
    buyerCompany: 'Nilgiris Fresh Produce Chain',
    buyerPhone: '+91 94433 88990',
    buyerRating: 4.7,
    bidPricePerUnit: 26,
    requestedQuantity: 500,
    totalAmount: 13000,
    offeredPickupDate: 'Tomorrow 7:30 AM',
    pickupPreference: 'Kiosk Center Dropoff',
    paymentTerms: 'Immediate UPI',
    status: 'pending',
    createdAt: '2026-09-24T07:45:00Z',
    notes: 'Eligible secondary backup buyer with guaranteed immediate settlement.'
  }
];

export const createInitialSihDemoState = (): SihDemoState => ({
  farmerName: 'Ravi',
  village: 'Salem',
  cropName: 'Tomato',
  variety: 'Shivam Hybrid Grade A',
  quantity: 500,
  unit: 'kg',
  currentMarketPrice: 24,
  aiPriceMin: 24,
  aiPriceMax: 27,
  selectedBuyerId: null,
  stage: 'bids_open',
  buyers: [
    {
      id: 'demo-buyer-a',
      code: 'Buyer A',
      name: 'Salem Fresh Mart (Anand M.)',
      company: 'Salem Agro Fresh Procure',
      location: 'Salem Town',
      distanceKm: 6,
      rating: 4.8,
      bidPricePerUnit: 25,
      totalAmount: 12500,
      paymentTerms: 'Immediate UPI',
      pickupDate: 'Today by 3:00 PM',
      status: 'pending'
    },
    {
      id: 'demo-buyer-b',
      code: 'Buyer B',
      name: 'Kovai Wholesale Aggregator (Suresh V.)',
      company: 'Kovai Agri Logistics Ltd',
      location: 'Salem Bypass Yard',
      distanceKm: 18,
      rating: 4.9,
      bidPricePerUnit: 27,
      totalAmount: 13500,
      paymentTerms: 'Immediate UPI',
      pickupDate: 'Today by 5:00 PM',
      status: 'pending'
    },
    {
      id: 'demo-buyer-c',
      code: 'Buyer C',
      name: 'Nilgiris Retail Hub (Meenakshi S.)',
      company: 'Nilgiris Fresh Produce Chain',
      location: 'Attur, Salem District',
      distanceKm: 25,
      rating: 4.7,
      bidPricePerUnit: 26,
      totalAmount: 13000,
      paymentTerms: 'Immediate UPI',
      pickupDate: 'Tomorrow 7:30 AM',
      status: 'pending'
    }
  ],
  completedSaleReceipt: null,
  isLoading: false,
});

const initialMandiPrices: MandiPrice[] = [
  sihDemoMandiPrice,
  {
    id: 'mandi-1',
    cropName: 'Tomato (தக்காளி)',
    variety: 'Hybrid / Shivam',
    mandiName: 'Oddanchatram Market',
    district: 'Dindigul',
    minPrice: 28,
    modalPrice: 34,
    maxPrice: 38,
    unit: 'kg',
    trend: 'up',
    changePercent: 6.25,
    lastUpdated: 'Today, 07:30 AM',
    historicalTrend: [
      { day: 'Mon', price: 26 },
      { day: 'Tue', price: 28 },
      { day: 'Wed', price: 31 },
      { day: 'Thu', price: 30 },
      { day: 'Fri', price: 33 },
      { day: 'Sat', price: 34 }
    ]
  },
  {
    id: 'mandi-2',
    cropName: 'Small Onion (சின்ன வெங்காயம்)',
    variety: 'CO-4 / Country',
    mandiName: 'Dharapuram Mandi',
    district: 'Tiruppur',
    minPrice: 48,
    modalPrice: 56,
    maxPrice: 62,
    unit: 'kg',
    trend: 'up',
    changePercent: 8.5,
    lastUpdated: 'Today, 08:00 AM',
    historicalTrend: [
      { day: 'Mon', price: 44 },
      { day: 'Tue', price: 47 },
      { day: 'Wed', price: 50 },
      { day: 'Thu', price: 52 },
      { day: 'Fri', price: 54 },
      { day: 'Sat', price: 56 }
    ]
  },
  {
    id: 'mandi-3',
    cropName: 'Green Chilli (பச்சை மிளகாய்)',
    variety: 'G-4 / Teja',
    mandiName: 'Koyambedu Wholesale',
    district: 'Chennai',
    minPrice: 42,
    modalPrice: 49,
    maxPrice: 55,
    unit: 'kg',
    trend: 'stable',
    changePercent: 0.0,
    lastUpdated: 'Today, 06:45 AM',
    historicalTrend: [
      { day: 'Mon', price: 50 },
      { day: 'Tue', price: 48 },
      { day: 'Wed', price: 49 },
      { day: 'Thu', price: 49 },
      { day: 'Fri', price: 48 },
      { day: 'Sat', price: 49 }
    ]
  },
  {
    id: 'mandi-4',
    cropName: 'Potato (உருளைக்கிழங்கு)',
    variety: 'Kufri Jyoti',
    mandiName: 'Mettupalayam Agro Center',
    district: 'Coimbatore',
    minPrice: 22,
    modalPrice: 26,
    maxPrice: 30,
    unit: 'kg',
    trend: 'down',
    changePercent: -3.7,
    lastUpdated: 'Today, 07:15 AM',
    historicalTrend: [
      { day: 'Mon', price: 29 },
      { day: 'Tue', price: 28 },
      { day: 'Wed', price: 28 },
      { day: 'Thu', price: 27 },
      { day: 'Fri', price: 26 },
      { day: 'Sat', price: 26 }
    ]
  },
  {
    id: 'mandi-5',
    cropName: 'Cotton (பருத்தி)',
    variety: 'MCU-5 Premium',
    mandiName: 'Salem Regulated Market',
    district: 'Salem',
    minPrice: 7100,
    modalPrice: 7450,
    maxPrice: 7800,
    unit: 'quintal',
    trend: 'up',
    changePercent: 4.1,
    lastUpdated: 'Today, 09:00 AM',
    historicalTrend: [
      { day: 'Mon', price: 7100 },
      { day: 'Tue', price: 7200 },
      { day: 'Wed', price: 7300 },
      { day: 'Thu', price: 7350 },
      { day: 'Fri', price: 7400 },
      { day: 'Sat', price: 7450 }
    ]
  }
];

const initialListings: ProduceListing[] = [
  sihDemoListing,
  {
    id: 'list-101',
    cropKey: 'tomato',
    cropName: 'Tomato (நாட்டு தக்காளி)',
    cropTamilName: 'நாட்டு தக்காளி',
    cropHindiName: 'देशी टमाटर',
    variety: 'Shivam Hybrid',
    quantity: 450,
    unit: 'kg',
    grade: 'Grade A',
    qualityLabel: 'Very Good',
    basePriceExpected: 32,
    aiRecommendedPriceMin: 32,
    aiRecommendedPriceMax: 37,
    harvestDate: '2026-09-22',
    availableDate: 'Ready for Pickup (Today)',
    listingDate: '2026-09-22',
    location: 'Oddanchatram West',
    district: 'Dindigul',
    distanceKm: 8,
    farmerName: 'Murugesan Pandian',
    farmerPhone: '+91 98421 77312',
    status: 'negotiating',
    bidsCount: 2,
    createdAt: '2026-09-22T06:30:00Z',
    kioskAssisted: true,
    imageUrl: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600&auto=format&fit=crop&q=80',
    notes: 'Firm red tomatoes graded at village kiosk, suitable for transport.'
  },
  {
    id: 'list-102',
    cropKey: 'onion',
    cropName: 'Small Shallot Onion (சின்ன வெங்காயம்)',
    cropTamilName: 'சின்ன வெங்காயம்',
    cropHindiName: 'छोटा प्याज (सांभर प्याज)',
    variety: 'CO-4 Country Select',
    quantity: 35,
    unit: 'quintal',
    grade: 'Grade A',
    qualityLabel: 'Premium',
    basePriceExpected: 52,
    aiRecommendedPriceMin: 52,
    aiRecommendedPriceMax: 58,
    harvestDate: '2026-09-21',
    availableDate: 'Tomorrow Morning',
    listingDate: '2026-09-21',
    location: 'Dharapuram South',
    district: 'Tiruppur',
    distanceKm: 14,
    farmerName: 'Kuppusamy R.',
    farmerPhone: '+91 97883 45120',
    status: 'active',
    bidsCount: 1,
    createdAt: '2026-09-21T11:00:00Z',
    kioskAssisted: false,
    imageUrl: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=600&auto=format&fit=crop&q=80',
    notes: 'Well-cured sun-dried shallots in standard 50kg gunny bags.'
  },
  {
    id: 'list-103',
    cropKey: 'potato',
    cropName: 'Potato (உருளைக்கிழங்கு)',
    cropTamilName: 'உருளைக்கிழங்கு',
    cropHindiName: 'आलू',
    variety: 'Kufri Jyoti Hill Special',
    quantity: 80,
    unit: 'bags',
    grade: 'Grade A',
    qualityLabel: 'Good',
    basePriceExpected: 24,
    aiRecommendedPriceMin: 23,
    aiRecommendedPriceMax: 27,
    harvestDate: '2026-09-20',
    availableDate: 'Immediate',
    listingDate: '2026-09-20',
    location: 'Mettupalayam Foothills',
    district: 'Coimbatore',
    distanceKm: 28,
    farmerName: 'Nagarajan P.',
    farmerPhone: '+91 94435 67210',
    status: 'active',
    bidsCount: 1,
    createdAt: '2026-09-20T09:30:00Z',
    kioskAssisted: true,
    imageUrl: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=600&auto=format&fit=crop&q=80',
    notes: 'Clean skin, sorted medium-large tubers.'
  },
  {
    id: 'list-104',
    cropKey: 'paddy',
    cropName: 'Paddy / Rice (நெல்)',
    cropTamilName: 'பொன்னி நெல்',
    cropHindiName: 'धान (बासमती / सोना मसूरी)',
    variety: 'BPT 5204 Andhra Ponni',
    quantity: 120,
    unit: 'bags',
    grade: 'Grade A',
    qualityLabel: 'Premium',
    basePriceExpected: 2350,
    aiRecommendedPriceMin: 2300,
    aiRecommendedPriceMax: 2480,
    harvestDate: '2026-09-19',
    availableDate: 'Within 2 Days',
    listingDate: '2026-09-19',
    location: 'Thanjavur Delta Road',
    district: 'Thanjavur',
    distanceKm: 42,
    farmerName: 'Venkatesan T.',
    farmerPhone: '+91 98425 11980',
    status: 'active',
    bidsCount: 0,
    createdAt: '2026-09-19T14:15:00Z',
    kioskAssisted: true,
    imageUrl: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&auto=format&fit=crop&q=80',
    notes: 'Moisture content tested at 13.5% at village cooperative kiosk.'
  },
  {
    id: 'list-105',
    cropKey: 'banana',
    cropName: 'Banana G-9 (வாழைத்தண்டு & காய்)',
    cropTamilName: 'நேந்திரன் வாழைக்காய்',
    cropHindiName: 'केला (जी-९ वैरायटी)',
    variety: 'Grand Naine Raw Bunches',
    quantity: 350,
    unit: 'kg',
    grade: 'Grade A',
    qualityLabel: 'Very Good',
    basePriceExpected: 22,
    aiRecommendedPriceMin: 21,
    aiRecommendedPriceMax: 25,
    harvestDate: '2026-09-22',
    availableDate: 'Ready for Cut Today',
    listingDate: '2026-09-22',
    location: 'Pollachi Canal Side',
    district: 'Coimbatore',
    distanceKm: 19,
    farmerName: 'Subramanian V.',
    farmerPhone: '+91 97890 23411',
    status: 'active',
    bidsCount: 1,
    createdAt: '2026-09-22T08:00:00Z',
    kioskAssisted: false,
    imageUrl: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=600&auto=format&fit=crop&q=80',
    notes: 'Unblemished 35-40 day mature bunches ready for direct harvest.'
  }
];

const initialBids: Bid[] = [
  ...sihDemoBids,
  {
    id: 'bid-201',
    listingId: 'list-101',
    cropName: 'Tomato (நாட்டு தக்காளி)',
    buyerName: 'Ramesh K. (FreshBasket Retail)',
    buyerCompany: 'FreshBasket Hypermarket',
    buyerPhone: '+91 98402 88910',
    buyerRating: 4.8,
    bidPricePerUnit: 35,
    requestedQuantity: 450,
    totalAmount: 15750,
    offeredPickupDate: 'Today by 4:00 PM',
    pickupPreference: 'Buyer Pickup from Farm Gate',
    paymentTerms: 'Immediate UPI',
    status: 'pending',
    createdAt: '2026-09-22T07:45:00Z',
    notes: 'Can send refrigerated pickup vehicle directly to your village farm gate.'
  },
  {
    id: 'bid-202',
    listingId: 'list-101',
    cropName: 'Tomato (நாட்டு தக்காளி)',
    buyerName: 'Selvaraj (Uzhavar Mandi Aggregator)',
    buyerCompany: 'Uzhavar Agro Procure',
    buyerPhone: '+91 94421 55678',
    buyerRating: 4.6,
    bidPricePerUnit: 34,
    requestedQuantity: 450,
    totalAmount: 15300,
    offeredPickupDate: 'Tomorrow Morning 7:00 AM',
    pickupPreference: 'Kiosk Center Dropoff',
    paymentTerms: 'Immediate UPI',
    status: 'pending',
    createdAt: '2026-09-22T08:00:00Z',
    notes: 'Weighment at village kiosk weighing scale.'
  },
  {
    id: 'bid-203',
    listingId: 'list-102',
    cropName: 'Small Shallot Onion (சின்ன வெங்காயம்)',
    buyerName: 'Vignesh Traders',
    buyerCompany: 'Kovai Wholesale Hub',
    buyerPhone: '+91 96291 33452',
    buyerRating: 4.9,
    bidPricePerUnit: 55,
    requestedQuantity: 35,
    totalAmount: 192500,
    offeredPickupDate: 'Tomorrow 9:00 AM',
    pickupPreference: 'Buyer Pickup from Farm Gate',
    paymentTerms: 'Bank Transfer on Weighment',
    status: 'pending',
    createdAt: '2026-09-22T08:30:00Z',
    notes: 'Ready to procure full 35 quintals in single pickup.'
  },
  {
    id: 'bid-204',
    listingId: 'list-103',
    cropName: 'Potato (உருளைக்கிழங்கு)',
    buyerName: 'Nilgiris Food Processing Co.',
    buyerCompany: 'Nilgiris Agro Ltd',
    buyerPhone: '+91 94423 88102',
    buyerRating: 4.7,
    bidPricePerUnit: 25,
    requestedQuantity: 80,
    totalAmount: 2000,
    offeredPickupDate: 'Tomorrow Afternoon',
    pickupPreference: 'Buyer Pickup from Farm Gate',
    paymentTerms: 'Immediate UPI',
    status: 'accepted',
    createdAt: '2026-09-21T14:20:00Z',
    notes: 'Deal accepted by farmer. Ready for pickup dispatch.'
  },
  {
    id: 'bid-205',
    listingId: 'list-105',
    cropName: 'Banana G-9 (வாழைத்தண்டு & காய்)',
    buyerName: 'Southern Fruit Exporters',
    buyerCompany: 'South Export Hub',
    buyerPhone: '+91 98401 77211',
    buyerRating: 4.5,
    bidPricePerUnit: 23,
    requestedQuantity: 350,
    totalAmount: 8050,
    offeredPickupDate: '2026-09-21',
    pickupPreference: 'Buyer Pickup from Farm Gate',
    paymentTerms: 'Bank Transfer on Weighment',
    status: 'completed',
    createdAt: '2026-09-20T10:15:00Z',
    notes: 'Weighment slip verified and payment disbursed.'
  },
  {
    id: 'bid-206',
    listingId: 'list-101',
    cropName: 'Tomato (நாட்டு தக்காளி)',
    buyerName: 'Delta Mandi Agent',
    buyerCompany: 'Delta Traders',
    buyerPhone: '+91 97891 00214',
    buyerRating: 4.2,
    bidPricePerUnit: 29,
    requestedQuantity: 200,
    totalAmount: 5800,
    offeredPickupDate: 'Yesterday',
    pickupPreference: 'Farmer Delivery to Hub',
    paymentTerms: 'Cash at Kiosk',
    status: 'rejected',
    createdAt: '2026-09-21T06:00:00Z',
    notes: 'Offer was below farmer fair threshold.'
  },
  {
    id: 'bid-207',
    listingId: 'list-104',
    cropName: 'Paddy / Rice (நெல்)',
    buyerName: 'Ponni Modern Rice Mill',
    buyerCompany: 'Modern Agro Industries',
    buyerPhone: '+91 94431 44520',
    buyerRating: 4.6,
    bidPricePerUnit: 2280,
    requestedQuantity: 120,
    totalAmount: 273600,
    offeredPickupDate: '2026-09-20',
    pickupPreference: 'Buyer Pickup from Farm Gate',
    paymentTerms: 'Bank Transfer on Weighment',
    status: 'cancelled',
    createdAt: '2026-09-20T11:00:00Z',
    notes: 'Buyer cancelled due to warehouse capacity schedule.'
  }
];

const initialSales: SaleTransaction[] = [
  {
    id: 'sale-301',
    listingId: 'list-098',
    cropName: 'Banana G-9 (வாழைக்காய்)',
    farmerName: 'Murugesan Pandian',
    buyerName: 'Coimbatore Fruit Mart',
    quantity: 250,
    unit: 'kg',
    finalPricePerUnit: 22,
    totalValue: 5500,
    saleDate: '2026-09-18',
    paymentStatus: 'paid',
    receiptNumber: 'FG-SL-2026-0918',
    weighmentSlipId: 'WGH-8902'
  },
  {
    id: 'sale-302',
    listingId: 'list-095',
    cropName: 'Red Lady Papaya (பப்பாளி)',
    farmerName: 'Murugesan Pandian',
    buyerName: 'Southern Agro Exports',
    quantity: 400,
    unit: 'kg',
    finalPricePerUnit: 18,
    totalValue: 7200,
    saleDate: '2026-09-12',
    paymentStatus: 'paid',
    receiptNumber: 'FG-SL-2026-0912',
    weighmentSlipId: 'WGH-8721'
  }
];

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [role, setRoleState] = useState<UserRole>(() => {
    const saved = localStorage.getItem('farmgrade_user');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed?.role) return parsed.role;
      } catch {}
    }
    return 'farmer';
  });
  const [language, setLanguageState] = useState<Language>(() => {
    const savedLang = localStorage.getItem('farmgrade_language');
    if (savedLang === 'en' || savedLang === 'ta' || savedLang === 'hi') {
      return savedLang;
    }
    const savedUser = localStorage.getItem('farmgrade_user');
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        if (
          parsed?.preferredLanguage === 'en' ||
          parsed?.preferredLanguage === 'ta' ||
          parsed?.preferredLanguage === 'hi'
        ) {
          return parsed.preferredLanguage;
        }
      } catch {}
    }
    return 'en';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('farmgrade_language', lang);
    localStorage.setItem('farmgrade_language_explicit', 'true');
    if (typeof document !== 'undefined') {
      document.documentElement.lang = lang;
    }
    setUser((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, preferredLanguage: lang };
      localStorage.setItem('farmgrade_user', JSON.stringify(updated));
      return updated;
    });
    api.auth.updateProfile({ preferredLanguage: lang }).catch(() => {});
  };

  // Synchronize HTML lang attribute and run reversible DOM localization across all pages/modals
  useEffect(() => {
    if (typeof document === 'undefined') return;
    document.documentElement.lang = language;

    let rafId: number | null = null;
    let isApplying = false;

    const runLocalization = () => {
      if (isApplying) return;
      isApplying = true;
      try {
        applyDomLocalization(document.body, language);
      } finally {
        isApplying = false;
      }
    };

    runLocalization();

    const observer = new MutationObserver(() => {
      if (isApplying) return;
      if (rafId !== null) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        runLocalization();
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true,
    });

    return () => {
      observer.disconnect();
      if (rafId !== null) cancelAnimationFrame(rafId);
    };
  }, [language]);

  // Core Data States
  const [listings, setListings] = useState<ProduceListing[]>(initialListings);
  const [bids, setBids] = useState<Bid[]>(initialBids);
  const [sales, setSales] = useState<SaleTransaction[]>(initialSales);
  const [mandiPrices, setMandiPrices] = useState<MandiPrice[]>(initialMandiPrices);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const t = (key: string): string => {
    if (!key) return '';
    if (translations[language]?.[key]) return translations[language][key];
    const translated = translateText(key, language);
    if (translated && translated !== key) return translated;
    if (translations.en[key]) return translations.en[key];
    // Fallback safety: never display raw dot-separated keys like "produce.add_button"
    if (/^[a-z0-9_]+(\.[a-z0-9_]+)+$/i.test(key)) {
      const lastSegment = key.split('.').pop() || key;
      return lastSegment.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
    }
    return key;
  };

  const addToast = (toast: Omit<ToastMessage, 'id'>) => {
    const id = 'toast-' + Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { ...toast, id }]);
    const duration = toast.duration || (toast.actionLabel ? 7000 : 5000);
    setTimeout(() => {
      setToasts((prev) => prev.filter((item) => item.id !== id));
    }, duration);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((item) => item.id !== id));
  };

  const addListing = async (newListingData: Omit<ProduceListing, 'id' | 'createdAt' | 'bidsCount' | 'status'>) => {
    const localId = 'list-' + (listings.length + 101);
    const newListing: ProduceListing = {
      ...newListingData,
      id: localId,
      status: 'active',
      bidsCount: 0,
      createdAt: new Date().toISOString()
    };
    setListings((prev) => [newListing, ...prev]);

    try {
      await api.produce.create({
        cropName: newListingData.cropName.split('(')[0].trim(),
        quantity: newListingData.quantity,
        unit: newListingData.unit,
        quality: newListingData.qualityLabel || newListingData.grade,
        village: newListingData.location,
        availableDate: newListingData.availableDate || newListingData.harvestDate,
        expectedPrice: newListingData.basePriceExpected,
        suggestedMinPrice: newListingData.aiRecommendedPriceMin,
        suggestedMaxPrice: newListingData.aiRecommendedPriceMax,
        notes: newListingData.notes
      });
    } catch (apiErr) {
      console.warn('API sync produced fallback:', apiErr);
    }

    addToast(farmerNotifications.produceAdded(language));
  };

  // Authentication State
  const [token, setToken] = useState<string | null>(() => {
    if (localStorage.getItem('farmgrade_logged_out') === 'true') {
      return null;
    }
    return localStorage.getItem('farmgrade_token') || 'demo-farmer-murugan-101';
  });

  const [user, setUser] = useState<AuthUser | null>(() => {
    if (localStorage.getItem('farmgrade_logged_out') === 'true') {
      return null;
    }
    const saved = localStorage.getItem('farmgrade_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }
    return {
      id: 1,
      name: 'Murugan Selvam',
      phone: '9842177312',
      role: 'farmer',
    };
  });

  // Simple Mode for Rural Farmers
  const [simpleMode, setSimpleModeState] = useState<boolean>(() => {
    return localStorage.getItem('farmgrade_simple_mode') === 'true';
  });

  const setSimpleMode = (val: boolean) => {
    setSimpleModeState(val);
    localStorage.setItem('farmgrade_simple_mode', String(val));
    addToast({
      type: 'info',
      title:
        language === 'ta'
          ? val
            ? 'எளிய முறை இயக்கப்பட்டது'
            : 'சாதாரண முறை இயக்கப்பட்டது'
          : language === 'hi'
          ? val
            ? 'सरल मोड चालू किया गया'
            : 'विस्तृत मोड चालू किया गया'
          : val
          ? 'Simple Mode Activated'
          : 'Detailed Mode Activated',
      message:
        language === 'ta'
          ? val
            ? 'பெரிய பொத்தான்கள் மற்றும் எளிய வழிசெலுத்தல் இப்போது செயலில் உள்ளன.'
            : 'முழு விவரங்கள் மற்றும் பகுப்பாய்வுக் கருவிகள் மீண்டும் காட்டப்படுகின்றன.'
          : language === 'hi'
          ? val
            ? 'बड़े बटन, वॉइस सहायता और सरल नेविगेशन अब चालू हैं।'
            : 'मानक उपकरण और विस्तृत विश्लेषण बहाल किए गए।'
          : val
          ? 'Large buttons, voice prompts, and simplified navigation are now enabled.'
          : 'Standard advanced tools and detailed analytics restored.',
    });
  };

  const setRole = (newRole: UserRole) => {
    setRoleState(newRole);
    if (user) {
      const roleDefaultName =
        newRole === 'farmer'
          ? 'Murugan Selvam'
          : newRole === 'buyer'
          ? 'Ramesh Kumar'
          : 'Admin';
      const updated = { ...user, role: newRole, name: roleDefaultName };
      setUser(updated);
      localStorage.setItem('farmgrade_user', JSON.stringify(updated));
      const demoToken = `demo-${newRole}`;
      setToken(demoToken);
      localStorage.setItem('farmgrade_token', demoToken);
      localStorage.removeItem('farmgrade_logged_out');
    }
  };

  const login = async (identifier: string, password?: string, userRole?: string, method?: 'mobile' | 'email') => {
    try {
      const res = await api.auth.login(identifier, password, userRole, method);
      if (res.success && res.data) {
        const savedLang = localStorage.getItem('farmgrade_language');
        const prefLang: Language =
          savedLang === 'ta' || savedLang === 'hi' || savedLang === 'en'
            ? savedLang
            : res.data.user.preferredLanguage === 'ta' ||
              res.data.user.preferredLanguage === 'hi' ||
              res.data.user.preferredLanguage === 'en'
            ? res.data.user.preferredLanguage
            : language;
        const u: AuthUser = {
          id: res.data.user.id,
          name: res.data.user.name,
          phone: res.data.user.phone,
          email: res.data.user.email,
          role: res.data.user.role,
          village: res.data.user.village,
          district: res.data.user.district,
          businessName: res.data.user.businessName,
          preferredLanguage: prefLang,
          preferredCrops: res.data.user.preferredCrops,
          mobileVerified: Boolean(res.data.user.mobileVerified ?? res.data.user.phone),
          emailVerified: Boolean(res.data.user.emailVerified ?? res.data.user.email),
          googleConnected: Boolean(res.data.user.googleConnected),
        };
        localStorage.removeItem('farmgrade_logged_out');
        localStorage.setItem('farmgrade_last_active', String(Date.now()));
        setUser(u);
        setRoleState(u.role);
        setLanguageState(prefLang);
        localStorage.setItem('farmgrade_language', prefLang);
        setToken(res.data.token);
        localStorage.setItem('farmgrade_token', res.data.token);
        localStorage.setItem('farmgrade_user', JSON.stringify(u));
        return { success: true, role: u.role };
      }
      return { success: false, error: 'Your email/mobile number or password is incorrect.' };
    } catch (err: any) {
      const msg = String(err?.message || '');
      if (msg.includes('Failed to fetch') || msg.includes('NetworkError')) {
        return {
          success: false,
          error: 'Your internet connection seems weak. Please try again.',
        };
      }
      if (
        msg.includes('valid mobile') ||
        msg.includes('valid email') ||
        msg.includes('incorrect') ||
        msg.includes("couldn't sign you in")
      ) {
        return { success: false, error: msg };
      }
      return {
        success: false,
        error: 'Your email/mobile number or password is incorrect.',
      };
    }
  };

  const socialLogin = async (data: {
    provider: string;
    email?: string;
    name?: string;
    phone?: string;
    role?: string;
  }) => {
    try {
      const res = await api.auth.socialLogin(data);
      if (res.success && res.data) {
        const savedLang = localStorage.getItem('farmgrade_language');
        const prefLang: Language =
          savedLang === 'ta' || savedLang === 'hi' || savedLang === 'en'
            ? savedLang
            : res.data.user.preferredLanguage === 'ta' ||
              res.data.user.preferredLanguage === 'hi' ||
              res.data.user.preferredLanguage === 'en'
            ? res.data.user.preferredLanguage
            : language;
        const u: AuthUser = {
          id: res.data.user.id,
          name: res.data.user.name,
          phone: res.data.user.phone,
          email: res.data.user.email,
          role: res.data.user.role,
          village: res.data.user.village,
          district: res.data.user.district,
          businessName: res.data.user.businessName,
          preferredLanguage: prefLang,
          preferredCrops: res.data.user.preferredCrops,
          mobileVerified: Boolean(res.data.user.mobileVerified ?? res.data.user.phone),
          emailVerified: Boolean(res.data.user.emailVerified ?? res.data.user.email),
          googleConnected: true,
        };
        localStorage.removeItem('farmgrade_logged_out');
        localStorage.setItem('farmgrade_last_active', String(Date.now()));
        setUser(u);
        setRoleState(u.role);
        setLanguageState(prefLang);
        localStorage.setItem('farmgrade_language', prefLang);
        setToken(res.data.token);
        localStorage.setItem('farmgrade_token', res.data.token);
        localStorage.setItem('farmgrade_user', JSON.stringify(u));
        return { success: true, role: u.role };
      }
      return { success: false, error: 'Google sign-in could not be completed. Please try again.' };
    } catch {
      return { success: false, error: 'Google sign-in could not be completed. Please try again.' };
    }
  };

  const register = async (data: any) => {
    try {
      const res = await api.auth.register(data);
      if (res.success && res.data) {
        const prefLang: Language =
          data.preferredLanguage === 'ta' ||
          data.preferredLanguage === 'hi' ||
          data.preferredLanguage === 'en'
            ? data.preferredLanguage
            : res.data.user.preferredLanguage === 'ta' ||
              res.data.user.preferredLanguage === 'hi' ||
              res.data.user.preferredLanguage === 'en'
            ? res.data.user.preferredLanguage
            : language;
        const u: AuthUser = {
          id: res.data.user.id,
          name: res.data.user.name,
          phone: res.data.user.phone,
          email: res.data.user.email,
          role: res.data.user.role,
          village: data.village || res.data.user.village,
          district: data.district || res.data.user.district,
          businessName: data.businessName || res.data.user.businessName,
          preferredLanguage: prefLang,
          preferredCrops: data.preferredCrops || res.data.user.preferredCrops,
          mobileVerified: Boolean(res.data.user.phone),
          emailVerified: Boolean(res.data.user.email),
          googleConnected: false,
        };
        localStorage.removeItem('farmgrade_logged_out');
        localStorage.setItem('farmgrade_last_active', String(Date.now()));
        setUser(u);
        setRoleState(u.role);
        setLanguageState(prefLang);
        localStorage.setItem('farmgrade_language', prefLang);
        setToken(res.data.token);
        localStorage.setItem('farmgrade_token', res.data.token);
        localStorage.setItem('farmgrade_user', JSON.stringify(u));
        return { success: true, role: u.role };
      }
      return { success: false, error: "We couldn't sign you in. Please try again." };
    } catch (err: any) {
      const msg = String(err?.message || '');
      if (msg.includes('Failed to fetch') || msg.includes('NetworkError')) {
        return {
          success: false,
          error: 'Your internet connection seems weak. Please try again.',
        };
      }
      if (
        msg.includes('already exists') ||
        msg.includes('valid mobile') ||
        msg.includes('valid email') ||
        msg.includes('full name')
      ) {
        return { success: false, error: msg };
      }
      return { success: false, error: "We couldn't sign you in. Please try again." };
    }
  };

  const updateUserProfile = async (updates: Partial<AuthUser>) => {
    try {
      const res = await api.auth.updateProfile({
        name: updates.name,
        phone: updates.phone,
        email: updates.email || undefined,
        village: updates.village,
        district: updates.district,
        businessName: updates.businessName,
        preferredLanguage: updates.preferredLanguage,
        preferredCrops: updates.preferredCrops,
      });
      if (res.success && res.data?.user) {
        const updatedUser: AuthUser = {
          ...(user || { id: 1, name: 'User', phone: '', role }),
          ...updates,
          ...res.data.user,
        };
        setUser(updatedUser);
        localStorage.setItem('farmgrade_user', JSON.stringify(updatedUser));
        if (
          updatedUser.preferredLanguage === 'en' ||
          updatedUser.preferredLanguage === 'ta' ||
          updatedUser.preferredLanguage === 'hi'
        ) {
          setLanguageState(updatedUser.preferredLanguage);
          localStorage.setItem('farmgrade_language', updatedUser.preferredLanguage);
        }
        return { success: true };
      }
      return { success: false, error: 'Could not update profile. Please try again.' };
    } catch (err: any) {
      return {
        success: false,
        error: String(err?.message || 'Could not update profile. Please try again.'),
      };
    }
  };

  const deleteAccount = async (passwordOrMobile: string) => {
    try {
      const res = await api.auth.deleteAccount({
        password: passwordOrMobile,
        confirmText: 'DELETE',
      });
      if (res.success) {
        setUser(null);
        setToken(null);
        localStorage.removeItem('farmgrade_token');
        localStorage.removeItem('farmgrade_user');
        localStorage.removeItem('farmgrade_last_active');
        localStorage.setItem('farmgrade_logged_out', 'true');
        try {
          sessionStorage.clear();
        } catch {}
        addToast({
          type: 'info',
          title: 'Your account has been deleted.',
        });
        return { success: true };
      }
      return { success: false, error: 'Your email/mobile number or password is incorrect.' };
    } catch (err: any) {
      return {
        success: false,
        error: String(err?.message || 'Your email/mobile number or password is incorrect.'),
      };
    }
  };

  const logout = async () => {
    try {
      await api.auth.logout();
    } catch {}
    setUser(null);
    setToken(null);
    localStorage.removeItem('farmgrade_token');
    localStorage.removeItem('farmgrade_user');
    localStorage.setItem('farmgrade_logged_out', 'true');
    try {
      sessionStorage.clear();
    } catch {}
    addToast({
      type: 'success',
      title:
        language === 'ta'
          ? 'நீங்கள் வெற்றிகரமாக வெளியேறிவிட்டீர்கள்.'
          : language === 'hi'
          ? 'आप सफलतापूर्वक लॉग आउट हो गए हैं।'
          : 'You have been logged out successfully.',
    });
  };

  const requestLogout = (onLoggedOut?: () => void) => {
    showConfirmation({
      title: t('confirm_logout_title') || 'Are you sure you want to log out?',
      message: '',
      confirmText: t('nav_logout') || 'Logout',
      cancelText: t('confirm_cancel') || 'Cancel',
      type: 'warning',
      onConfirm: async () => {
        await logout();
        if (onLoggedOut) {
          onLoggedOut();
        }
      },
    });
  };

  // Session Management: Track user activity & expire inactive sessions securely (24h window)
  useEffect(() => {
    if (!token || !user) return;
    const INACTIVITY_LIMIT_MS = 24 * 60 * 60 * 1000;
    const lastActive = parseInt(localStorage.getItem('farmgrade_last_active') || '0', 10);
    if (lastActive > 0 && Date.now() - lastActive > INACTIVITY_LIMIT_MS) {
      logout();
      return;
    }
    localStorage.setItem('farmgrade_last_active', String(Date.now()));

    const updateActivity = () => {
      localStorage.setItem('farmgrade_last_active', String(Date.now()));
    };
    window.addEventListener('click', updateActivity, { passive: true });
    window.addEventListener('keydown', updateActivity, { passive: true });
    return () => {
      window.removeEventListener('click', updateActivity);
      window.removeEventListener('keydown', updateActivity);
    };
  }, [token, user]);

  // Fetch initial data from backend API with isolated error handling & actionable dev warnings
  useEffect(() => {
    async function loadBackendData() {
      const defaultCropImages: Record<string, string> = {
        tomato: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600&auto=format&fit=crop&q=80',
        onion: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=600&auto=format&fit=crop&q=80',
        potato: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=600&auto=format&fit=crop&q=80',
        paddy: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&auto=format&fit=crop&q=80',
        banana: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=600&auto=format&fit=crop&q=80',
      };

      // 1. Fetch live produce listings (joined with crops and users)
      try {
        const produceRes = await api.produce.getAll();
        if (produceRes.success && Array.isArray(produceRes.data) && produceRes.data.length > 0) {
          const mappedListings: ProduceListing[] = produceRes.data.map((item: any) => {
            const rawCrop = String(item.cropName || '').toLowerCase();
            const cropKey = (rawCrop.includes('onion')
              ? 'onion'
              : rawCrop.includes('potato')
              ? 'potato'
              : rawCrop.includes('paddy') || rawCrop.includes('rice')
              ? 'paddy'
              : rawCrop.includes('banana')
              ? 'banana'
              : rawCrop.includes('tomato')
              ? 'tomato'
              : 'other') as any;

            const imageUrl = item.photoUrl || defaultCropImages[cropKey] || defaultCropImages.tomato;

            return {
              id: String(item.id),
              cropKey,
              cropName: item.cropName ? `${item.cropName}${item.cropLocalName ? ` (${item.cropLocalName})` : ''}` : 'Produce',
              cropTamilName: item.cropLocalName || undefined,
              variety: item.cropCategory || 'Standard Quality',
              quantity: Number(item.quantity) || 100,
              unit: (item.unit || 'kg') as any,
              grade: (item.quality?.includes('Grade B') ? 'Grade B' : item.quality?.includes('Grade C') ? 'Grade C' : 'Grade A') as any,
              qualityLabel: (item.quality?.includes('Premium') ? 'Premium' : item.quality?.includes('Very Good') ? 'Very Good' : 'Good') as any,
              basePriceExpected: Number(item.expectedPrice) || Number(item.suggestedMinPrice) || 30,
              aiRecommendedPriceMin: Number(item.suggestedMinPrice) || 25,
              aiRecommendedPriceMax: Number(item.suggestedMaxPrice) || 35,
              harvestDate: item.availableDate || 'Today',
              availableDate: item.availableDate || 'Immediate Pickup',
              listingDate: item.createdAt ? new Date(item.createdAt).toISOString().split('T')[0] : 'Today',
              location: item.village || 'Namakkal',
              district: 'Namakkal',
              distanceKm: 8,
              farmerName: item.farmerName || 'Murugan Selvam',
              farmerPhone: item.farmerPhone || '+91 98765 43210',
              imageUrl,
              status: (item.status === 'sold' ? 'sold' : item.status === 'negotiating' ? 'negotiating' : 'active') as any,
              bidsCount: Number(item.bidsCount) || 0,
              createdAt: item.createdAt || new Date().toISOString(),
              kioskAssisted: false,
              notes: item.notes || 'Verified harvest lot.'
            };
          });
          setListings([sihDemoListing, ...mappedListings]);
        }
      } catch (err) {
        if (import.meta.env.DEV) {
          console.error(
            '[FarmGrade Dev Alert] Produce listings failed to load from /api/produce:',
            err,
            '\nActionable fix: Verify PostgreSQL is connected, the produce_listings table exists and joins with crops and users.'
          );
        }
        console.warn('Backend produce listings fallback active:', err);
      }

      // 2. Fetch market benchmark prices
      try {
        const pricesRes = await api.marketPrices.getAll();
        if (pricesRes.success && Array.isArray(pricesRes.data) && pricesRes.data.length > 0) {
          const mappedPrices: MandiPrice[] = pricesRes.data.map((p: any) => ({
            id: `mandi-${p.id}`,
            cropName: p.cropName ? `${p.cropName} (${p.cropLocalName || ''})` : 'Crop',
            variety: 'APMC Market Standard',
            mandiName: p.location,
            district: 'Namakkal / Salem',
            minPrice: p.minPrice || p.price - 4,
            modalPrice: p.price,
            maxPrice: p.maxPrice || p.price + 5,
            unit: p.unit || 'kg',
            trend: p.trend || 'stable',
            changePercent: parseFloat(p.changePercent?.replace('%', '') || '0'),
            lastUpdated: 'Just now (PostgreSQL)',
            historicalTrend: [
              { day: 'Mon', price: p.price - 3 },
              { day: 'Tue', price: p.price - 1 },
              { day: 'Wed', price: p.price },
              { day: 'Thu', price: p.price + 1 },
              { day: 'Fri', price: p.price }
            ]
          }));
          setMandiPrices([sihDemoMandiPrice, ...mappedPrices]);
        }
      } catch (err) {
        if (import.meta.env.DEV) {
          console.error(
            '[FarmGrade Dev Alert] Market prices failed to load from /api/market-prices:',
            err,
            '\nActionable fix: Check market_prices table in PostgreSQL.'
          );
        }
        console.warn('Backend market prices fallback active:', err);
      }

      // 3. Fetch transactions
      try {
        const txRes = await api.transactions.getAll();
        if (txRes.success && Array.isArray(txRes.data) && txRes.data.length > 0) {
          const mappedSales: SaleTransaction[] = txRes.data.map((tx: any) => ({
            id: String(tx.id),
            listingId: String(tx.listingId),
            cropName: tx.cropName || 'Produce',
            farmerName: tx.farmerName || 'Farmer',
            buyerName: tx.buyerName || 'FreshBasket Retail',
            quantity: tx.quantity,
            unit: tx.unit || 'kg',
            finalPricePerUnit: tx.agreedPrice,
            totalValue: tx.totalAmount,
            saleDate: new Date(tx.createdAt).toISOString().split('T')[0],
            paymentStatus: (tx.paymentStatus as any) || 'paid',
            receiptNumber: tx.weighmentSlipNo || `FG-SL-${tx.id}`,
            weighmentSlipId: tx.weighmentSlipNo || `WGH-${tx.id}`
          }));
          setSales(mappedSales);
        }
      } catch (err) {
        if (import.meta.env.DEV) {
          console.error(
            '[FarmGrade Dev Alert] Transactions failed to load from /api/transactions:',
            err,
            '\nActionable fix: Check transactions table in PostgreSQL.'
          );
        }
        console.warn('Backend transactions fallback active:', err);
      }

      // 4. Fetch live bids
      try {
        const liveBidsRes = await api.bids.getLiveState();
        if (liveBidsRes.success && Array.isArray(liveBidsRes.data?.bids) && liveBidsRes.data.bids.length > 0) {
          const mappedBids: Bid[] = liveBidsRes.data.bids.map((b: any) => ({
            id: String(b.id),
            listingId: String(b.listingId),
            cropName: b.cropName || 'Produce',
            buyerName: b.buyerName || 'Verified Buyer',
            buyerCompany: b.buyerCompany || b.buyerName || 'Procurement Buyer',
            buyerPhone: b.buyerPhone || '+91 94432 10987',
            buyerRating: 4.8,
            bidPricePerUnit: Number(b.bidPrice) || Number(b.bidPricePerUnit) || 30,
            requestedQuantity: Number(b.requestedQuantity) || Number(b.quantity) || 300,
            unit: b.unit || 'kg',
            totalAmount: Number(b.totalAmount) || (Number(b.bidPrice) * Number(b.quantity || 1)),
            offeredPickupDate: 'Today / Tomorrow',
            pickupPreference: b.pickupPreference || 'Direct Farm Gate Pickup',
            paymentTerms: b.paymentTerms || 'Immediate UPI',
            status: b.status as any,
            createdAt: b.createdAt || new Date().toISOString(),
            notes: b.notes || undefined
          }));
          setBids(mappedBids);
        }
      } catch (err) {
        if (import.meta.env.DEV) {
          console.error(
            '[FarmGrade Dev Alert] Live bids failed to load from /api/bids/live-state:',
            err,
            '\nActionable fix: Check bids table and joins in PostgreSQL.'
          );
        }
        console.warn('Backend live bids fallback active:', err);
      }
    }

    loadBackendData();
  }, []);

  const [confirmationState, setConfirmationState] = useState<ConfirmationModalState>({
    isOpen: false,
    title: '',
    message: '',
    type: 'warning',
    onConfirm: () => {},
  });

  const showConfirmation = (options: {
    title?: string;
    message?: string;
    confirmText?: string;
    cancelText?: string;
    type?: 'warning' | 'problem' | 'info' | 'success';
    onConfirm: () => void | Promise<void>;
    onCancel?: () => void;
  }) => {
    setConfirmationState({
      isOpen: true,
      title: options.title || t('confirm_are_you_sure') || 'Are you sure?',
      message: options.message || '',
      confirmText: options.confirmText || t('confirm_yes_continue') || 'Yes, Continue',
      cancelText: options.cancelText || t('confirm_go_back') || 'Go Back',
      type: options.type || 'warning',
      onConfirm: options.onConfirm,
      onCancel: options.onCancel,
    });
  };

  const hideConfirmation = () => {
    setConfirmationState((prev) => ({ ...prev, isOpen: false }));
  };

  const showFarmerError = (error: unknown) => {
    const sanitized = sanitizeFarmerErrorMessage(error, language);
    addToast({
      type: sanitized.type,
      title: sanitized.title,
      message: sanitized.message,
    });
  };

  // SIH 2026 Demonstration Scenario State
  const [sihDemo, setSihDemo] = useState<SihDemoState>(createInitialSihDemoState);

  const selectSihDemoBuyer = async (buyerId: string) => {
    setSihDemo((prev) => ({ ...prev, isLoading: true }));
    await new Promise((resolve) => setTimeout(resolve, 400));
    setSihDemo((prev) => {
      const updatedBuyers = prev.buyers.map((b) =>
        b.id === buyerId
          ? { ...b, status: 'selected' as const }
          : { ...b, status: 'pending' as const }
      );
      return {
        ...prev,
        selectedBuyerId: buyerId,
        stage: 'buyer_selected',
        buyers: updatedBuyers,
        isLoading: false,
      };
    });
    addToast(farmerNotifications.buyerSelected(language));
  };

  const simulateSihBuyerCancel = async () => {
    setSihDemo((prev) => ({ ...prev, isLoading: true }));
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Currently selected buyer cancelled -> automatic transition to next eligible buyer: Buyer C (₹26/kg)
    setSihDemo((prev) => {
      const updatedBuyers = prev.buyers.map((b) => {
        if (b.id === prev.selectedBuyerId) {
          return { ...b, status: 'cancelled' as const };
        }
        if (b.code === 'Buyer C') {
          return { ...b, status: 'backup' as const };
        }
        return b;
      });
      return {
        ...prev,
        stage: 'backup_offered',
        selectedBuyerId: 'demo-buyer-c',
        buyers: updatedBuyers,
        isLoading: false,
      };
    });

    // 1. Notify that selected buyer is no longer available
    addToast(farmerNotifications.buyerCancelled(language));

    // 2. Notify that another buyer is available
    setTimeout(() => {
      addToast(
        farmerNotifications.backupBuyerAvailable(language, () => {
          confirmSihBackupSale();
        })
      );
    }, 700);
  };

  const confirmSihBackupSale = async () => {
    showConfirmation({
      title: t('confirm_are_you_sure') || 'Are you sure?',
      message:
        language === 'ta'
          ? 'வாங்குபவர் சி (ரூ.26/கிலோ - மொத்தம் ரூ.13,000) உடனான விற்பனையை உறுதிப்படுத்த விரும்புகிறீர்களா?'
          : language === 'hi'
          ? 'क्या आप खरीदार सी (₹26/किलो - कुल ₹13,000) के साथ बिक्री पक्की करना चाहते हैं?'
          : 'Do you want to confirm the sale with Buyer C (₹26/kg - Total ₹13,000)?',
      confirmText: t('confirm_yes_continue') || 'Yes, Continue',
      cancelText: t('confirm_go_back') || 'Go Back',
      type: 'success',
      onConfirm: async () => {
        setSihDemo((prev) => ({ ...prev, isLoading: true }));
        await new Promise((resolve) => setTimeout(resolve, 500));

        const receipt: SihDemoReceipt = {
          receiptNumber: 'FG-SLM-2026-9842',
          weighmentSlipId: 'WGH-SLM-500',
          saleDate: new Date().toISOString().split('T')[0],
          farmerName: 'Ravi',
          village: 'Salem',
          buyerName: 'Buyer C (Nilgiris Retail Hub)',
          buyerCompany: 'Nilgiris Fresh Produce Chain',
          cropName: 'Tomato',
          quantity: 500,
          unit: 'kg',
          finalPricePerUnit: 26,
          totalAmount: 13000,
          paymentMethod: 'Instant UPI Verified',
          upiRef: 'UPI/2026/0924/FG8819',
        };

        setSihDemo((prev) => ({
          ...prev,
          stage: 'sale_completed',
          buyers: prev.buyers.map((b) =>
            b.code === 'Buyer C' ? { ...b, status: 'confirmed' as const } : b
          ),
          completedSaleReceipt: receipt,
          isLoading: false,
        }));

        // Add to sales
        setSales((prev) => [
          {
            id: 'sale-sih-2026',
            listingId: 'sih-demo-ravi-salem',
            cropName: 'Tomato (நாட்டு தக்காளி)',
            farmerName: 'Ravi',
            buyerName: 'Nilgiris Retail Hub (Buyer C)',
            quantity: 500,
            unit: 'kg',
            finalPricePerUnit: 26,
            totalValue: 13000,
            saleDate: new Date().toISOString().split('T')[0],
            paymentStatus: 'paid',
            receiptNumber: receipt.receiptNumber,
            weighmentSlipId: receipt.weighmentSlipId,
          },
          ...prev,
        ]);

        addToast(farmerNotifications.saleConfirmed(language));
      },
    });
  };

  const resetSihDemo = () => {
    setSihDemo(createInitialSihDemoState());
    addToast({
      type: 'processing',
      title: 'Reset completed.',
      message:
        language === 'ta'
          ? 'தொடக்க நிலைக்கு மீட்டமைக்கப்பட்டது.'
          : language === 'hi'
          ? 'प्रारंभिक स्थिति में रीसेट हो गया।'
          : 'Matching workflow reset to initial step.',
    });
  };

  const addBid = async (newBidData: Omit<Bid, 'id' | 'createdAt' | 'status'>) => {
    const localId = 'bid-' + (bids.length + 201);
    const newBid: Bid = {
      ...newBidData,
      id: localId,
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    setBids((prev) => [newBid, ...prev]);
    // update listing bidsCount
    setListings((prev) =>
      prev.map((l) =>
        l.id === newBidData.listingId
          ? { ...l, bidsCount: l.bidsCount + 1, status: 'negotiating' }
          : l
      )
    );

    // Send to backend API
    try {
      const listingNum = parseInt(newBidData.listingId.replace(/\D/g, ''), 10) || 1;
      await api.bids.create({
        listingId: listingNum,
        bidPrice: newBidData.bidPricePerUnit,
        quantity: newBidData.requestedQuantity || 100,
        paymentTerms: newBidData.paymentTerms,
        pickupPreference: newBidData.pickupPreference,
        notes: newBidData.notes
      });
    } catch (apiErr) {
      console.warn('API sync bid fallback:', apiErr);
    }

    addToast({
      type: 'success',
      title:
        language === 'ta'
          ? 'உங்கள் சலுகை சமர்ப்பிக்கப்பட்டது.'
          : language === 'hi'
          ? 'आपकी बोली जमा कर दी गई है।'
          : 'Your bid has been submitted.',
      message:
        language === 'ta'
          ? `₹${newBidData.bidPricePerUnit} விலை சலுகை விவசாயிக்கு அனுப்பப்பட்டது.`
          : language === 'hi'
          ? `₹${newBidData.bidPricePerUnit} का प्रस्ताव किसान को भेज दिया गया है।`
          : `Your offer of ₹${newBidData.bidPricePerUnit} was sent to the farmer.`
    });
  };

  const acceptBid = async (bidId: string) => {
    const targetBid = bids.find((b) => b.id === bidId);
    if (!targetBid) return;

    setBids((prev) =>
      prev.map((b) =>
        b.id === bidId
          ? { ...b, status: 'accepted' }
          : b.listingId === targetBid.listingId
          ? { ...b, status: 'rejected' }
          : b
      )
    );

    // Update listing status to sold
    const targetListing = listings.find((l) => l.id === targetBid.listingId);
    if (targetListing) {
      setListings((prev) =>
        prev.map((l) => (l.id === targetListing.id ? { ...l, status: 'sold' } : l))
      );

      // Create a sale transaction
      const newSale: SaleTransaction = {
        id: 'sale-' + (sales.length + 301),
        listingId: targetListing.id,
        cropName: targetListing.cropName,
        farmerName: targetListing.farmerName,
        buyerName: targetBid.buyerName,
        quantity: targetListing.quantity,
        unit: targetListing.unit,
        finalPricePerUnit: targetBid.bidPricePerUnit,
        totalValue: targetBid.totalAmount || (targetBid.bidPricePerUnit * targetListing.quantity),
        saleDate: new Date().toISOString().split('T')[0],
        paymentStatus: 'paid',
        receiptNumber: `FG-SL-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
        weighmentSlipId: `WGH-${Math.floor(5000 + Math.random() * 4000)}`
      };
      setSales((prev) => [newSale, ...prev]);
    }

    try {
      const bidNum = parseInt(bidId.replace(/\D/g, ''), 10) || 1;
      await api.bids.updateStatus(bidNum, 'accepted');
    } catch (err) {
      console.warn('Backend status update fallback:', err);
    }

    addToast(farmerNotifications.buyerSelected(language));
  };

  const rejectBid = async (bidId: string) => {
    setBids((prev) =>
      prev.map((b) => (b.id === bidId ? { ...b, status: 'rejected' } : b))
    );
    try {
      const bidNum = parseInt(bidId.replace(/\D/g, ''), 10) || 1;
      await api.bids.updateStatus(bidNum, 'rejected');
    } catch (err) {
      console.warn('Backend reject update fallback:', err);
    }
    addToast({
      type: 'info',
      title:
        language === 'ta'
          ? 'சலுகை நிராகரிக்கப்பட்டது.'
          : language === 'hi'
          ? 'प्रस्ताव अस्वीकार किया गया।'
          : 'Offer Declined',
      message:
        language === 'ta'
          ? 'வாங்குபவருக்கு தெரிவிக்கப்பட்டது. மற்ற சலுகைகளை நீங்கள் பார்க்கலாம்.'
          : language === 'hi'
          ? 'खरीदार को सूचित कर दिया गया है। आपकी सूची अन्य बोलियों के लिए खुली है।'
          : 'The buyer has been notified. Your listing remains open for other bids.'
    });
  };

  const cancelBid = async (bidId: string) => {
    setBids((prev) =>
      prev.map((b) => (b.id === bidId ? { ...b, status: 'cancelled' } : b))
    );
    try {
      const bidNum = parseInt(bidId.replace(/\D/g, ''), 10) || 1;
      await api.bids.updateStatus(bidNum, 'cancelled');
    } catch (err) {
      console.warn('Backend cancel update fallback:', err);
    }
    addToast({
      type: 'info',
      title:
        language === 'ta'
          ? 'சலுகை ரத்து செய்யப்பட்டது.'
          : language === 'hi'
          ? 'बोली रद्द की गई।'
          : 'Bid Cancelled',
      message:
        language === 'ta'
          ? 'உங்கள் ஏலம் திரும்பப் பெறப்பட்டது.'
          : language === 'hi'
          ? 'आपकी बोली वापस ले ली गई है।'
          : 'Your bid has been withdrawn.'
    });
  };

  const completeBid = async (bidId: string) => {
    setBids((prev) =>
      prev.map((b) => (b.id === bidId ? { ...b, status: 'completed' } : b))
    );
    try {
      const bidNum = parseInt(bidId.replace(/\D/g, ''), 10) || 1;
      await api.bids.updateStatus(bidNum, 'completed');
    } catch (err) {
      console.warn('Backend complete update fallback:', err);
    }
    addToast(farmerNotifications.saleConfirmed(language));
  };

  return (
    <AppContext.Provider
      value={{
        role,
        setRole,
        user,
        token,
        isAuthenticated: !!token && !!user,
        login,
        socialLogin,
        register,
        updateUserProfile,
        deleteAccount,
        logout,
        requestLogout,
        simpleMode,
        setSimpleMode,
        language,
        setLanguage,
        t,
        listings,
        addListing,
        bids,
        addBid,
        acceptBid,
        rejectBid,
        cancelBid,
        completeBid,
        sales,
        mandiPrices,
        toasts,
        addToast,
        removeToast,
        confirmationState,
        showConfirmation,
        hideConfirmation,
        showFarmerError,
        sihDemo,
        selectSihDemoBuyer,
        simulateSihBuyerCancel,
        confirmSihBackupSale,
        resetSihDemo
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
