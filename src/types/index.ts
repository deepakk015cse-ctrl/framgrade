export type UserRole = 'farmer' | 'buyer' | 'admin';

export type Language = 'en' | 'ta' | 'hi';

export type ProduceGrade = 'Grade A' | 'Grade B' | 'Grade C';
export type QualityLevel = 'Good' | 'Very Good' | 'Premium';

export type BidStatus = 'pending' | 'accepted' | 'rejected' | 'cancelled' | 'completed';

export interface ProduceListing {
  id: string;
  cropName: string;
  cropTamilName?: string;
  cropHindiName?: string;
  cropKey?: 'tomato' | 'onion' | 'potato' | 'paddy' | 'banana' | 'other';
  variety: string;
  quantity: number;
  unit: 'kg' | 'quintal' | 'crates' | 'bags';
  grade: ProduceGrade;
  qualityLabel?: QualityLevel;
  basePriceExpected: number; // in ₹ per unit
  aiRecommendedPriceMin: number;
  aiRecommendedPriceMax: number;
  harvestDate: string;
  availableDate?: string;
  listingDate?: string;
  location: string; // Village / Panchayat level (privacy-preserving)
  district: string;
  distanceKm?: number;
  farmerName: string;
  farmerPhone?: string;
  imageUrl?: string;
  status: 'active' | 'negotiating' | 'sold' | 'expired';
  bidsCount: number;
  createdAt: string;
  kioskAssisted: boolean;
  notes?: string;
}

export interface Bid {
  id: string;
  listingId: string;
  cropName: string;
  buyerName: string;
  buyerCompany: string;
  buyerPhone: string;
  buyerRating: number;
  bidPricePerUnit: number;
  requestedQuantity?: number;
  unit?: string;
  totalAmount: number;
  offeredPickupDate: string;
  pickupPreference?: 'Buyer Pickup from Farm Gate' | 'Farmer Delivery to Hub' | 'Kiosk Center Dropoff' | string;
  paymentTerms: 'Immediate UPI' | 'Bank Transfer on Weighment' | 'Cash at Kiosk' | string;
  status: BidStatus;
  createdAt: string;
  notes?: string;
  optionalMessage?: string;
}

export interface SaleTransaction {
  id: string;
  listingId: string;
  cropName: string;
  farmerName: string;
  buyerName: string;
  quantity: number;
  unit: string;
  finalPricePerUnit: number;
  totalValue: number;
  saleDate: string;
  paymentStatus: 'paid' | 'escrow_held' | 'processing';
  receiptNumber: string;
  weighmentSlipId: string;
}

export interface MandiPrice {
  id: string;
  cropName: string;
  variety: string;
  mandiName: string;
  district: string;
  minPrice: number;
  modalPrice: number;
  maxPrice: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  changePercent: number;
  lastUpdated: string;
  historicalTrend: { day: string; price: number }[];
}

export type NotificationType =
  | 'success'      // ✅
  | 'warning'      // ⚠️
  | 'problem'      // ❌
  | 'error'        // ❌
  | 'notification' // 🔔
  | 'info'         // 🔔
  | 'processing'   // 🔄
  | 'connection'   // 📶
  | 'price'        // 💰
  | 'produce'      // 🌾
  | 'voice'        // 🎤
  | 'sale';        // 🎉

export interface ToastMessage {
  id: string;
  type: NotificationType;
  title: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
  duration?: number;
  sticky?: boolean;
}

export interface ConfirmationModalState {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'warning' | 'problem' | 'info' | 'success';
  onConfirm: () => void | Promise<void>;
  onCancel?: () => void;
}

