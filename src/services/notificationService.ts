import { Language, NotificationType, ToastMessage } from '../types';
import { translations } from '../locales/translations';

/**
 * Sanitize any technical error into simple, human-friendly farmer messages.
 * CORE RULE: Never show technical jargon ("API request failed", "500", "Database exception", etc.)
 */
export function sanitizeFarmerErrorMessage(
  error: unknown,
  lang: Language = 'en'
): { title: string; message: string; type: NotificationType } {
  const isOffline =
    (typeof navigator !== 'undefined' && !navigator.onLine) ||
    (error instanceof Error &&
      (error.message.toLowerCase().includes('failed to fetch') ||
        error.message.toLowerCase().includes('network') ||
        error.message.toLowerCase().includes('offline') ||
        error.message.toLowerCase().includes('connection refused') ||
        error.message.toLowerCase().includes('econnrefused')));

  if (isOffline) {
    if (lang === 'ta') {
      return {
        type: 'connection',
        title: 'இணைய இணைப்பைச் சரிபார்க்கவும்.',
        message: 'மீண்டும் முயற்சிக்கவும்.',
      };
    }
    if (lang === 'hi') {
      return {
        type: 'connection',
        title: 'कृपया अपना इंटरनेट कनेक्शन जांचें।',
        message: 'कृपया दोबारा प्रयास करें।',
      };
    }
    return {
      type: 'connection',
      title: 'Please check your internet connection.',
      message: 'Please try again.',
    };
  }

  // All other errors are converted to human-friendly "Please try again."
  if (lang === 'ta') {
    return {
      type: 'problem',
      title: 'தயவுசெய்து மீண்டும் முயற்சிக்கவும்.',
      message: 'தயவுசெய்து மீண்டும் முயற்சிக்கவும்.',
    };
  }
  if (lang === 'hi') {
    return {
      type: 'problem',
      title: 'कृपया दोबारा प्रयास करें।',
      message: 'कृपया दोबारा प्रयास करें।',
    };
  }
  return {
    type: 'problem',
    title: 'Please try again.',
    message: 'Please try again.',
  };
}

/**
 * Standardized notification helpers complying with:
 * Simple, direct user-friendly messages
 */
export const farmerNotifications = {
  produceAdded: (lang: Language = 'en'): Omit<ToastMessage, 'id'> => {
    const t = translations[lang] || translations.en;
    return {
      type: 'produce',
      title: t.notify_produce_added_title || 'Produce added successfully.',
      message: t.notify_produce_added_desc || 'Buyers can now view your listing.',
    };
  },

  priceReady: (min: number, max: number, lang: Language = 'en'): Omit<ToastMessage, 'id'> => {
    if (lang === 'ta') {
      return {
        type: 'price',
        title: 'உத்தேச விலை தயாராக உள்ளது.',
        message: `எதிர்பார்க்கப்படும் வரம்பு: ₹${min}–₹${max} / கிலோ.`,
      };
    }
    if (lang === 'hi') {
      return {
        type: 'price',
        title: 'अनुमानित कीमत तैयार है।',
        message: `अनुमानित दायरा: ₹${min}–₹${max} / किलो।`,
      };
    }
    return {
      type: 'price',
      title: 'Price estimate ready.',
      message: `Expected range: ₹${min}–₹${max} per kg.`,
    };
  },

  newBidOffer: (
    buyerName: string,
    price: number,
    crop: string = 'tomatoes',
    lang: Language = 'en',
    onView?: () => void
  ): Omit<ToastMessage, 'id'> => {
    if (lang === 'ta') {
      return {
        type: 'notification',
        title: 'புதிய வாங்குபவர் சலுகை.',
        message: `${buyerName}: ₹${price}/கிலோ (${crop}).`,
        actionLabel: 'சலுகையைக் காண்க',
        onAction: onView,
        secondaryActionLabel: 'பிறகு',
      };
    }
    if (lang === 'hi') {
      return {
        type: 'notification',
        title: 'नया खरीदार प्रस्ताव प्राप्त हुआ।',
        message: `${buyerName}: ₹${price}/किलो (${crop})।`,
        actionLabel: 'प्रस्ताव देखें',
        onAction: onView,
        secondaryActionLabel: 'बाद में',
      };
    }
    return {
      type: 'notification',
      title: 'New buyer offer received.',
      message: `${buyerName} offered ₹${price}/kg for ${crop}.`,
      actionLabel: 'View Offer',
      onAction: onView,
      secondaryActionLabel: 'Later',
    };
  },

  buyerSelected: (lang: Language = 'en'): Omit<ToastMessage, 'id'> => {
    const t = translations[lang] || translations.en;
    return {
      type: 'success',
      title: t.notify_bid_accepted_title || 'Buyer selected successfully.',
      message: t.notify_bid_accepted_desc || 'Your produce is matched with the buyer.',
    };
  },

  buyerCancelled: (lang: Language = 'en'): Omit<ToastMessage, 'id'> => {
    const t = translations[lang] || translations.en;
    return {
      type: 'warning',
      title: t.notify_buyer_cancelled_title || 'The selected buyer is no longer available.',
      message: t.notify_buyer_cancelled_desc || 'We found another eligible buyer for your produce.',
    };
  },

  backupBuyerAvailable: (
    lang: Language = 'en',
    onContinue?: () => void
  ): Omit<ToastMessage, 'id'> => {
    const t = translations[lang] || translations.en;
    return {
      type: 'processing',
      title: t.notify_backup_buyer_title || 'We found another eligible buyer for your produce.',
      message: t.notify_backup_buyer_desc || 'Review the new buyer offer.',
      actionLabel: lang === 'ta' ? 'புதிய சலுகையைக் காண்க' : lang === 'hi' ? 'नया प्रस्ताव देखें' : 'View New Offer',
      onAction: onContinue,
    };
  },

  saleConfirmed: (lang: Language = 'en'): Omit<ToastMessage, 'id'> => {
    const t = translations[lang] || translations.en;
    return {
      type: 'sale',
      title: t.notify_sale_confirmed_title || 'Sale completed.',
      message: t.notify_sale_confirmed_desc || 'Your sale receipt is ready.',
    };
  },

  voiceListening: (cropContext: boolean = true, lang: Language = 'en'): Omit<ToastMessage, 'id'> => {
    const t = translations[lang] || translations.en;
    return {
      type: 'voice',
      title: t.voice_notify_listening_title || 'Listening... Please speak now.',
      message: cropContext
        ? (t.voice_notify_listening_desc || 'Examples: "Tomato", "200 kilograms", "Pennagaram"')
        : 'Examples: "Tomato", "200 kilograms", "Pennagaram"',
    };
  },

  voiceFailed: (lang: Language = 'en'): Omit<ToastMessage, 'id'> => {
    const t = translations[lang] || translations.en;
    return {
      type: 'problem',
      title: t.voice_notify_failed_title || "Sorry, I couldn't hear that. Please try again.",
      message: t.voice_notify_failed_desc || 'Please try again.',
    };
  },

  cropPoolAvailable: (onView?: () => void): Omit<ToastMessage, 'id'> => ({
    type: 'produce',
    title: '🌾 A nearby crop-pooling opportunity is available.',
    message: 'Nearby farmers have similar produce. Combine quantities to create a larger buyer lot.',
    actionLabel: 'View Pool Opportunity',
    onAction: onView,
  }),

  priceEstimateUpdated: (): Omit<ToastMessage, 'id'> => ({
    type: 'price',
    title: '💰 Your price estimate has been updated.',
    message: 'Based on recent market information.',
  }),

  buyerMatchFound: (): Omit<ToastMessage, 'id'> => ({
    type: 'info',
    title: '🤝 A potential buyer match was found.',
    message: 'Review nearby buyers matching your produce quantity and quality.',
  }),

  takeHomeReady: (): Omit<ToastMessage, 'id'> => ({
    type: 'info',
    title: '📊 Your take-home estimate is ready.',
    message: 'Estimated amount after known costs calculated.',
  }),

  voiceRequestCompleted: (summary?: string): Omit<ToastMessage, 'id'> => ({
    type: 'voice',
    title: '🎤 Voice request completed.',
    message: summary || 'Got it.',
  }),
};
