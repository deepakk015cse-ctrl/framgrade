// Frontend API client connected to Express & PostgreSQL backend

const BASE_URL = '/api';

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const token = localStorage.getItem('farmgrade_token') || 'demo-farmer-murugan-101';

  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...options?.headers,
    },
  });

  if (!res.ok) {
    let errorMsg = `HTTP Error ${res.status}`;
    try {
      const errorData = await res.json();
      errorMsg = errorData.error || errorData.message || errorMsg;
    } catch {
      // fallback to status text
    }
    throw new Error(errorMsg);
  }

  return res.json();
}

export const api = {
  auth: {
    getProviders: () =>
      fetchJson<{
        success: boolean;
        data: { smsOtpConfigured: boolean; googleOAuthConfigured: boolean };
      }>(`${BASE_URL}/auth/providers`),
    login: (identifier: string, password?: string, role?: string, method?: 'mobile' | 'email') =>
      fetchJson<{ success: boolean; data: any; message?: string }>(`${BASE_URL}/auth/login`, {
        method: 'POST',
        body: JSON.stringify({
          identifier,
          phone: method === 'mobile' ? identifier : undefined,
          email: method === 'email' || identifier.includes('@') ? identifier : undefined,
          password,
          role,
          method,
        }),
      }),
    forgotPassword: (email: string) =>
      fetchJson<{ success: boolean; message: string }>(`${BASE_URL}/auth/forgot-password`, {
        method: 'POST',
        body: JSON.stringify({ email }),
      }),
    resetPassword: (email: string, newPassword: string) =>
      fetchJson<{ success: boolean; message: string }>(`${BASE_URL}/auth/reset-password`, {
        method: 'POST',
        body: JSON.stringify({ email, newPassword }),
      }),
    changePassword: (currentPassword: string, newPassword: string) =>
      fetchJson<{ success: boolean; message: string }>(`${BASE_URL}/auth/change-password`, {
        method: 'POST',
        body: JSON.stringify({ currentPassword, newPassword }),
      }),
    updateProfile: (data: {
      name?: string;
      phone?: string;
      email?: string;
      village?: string;
      district?: string;
      businessName?: string;
      preferredLanguage?: string;
      preferredCrops?: string[];
    }) =>
      fetchJson<{ success: boolean; data: { user: any }; message: string }>(
        `${BASE_URL}/auth/profile`,
        {
          method: 'PUT',
          body: JSON.stringify(data),
        }
      ),
    deleteAccount: (data: { password?: string; confirmText?: string }) =>
      fetchJson<{ success: boolean; message: string }>(`${BASE_URL}/auth/account`, {
        method: 'DELETE',
        body: JSON.stringify(data),
      }),
    getGoogleAuthUrl: () =>
      fetchJson<{ success: boolean; configured: boolean; url?: string; error?: string }>(
        `${BASE_URL}/auth/google/url`
      ),
    socialLogin: (data: {
      provider: string;
      email?: string;
      name?: string;
      phone?: string;
      role?: string;
    }) =>
      fetchJson<{ success: boolean; data: any; message?: string }>(`${BASE_URL}/auth/social`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    register: (data: {
      name: string;
      phone?: string;
      email?: string;
      password?: string;
      role: 'farmer' | 'buyer' | 'kiosk_operator' | 'admin';
      village?: string;
      district?: string;
      state?: string;
      preferredLanguage?: string;
      businessName?: string;
      buyerType?: string;
    }) =>
      fetchJson<{ success: boolean; data: any; message?: string }>(`${BASE_URL}/auth/register`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    logout: () =>
      fetchJson<{ success: boolean; message: string }>(`${BASE_URL}/auth/logout`, {
        method: 'POST',
      }),
    me: () => fetchJson<{ success: boolean; data: any }>(`${BASE_URL}/auth/me`),
  },

  produce: {
    getAll: (params?: { cropId?: number; status?: string; village?: string }) => {
      const query = new URLSearchParams();
      if (params?.cropId) query.set('cropId', String(params.cropId));
      if (params?.status) query.set('status', params.status);
      if (params?.village) query.set('village', params.village);
      const qs = query.toString();
      return fetchJson<{ success: boolean; data: any[] }>(
        `${BASE_URL}/produce${qs ? `?${qs}` : ''}`
      );
    },
    getById: (id: number | string) =>
      fetchJson<{ success: boolean; data: any }>(`${BASE_URL}/produce/${id}`),
    create: (data: {
      cropName: string;
      quantity: number;
      unit: string;
      quality: string;
      village: string;
      availableDate?: string;
      expectedPrice?: number;
      suggestedMinPrice?: number;
      suggestedMaxPrice?: number;
      notes?: string;
    }) =>
      fetchJson<{ success: boolean; data: any }>(`${BASE_URL}/produce`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id: number | string, data: any) =>
      fetchJson<{ success: boolean; data: any }>(`${BASE_URL}/produce/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    delete: (id: number | string) =>
      fetchJson<{ success: boolean; data: any }>(`${BASE_URL}/produce/${id}`, {
        method: 'DELETE',
      }),
  },

  marketPrices: {
    getAll: () =>
      fetchJson<{ success: boolean; data: any[] }>(`${BASE_URL}/market-prices`),
    getByCrop: (crop: string) =>
      fetchJson<{ success: boolean; data: any[] }>(
        `${BASE_URL}/market-prices/${encodeURIComponent(crop)}`
      ),
  },

  bids: {
    getLiveState: () =>
      fetchJson<{
        success: boolean;
        data: {
          listings: any[];
          bids: any[];
          transactions: any[];
          liveActivity: any[];
          buyerDemandCount: number;
        };
      }>(`${BASE_URL}/bids/live-state`),
    create: (data: {
      listingId: number;
      bidPrice: number;
      quantity: number;
      paymentTerms: string;
      pickupPreference?: string;
      notes?: string;
      distanceKm?: number;
      buyerLocation?: string;
      buyerType?: string;
      buyerNameOverride?: string;
      buyerId?: number;
    }) =>
      fetchJson<{ success: boolean; message?: string; data: any }>(`${BASE_URL}/bids`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    getReceived: () =>
      fetchJson<{ success: boolean; data: any[] }>(`${BASE_URL}/bids/received`),
    getSent: () =>
      fetchJson<{ success: boolean; data: any[] }>(`${BASE_URL}/bids/sent`),
    getByListing: (listingId: number | string) =>
      fetchJson<{ success: boolean; listing: any; count: number; data: any[] }>(
        `${BASE_URL}/bids/listing/${listingId}`
      ),
    selectBuyer: (bidId: number | string) =>
      fetchJson<{ success: boolean; message: string; data: any }>(
        `${BASE_URL}/bids/${bidId}/select`,
        { method: 'POST' }
      ),
    rejectBid: (bidId: number | string) =>
      fetchJson<{ success: boolean; message: string; data: any }>(
        `${BASE_URL}/bids/${bidId}/reject`,
        { method: 'POST' }
      ),
    confirmBackup: (bidId: number | string) =>
      fetchJson<{ success: boolean; message: string; data: any }>(
        `${BASE_URL}/bids/${bidId}/confirm-backup`,
        { method: 'POST' }
      ),
    confirmPurchase: (bidId: number | string) =>
      fetchJson<{ success: boolean; message: string; data: any; weighmentSlipNo?: string }>(
        `${BASE_URL}/bids/${bidId}/confirm-purchase`,
        { method: 'POST' }
      ),
    cancelSelection: (bidId: number | string, reason?: string) =>
      fetchJson<{
        success: boolean;
        message: string;
        cancelledBid: any;
        backupBuyerFound: boolean;
        requiresFarmerConfirmation?: boolean;
        backupOffer?: any;
      }>(`${BASE_URL}/bids/${bidId}/cancel-selection`, {
        method: 'POST',
        body: JSON.stringify({ reason }),
      }),
    getTimeline: (listingId: number | string) =>
      fetchJson<{
        success: boolean;
        listingId: number;
        cropName: string;
        currentStageIndex: number;
        steps: any[];
        transactions: any[];
        cancelledBidsCount?: number;
      }>(`${BASE_URL}/bids/timeline/${listingId}`),
    updateStatus: (
      id: number | string,
      status: string
    ) =>
      fetchJson<{ success: boolean; data: any }>(`${BASE_URL}/bids/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status }),
      }),
  },

  transactions: {
    getAll: () =>
      fetchJson<{ success: boolean; data: any[] }>(`${BASE_URL}/transactions`),
    getById: (id: number | string) =>
      fetchJson<{ success: boolean; data: any }>(`${BASE_URL}/transactions/${id}`),
    create: (data: {
      listingId: number;
      buyerId: number;
      agreedPrice: number;
      quantity: number;
      paymentMethod?: string;
    }) =>
      fetchJson<{ success: boolean; data: any }>(`${BASE_URL}/transactions`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  },

  ai: {
    getPriceRecommendation: (data: {
      cropName: string;
      quantity: number;
      quality: string;
      location?: string;
      unit?: string;
      listingId?: number;
    }) =>
      fetchJson<{ success: boolean; data: any }>(
        `${BASE_URL}/ai/price-recommendation`,
        {
          method: 'POST',
          body: JSON.stringify(data),
        }
      ),
    predictPrice: (data: {
      cropName: string;
      quantity: number;
      quality: string;
      village?: string;
      availableDate?: string;
    }) =>
      fetchJson<{ success: boolean; data: any }>(`${BASE_URL}/ai/predict-price`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    gradeProduce: (data: {
      cropName: string;
      description?: string;
      defectRate?: number;
      firmness?: string;
      colorUniformity?: string;
    }) =>
      fetchJson<{ success: boolean; data: any }>(`${BASE_URL}/ai/grade-produce`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  },

  notifications: {
    getAll: () =>
      fetchJson<{ success: boolean; count: number; data: any[] }>(
        `${BASE_URL}/notifications`
      ),
    markRead: (id: number) =>
      fetchJson<{ success: boolean; data: any }>(
        `${BASE_URL}/notifications/${id}/read`,
        { method: 'PUT' }
      ),
    markAllRead: () =>
      fetchJson<{ success: boolean; message: string }>(
        `${BASE_URL}/notifications/mark-all-read`,
        { method: 'POST' }
      ),
  },

  admin: {
    getMetrics: () =>
      fetchJson<{ success: boolean; data: any }>(`${BASE_URL}/admin/metrics`),
    getActivity: () =>
      fetchJson<{ success: boolean; count: number; data: any[] }>(`${BASE_URL}/admin/activity`),
    getReports: () =>
      fetchJson<{ success: boolean; count: number; data: any[] }>(`${BASE_URL}/admin/reports`),
    moderateRecord: (type: string, id: number | string, data: { action: 'approve' | 'archive' | 'flag'; resolutionNotes?: string }) =>
      fetchJson<{ success: boolean; message: string }>(`${BASE_URL}/admin/records/${type}/${id}/moderate`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    getHealth: () =>
      fetchJson<{ success: boolean; data: any }>(`${BASE_URL}/admin/health`),
  },

  farmers: {
    getAll: () =>
      fetchJson<{ success: boolean; data: any[] }>(`${BASE_URL}/farmers`),
    getById: (id: number | string) =>
      fetchJson<{ success: boolean; data: any }>(`${BASE_URL}/farmers/${id}`),
  },

  buyers: {
    getAll: () =>
      fetchJson<{ success: boolean; data: any[] }>(`${BASE_URL}/buyers`),
    getById: (id: number | string) =>
      fetchJson<{ success: boolean; data: any }>(`${BASE_URL}/buyers/${id}`),
    getActivity: (id: number | string) =>
      fetchJson<{ success: boolean; data: any }>(`${BASE_URL}/buyers/${encodeURIComponent(String(id))}/activity`),
  },

  advisor: {
    getSellOrWait: (params: {
      cropName: string;
      quantity: number;
      unit?: string;
      quality?: string;
      currentMarketPrice?: number;
      minPrice?: number;
      maxPrice?: number;
      highestOffer?: number;
      offersCount?: number;
      trend?: string;
    }) => {
      const qs = new URLSearchParams();
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== null) qs.set(k, String(v));
      });
      return fetchJson<{ success: boolean; data: any }>(
        `${BASE_URL}/advisor/sell-or-wait?${qs.toString()}`
      );
    },
  },

  pricing: {
    getTakeHome: (params: {
      offerPrice: number;
      quantity: number;
      unit?: string;
      transportCost?: number | null;
      loadingCost?: number | null;
      otherCost?: number | null;
    }) => {
      const qs = new URLSearchParams();
      qs.set('offerPrice', String(params.offerPrice));
      qs.set('quantity', String(params.quantity));
      if (params.unit) qs.set('unit', params.unit);
      if (params.transportCost !== undefined && params.transportCost !== null) {
        qs.set('transportCost', String(params.transportCost));
      }
      if (params.loadingCost !== undefined && params.loadingCost !== null) {
        qs.set('loadingCost', String(params.loadingCost));
      }
      if (params.otherCost !== undefined && params.otherCost !== null) {
        qs.set('otherCost', String(params.otherCost));
      }
      return fetchJson<{ success: boolean; data: any }>(
        `${BASE_URL}/pricing/take-home?${qs.toString()}`
      );
    },
  },

  cropPools: {
    getAll: () =>
      fetchJson<{ success: boolean; data: any[] }>(`${BASE_URL}/crop-pools`),
    join: (poolId: string, quantity?: number) =>
      fetchJson<{ success: boolean; message: string; data: any }>(
        `${BASE_URL}/crop-pools/join`,
        {
          method: 'POST',
          body: JSON.stringify({ poolId, quantity }),
        }
      ),
    leave: (poolId: string) =>
      fetchJson<{ success: boolean; message: string; data: any }>(
        `${BASE_URL}/crop-pools/leave`,
        {
          method: 'POST',
          body: JSON.stringify({ poolId }),
        }
      ),
    confirm: (poolId: string) =>
      fetchJson<{ success: boolean; message: string; data: any }>(
        `${BASE_URL}/crop-pools/confirm`,
        {
          method: 'POST',
          body: JSON.stringify({ poolId }),
        }
      ),
  },

  buyerMatches: {
    getAll: (params?: { cropName?: string; quantity?: number; unit?: string; quality?: string; location?: string }) => {
      const qs = new URLSearchParams();
      if (params) {
        Object.entries(params).forEach(([k, v]) => {
          if (v !== undefined && v !== null) qs.set(k, String(v));
        });
      }
      return fetchJson<{ success: boolean; data: any[] }>(
        `${BASE_URL}/buyer-matches${qs.toString() ? `?${qs.toString()}` : ''}`
      );
    },
  },

  voiceAssistant: {
    ask: (
      text: string,
      context?: {
        cropName?: string;
        quantity?: number;
        unit?: string;
        transportCost?: number;
        otherCost?: number;
        language?: string;
      }
    ) =>
      fetchJson<{ success: boolean; data: any }>(
        `${BASE_URL}/voice-assistant`,
        {
          method: 'POST',
          body: JSON.stringify({ text, ...(context || {}) }),
        }
      ),
  },

  qualityExplanation: {
    get: (params: {
      cropName: string;
      quality: string;
      quantity: number;
      unit?: string;
      location?: string;
      minPrice?: number;
      maxPrice?: number;
    }) => {
      const qs = new URLSearchParams();
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== null) qs.set(k, String(v));
      });
      return fetchJson<{ success: boolean; data: any }>(
        `${BASE_URL}/quality-explanation?${qs.toString()}`
      );
    },
  },

  decisionEngine: {
    analyze: (params: {
      cropName: string;
      quantity: number;
      unit?: string;
      quality: string;
      location?: string;
      sellingDate?: string;
      availableStorage?: string;
      buyerOfferPrice?: number;
      transportCost?: number;
      loadingCost?: number;
      otherCost?: number;
    }) =>
      fetchJson<{ success: boolean; data: any }>(
        `${BASE_URL}/decision-engine/analyze`,
        {
          method: 'POST',
          body: JSON.stringify(params),
        }
      ),
  },

  decision: {
    getNetRealisation: (
      listingId: string | number = 'active',
      params?: {
        cropName?: string;
        quantity?: number;
        unit?: string;
        transportCost?: number | null;
        loadingCost?: number | null;
        otherCost?: number | null;
      }
    ) => {
      const qs = new URLSearchParams();
      if (params) {
        Object.entries(params).forEach(([k, v]) => {
          if (v !== undefined && v !== null) qs.set(k, String(v));
        });
      }
      const queryStr = qs.toString();
      return fetchJson<{ success: boolean; data: any }>(
        `${BASE_URL}/decision/net-realisation/${encodeURIComponent(String(listingId))}${
          queryStr ? `?${queryStr}` : ''
        }`
      );
    },
    compare: (scenarios: any[]) =>
      fetchJson<{ success: boolean; message?: string; data: any }>(
        `${BASE_URL}/decision/compare`,
        {
          method: 'POST',
          body: JSON.stringify({ scenarios }),
        }
      ),
    getPriceExplanation: (
      listingId: string | number = 'active',
      params?: {
        cropName?: string;
        quantity?: number;
        unit?: string;
        quality?: string;
        location?: string;
        minPrice?: number;
        maxPrice?: number;
        offersMin?: number;
        offersMax?: number;
        offersCount?: number;
      }
    ) => {
      const qs = new URLSearchParams();
      if (params) {
        Object.entries(params).forEach(([k, v]) => {
          if (v !== undefined && v !== null) qs.set(k, String(v));
        });
      }
      const queryStr = qs.toString();
      return fetchJson<{ success: boolean; data: any }>(
        `${BASE_URL}/ai/price-explanation/${encodeURIComponent(String(listingId))}${
          queryStr ? `?${queryStr}` : ''
        }`
      );
    },
  },
};
