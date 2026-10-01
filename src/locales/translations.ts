import { Language } from '../types';
import { en as enBase } from './en';
import { ta as taBase } from './ta';
import { hi as hiBase } from './hi';
import enJson from './en.json';
import taJson from './ta.json';
import hiJson from './hi.json';

export const en: Record<string, string> = {
  ...enBase,
  ...enJson,
};

export const ta: Record<string, string> = {
  ...taBase,
  ...taJson,
};

export const hi: Record<string, string> = {
  ...hiBase,
  ...hiJson,
};

export const translations: Record<Language, Record<string, string>> = {
  en,
  ta,
  hi,
};

// ============================================================================
// DYNAMIC CONTENT LOCALIZATION HELPERS (Crops, Units, Status, Quality)
// ============================================================================

export function localizeCropName(rawCrop: string | undefined | null, lang: Language): string {
  if (!rawCrop) return '';
  const clean = rawCrop.split('(')[0].trim();
  const lower = clean.toLowerCase();

  const map: Record<string, { en: string; ta: string; hi: string }> = {
    tomato: { en: 'Tomato', ta: 'தக்காளி', hi: 'टमाटर' },
    'small onion': { en: 'Small Onion', ta: 'சின்ன வெங்காயம்', hi: 'छोटा प्याज' },
    'small shallot onion': { en: 'Small Onion', ta: 'சின்ன வெங்காயம்', hi: 'छोटा प्याज' },
    onion: { en: 'Onion', ta: 'வெங்காயம்', hi: 'प्याज' },
    potato: { en: 'Potato', ta: 'உருளைக்கிழங்கு', hi: 'आलू' },
    paddy: { en: 'Paddy', ta: 'நெல்', hi: 'धान' },
    'paddy / rice': { en: 'Paddy / Rice', ta: 'நெல்', hi: 'धान' },
    rice: { en: 'Rice', ta: 'அரிசி / நெல்', hi: 'चावल / धान' },
    banana: { en: 'Banana', ta: 'வாழை', hi: 'केला' },
    'banana g-9': { en: 'Banana G-9', ta: 'வாழை (G-9)', hi: 'केला (G-9)' },
    'green chilli': { en: 'Green Chilli', ta: 'பச்சை மிளகாய்', hi: 'हरी मिर्च' },
    chilli: { en: 'Chilli', ta: 'மிளகாய்', hi: 'मिर्च' },
    brinjal: { en: 'Brinjal', ta: 'கத்திரிக்காய்', hi: 'बैंगन' },
    cotton: { en: 'Cotton', ta: 'பருத்தி', hi: 'कपास' },
    coconut: { en: 'Coconut', ta: 'தேங்காய்', hi: 'नारियल' },
    turmeric: { en: 'Turmeric', ta: 'மஞ்சள்', hi: 'हल्दी' },
    'red lady papaya': { en: 'Papaya', ta: 'பப்பாளி', hi: 'पपीता' },
    papaya: { en: 'Papaya', ta: 'பப்பாளி', hi: 'पपीता' },
    cabbage: { en: 'Cabbage', ta: 'முட்டைக்கோஸ்', hi: 'पत्तागोभी' },
    okra: { en: 'Okra', ta: 'வெண்டைக்காய்', hi: 'भिंडी' },
    "lady's finger": { en: "Lady's Finger", ta: 'வெண்டைக்காய்', hi: 'भिंडी' },
    drumstick: { en: 'Drumstick', ta: 'முருங்கைக்காய்', hi: 'सहजन' },
    groundnut: { en: 'Groundnut', ta: 'நிலக்கடலை', hi: 'मूंगफली' },
    maize: { en: 'Maize', ta: 'மக்காச்சோளம்', hi: 'मक्का' },
    sugarcane: { en: 'Sugarcane', ta: 'கரும்பு', hi: 'गन्ना' },
  };

  if (map[lower]) {
    return map[lower][lang];
  }

  for (const [k, v] of Object.entries(map)) {
    if (lower.includes(k)) {
      return v[lang];
    }
  }

  return clean;
}

export function localizeUnit(rawUnit: string | undefined | null, lang: Language): string {
  if (!rawUnit) return lang === 'ta' ? 'கிலோ' : lang === 'hi' ? 'किलो' : 'kg';
  const lower = rawUnit.trim().toLowerCase();

  if (lower === 'kg' || lower === 'kgs' || lower === 'kilo' || lower === 'kilos' || lower === 'kilogram' || lower === 'kilograms' || lower === 'கிலோ' || lower === 'किलो') {
    return lang === 'ta' ? 'கிலோ' : lang === 'hi' ? 'किलो' : 'kg';
  }
  if (lower === 'quintal' || lower === 'quintals' || lower === 'qtl' || lower === 'குவிண்டால்' || lower === 'क्विंटल') {
    return lang === 'ta' ? 'குவிண்டால்' : lang === 'hi' ? 'क्विंटल' : 'quintal';
  }
  if (lower === 'ton' || lower === 'tons' || lower === 'tonne' || lower === 'tonnes' || lower === 'டன்' || lower === 'टन') {
    return lang === 'ta' ? 'டன்' : lang === 'hi' ? 'टन' : 'ton';
  }
  if (lower === 'bags' || lower === 'bag' || lower === 'மூட்டை' || lower === 'बोरी') {
    return lang === 'ta' ? 'மூட்டை' : lang === 'hi' ? 'बोरी' : 'bags';
  }
  if (lower === 'crates' || lower === 'crate' || lower === 'கிரேட்' || lower === 'क्रेट') {
    return lang === 'ta' ? 'கிரேட்' : lang === 'hi' ? 'क्रेट' : 'crates';
  }
  if (lower === 'unit') {
    return lang === 'ta' ? 'அலகு' : lang === 'hi' ? 'इकाई' : 'unit';
  }
  return rawUnit;
}

export function localizeStatus(rawStatus: string | undefined | null, lang: Language): string {
  if (!rawStatus) return '';
  const lower = rawStatus.trim().toLowerCase();

  const statusMap: Record<string, { en: string; ta: string; hi: string }> = {
    active: { en: 'Active', ta: 'செயலில் உள்ளது', hi: 'सक्रिय' },
    'active on market': { en: 'Active on Market', ta: 'சந்தையில் செயலில் உள்ளது', hi: 'बाज़ार में सक्रिय' },
    'live on market': { en: 'Live on Market', ta: 'சந்தையில் நேரலையில்', hi: 'बाज़ार में लाइव' },
    'active offer': { en: 'Active Offer', ta: 'செயலில் உள்ள சலுகை', hi: 'सक्रिय प्रस्ताव' },
    pending: { en: 'Pending', ta: 'நிலுவையில் உள்ளது', hi: 'लंबित' },
    'awaiting action': { en: 'Awaiting Action', ta: 'நடவடிக்கை நிலுவையில்', hi: 'कार्रवाई लंबित' },
    accepted: { en: 'Accepted', ta: 'ஏற்றுக்கொள்ளப்பட்டது', hi: 'स्वीकृत' },
    selected: { en: 'Selected', ta: 'தேர்ந்தெடுக்கப்பட்டது', hi: 'चुना गया' },
    rejected: { en: 'Rejected', ta: 'நிராகரிக்கப்பட்டது', hi: 'अस्वीकृत' },
    declined: { en: 'Declined', ta: 'நிராகரிக்கப்பட்டது', hi: 'अस्वीकृत' },
    completed: { en: 'Completed', ta: 'முடிந்தது', hi: 'पूर्ण' },
    confirmed: { en: 'Confirmed', ta: 'உறுதி செய்யப்பட்டது', hi: 'पुष्ट' },
    sold: { en: 'Sold', ta: 'விற்கப்பட்டது', hi: 'बिक गया' },
    paid: { en: 'Paid', ta: 'பணம் செலுத்தப்பட்டது', hi: 'भुगतान हुआ' },
    cancelled: { en: 'Cancelled', ta: 'ரத்து செய்யப்பட்டது', hi: 'रद्द किया गया' },
    negotiating: { en: 'Bids In Review', ta: 'சலுகைகள் பரிசீலனையில்', hi: 'बोलियां समीक्षा में' },
    'bids in review': { en: 'Bids In Review', ta: 'சலுகைகள் பரிசீலனையில்', hi: 'बोलियां समीक्षा में' },
    awaiting_buyer_confirmation: {
      en: 'Awaiting Buyer Confirmation',
      ta: 'வாங்குபவர் உறுதிப்படுத்தல் நிலுவையில்',
      hi: 'खरीदार की पुष्टि की प्रतीक्षा',
    },
    'awaiting buyer confirmation': {
      en: 'Awaiting Buyer Confirmation',
      ta: 'வாங்குபவர் உறுதிப்படுத்தல் நிலுவையில்',
      hi: 'खरीदार की पुष्टि की प्रतीक्षा',
    },
    backup_offered: {
      en: 'Backup Offered',
      ta: 'மாற்று வாங்குபவர் பரிந்துரை',
      hi: 'वैकल्पिक खरीदार प्रस्ताव',
    },
    backup: {
      en: 'Backup Buyer',
      ta: 'மாற்று வாங்குபவர்',
      hi: 'वैकल्पिक खरीदार',
    },
    'grade a': { en: 'Grade A', ta: 'தரம் A', hi: 'ग्रेड A' },
    'grade-a': { en: 'Grade A', ta: 'தரம் A', hi: 'ग्रेड A' },
    'grade b': { en: 'Grade B', ta: 'தரம் B', hi: 'ग्रेड B' },
    'grade-b': { en: 'Grade B', ta: 'தரம் B', hi: 'ग्रेड B' },
    'grade c': { en: 'Grade C', ta: 'தரம் C', hi: 'ग्रेड C' },
    'grade-c': { en: 'Grade C', ta: 'தரம் C', hi: 'ग्रेड C' },
  };

  return statusMap[lower]?.[lang] || rawStatus;
}

export function localizeQuality(rawQuality: string | undefined | null, lang: Language): string {
  if (!rawQuality) return '';
  const lower = rawQuality.trim().toLowerCase();

  if (lower === 'premium' || lower.includes('premium') || lower.includes('a+')) {
    return lang === 'ta' ? 'பிரீமியம் தரம்' : lang === 'hi' ? 'प्रीमियम गुणवत्ता' : 'Premium';
  }
  if (lower === 'very good' || lower.includes('very good')) {
    return lang === 'ta' ? 'மிக நல்ல தரம்' : lang === 'hi' ? 'बहुत अच्छी गुणवत्ता' : 'Very Good';
  }
  if (lower === 'good' || lower.includes('good')) {
    return lang === 'ta' ? 'நல்ல தரம்' : lang === 'hi' ? 'अच्छी गुणवत्ता' : 'Good';
  }
  if (lower === 'grade a') {
    return lang === 'ta' ? 'தரம் A' : lang === 'hi' ? 'ग्रेड A' : 'Grade A';
  }
  if (lower === 'grade b') {
    return lang === 'ta' ? 'தரம் B' : lang === 'hi' ? 'ग्रेड B' : 'Grade B';
  }
  return rawQuality;
}

// ============================================================================
// COMPREHENSIVE UI PHRASE DICTIONARY FOR NATURAL TAMIL & HINDI TRANSLATION
// ============================================================================
const PHRASE_DICTIONARY: Record<'ta' | 'hi', Record<string, string>> = {
  ta: {
    // Navigation & Roles
    'Home': 'முகப்பு',
    'Market Prices': 'சந்தை விலைகள்',
    'How It Works': 'செயல்படும் விதம்',
    'About': 'எங்களைப் பற்றி',
    'Farmer': 'விவசாயி',
    'Farmers': 'விவசாயிகள்',
    'Buyer': 'வாங்குபவர்',
    'Buyers': 'வாங்குபவர்கள்',
    'Admin': 'நிர்வாகி',
    'Administrator': 'நிர்வாகி',
    'Role': 'பங்கு',
    'Role:': 'பங்கு:',
    'Language': 'மொழி',
    'Language:': 'மொழி:',
    'Simple Mode': 'எளிய முறை',
    'Simple Mode ON': 'எளிய முறை இயக்கத்தில்',
    'Standard View': 'சாதாரண காட்சி',
    'Profile': 'சுயவிவரம்',
    'My Profile': 'எனது சுயவிவரம்',
    'Settings': 'அமைப்புகள்',
    'Notifications': 'அறிவிப்புகள்',
    'Mark all read': 'அனைத்தையும் படித்ததாகக் குறி',
    'No notifications.': 'அறிவிப்புகள் எதுவும் இல்லை.',
    'Logout': 'வெளியேறு',
    'Sign In': 'உள்நுழைக',
    'Sign Out': 'வெளியேறு',
    'Menu': 'பட்டியல்',
    'More': 'மேலும்',
    'Farmer Helpline': 'விவசாயி உதவி எண்',
    'Helpline': 'உதவி எண்',
    'Call': 'அழைக்க',
    'Support': 'உதவி மையம்',
    'Right Price. Right Buyer. Right Time.': 'சரியான விலை. சரியான வாங்குபவர். சரியான நேரம்.',
    'Helping farmers make informed selling decisions and connect with buyers.':
      'விவசாயிகள் சரியான விற்பனை முடிவை எடுக்கவும் வாங்குபவர்களுடன் இணையவும் உதவுகிறது.',

    // Sidebar & Bottom Nav Items
    'Farm Decision': 'விற்பனை முடிவு',
    'Farm Decision & Net Realisation': 'விற்பனை முடிவு & நிகர வருமானம்',
    'Add Produce': 'விளைபொருளைச் சேர்க்கவும்',
    'My Listings': 'எனது பட்டியல்கள்',
    'Buyer Offers': 'வாங்குபவர் சலுகைகள்',
    'My Sales': 'எனது விற்பனைகள்',
    'Find Produce': 'விளைபொருள் தேடுக',
    'My Bids': 'எனது ஏலங்கள்',
    'Purchases': 'கொள்முதல்கள்',
    'Dashboard': 'முகப்புப் பலகை',
    'Listings': 'பட்டியல்கள்',
    'Bids': 'ஏலங்கள்',
    'Transactions': 'பரிவர்த்தனைகள்',
    'Market Data': 'சந்தை விவரம்',
    'Reports': 'அறிக்கைகள்',

    // Farmer Dashboard
    'Net Realisation & Options': 'நிகர வருமானம் & வழிகள்',
    'Compare Sell Now, Options & Net Realisation': 'இப்போது விற்பனை, மாற்று வழிகள் & நிகர வருமானத்தை ஒப்பிடுக',
    'List your produce': 'உங்கள் விளைபொருளைப் பட்டியலிடுங்கள்',
    'List your harvest for sale': 'விற்பனைக்கு உங்கள் அறுவடையைச் சேர்க்கவும்',
    "Check today's mandi rates": 'இன்றைய சந்தை விலையைப் பார்க்கவும்',
    'View and accept buyer bids': 'வாங்குபவர் சலுகைகளைப் பார்த்து ஏற்கவும்',
    'Farm Decision Engine & Net Realisation Comparison': 'விற்பனை முடிவு & நிகர வருமான ஒப்பீடு',
    'Open Full Decision Studio': 'முழு விற்பனை ஆலோசனை பக்கம்',
    'Price Insight': 'விலை விவரம்',
    'Current Price, Expected Range & Sell-or-Wait Advisor': 'தற்போதைய விலை, எதிர்பார்க்கப்படும் வரம்பு & விற்பனை ஆலோசனை',
    'Latest Offers': 'சமீபத்திய சலுகைகள்',
    'No pending buyer offers.': 'நிலுவையில் வாங்குபவர் சலுகைகள் இல்லை.',
    'Nearby Opportunities': 'அருகிலுள்ள வாய்ப்புகள்',
    'Nearby Buyers & Possible Crop Pooling': 'அருகிலுள்ள வாங்குபவர்கள் & கூட்டு விற்பனை வாய்ப்பு',
    'No completed sales yet.': 'இன்னும் முடிந்த விற்பனைகள் இல்லை.',
    'Completed': 'முடிந்தது',
    'Active': 'செயலில் உள்ளது',
    'Pending': 'நிலுவையில் உள்ளது',
    'Accepted': 'ஏற்றுக்கொள்ளப்பட்டது',
    'Rejected': 'நிராகரிக்கப்பட்டது',
    'Declined': 'நிராகரிக்கப்பட்டது',
    'Cancelled': 'ரத்து செய்யப்பட்டது',

    // Cards & Actions
    'Offered Rate & Quantity': 'சலுகை விலை & அளவு',
    'Offered Price': 'சலுகை விலை',
    'Required Qty': 'தேவையான அளவு',
    'Gross Value': 'மொத்த மதிப்பு',
    'Pickup': 'எடுத்துச்செல்லுதல்',
    'Payment': 'பணம் செலுத்தும் முறை',
    'Buyer Note:': 'வாங்குபவர் குறிப்பு:',
    'Buyer Note: ': 'வாங்குபவர் குறிப்பு: ',
    'View Offer': 'சலுகையைப் பார்',
    'View New Offer': 'புதிய சலுகையைப் பார்',
    'View Details': 'விவரம் காண்க',
    'Produce Details': 'விளைபொருள் விவரம்',
    'Place Bid': 'விலை சலுகை அளிக்க',
    'Submit Bid': 'சலுகையை சமர்ப்பி',
    'Accept': 'ஏற்றுக்கொள்',
    'Decline': 'நிராகரி',
    'Reject': 'நிராகரி',
    'Cancel': 'ரத்து செய்',
    'Cancel Bid': 'ஏலத்தை ரத்து செய்',
    'Confirm': 'உறுதி செய்',
    'Edit': 'திருத்து',
    'Done Editing': 'திருத்தம் முடிந்தது',
    'Save': 'சேமி',
    'Refresh': 'புதுப்பி',
    'Close': 'மூடு',
    'Go Back': 'பின் செல்லவும்',
    'Back': 'பின் செல்',
    'Next': 'அடுத்து',
    'Continue': 'தொடரவும்',
    'Yes, Continue': 'ஆம், தொடரவும்',
    'Are you sure?': 'நீங்கள் உறுதியாக உள்ளீர்களா?',
    'Offer received today': 'இன்று பெறப்பட்ட சலுகை',
    'Deal confirmed! Direct farm pickup unlocked.': 'விற்பனை உறுதியானது! பண்ணையில் நேரடி கொள்முதல் தயார்.',
    'Purchase completed & settled via UPI. Weighment slip archived.': 'கொள்முதல் முடிந்து UPI மூலம் பணம் செலுத்தப்பட்டது. எடை ரசீது சேமிக்கப்பட்டது.',
    'Waiting for farmer approval at village kiosk': 'விவசாயியின் ஒப்புதலுக்காக காத்திருக்கிறது',
    'Current market information': 'தற்போதைய சந்தை விலை',
    'Expected range': 'எதிர்பார்க்கப்படும் விலை வரம்பு',
    'Prices can change based on market conditions.': 'சந்தை நிலவரத்திற்கு ஏற்ப விலைகள் மாறலாம்.',
    'View Trend →': 'விலை போக்கைக் காண்க →',
    'Price Estimate': 'விலை மதிப்பீடு',
    'Immediate UPI': 'உடனடி UPI பணம்',
    'Immediate UPI at Weighment': 'எடை போட்டவுடன் உடனடி UPI பணம்',
    'Buyer Pickup from Farm Gate': 'பண்ணையிலிருந்து வாங்குபவர் நேரடி கொள்முதல்',
    'Buyer Pickup from Farm Gate (₹0 transport)': 'பண்ணையில் நேரடி கொள்முதல் (₹0 போக்குவரத்து செலவு)',
    'Kiosk Center Dropoff': 'கிராம மையத்தில் ஒப்படைப்பு',
    'Village Kiosk Dropoff': 'கிராம மையத்தில் ஒப்படைப்பு',
    'Bank Transfer on Weighment': 'எடைக்குப் பிறகு வங்கி பரிமாற்றம்',

    // Add Produce Page
    'What are you selling?': 'நீங்கள் என்ன விற்க விரும்புகிறீர்கள்?',
    'Select your crop or search below.': 'உங்கள் பயிரைத் தேர்ந்தெடுக்கவும் அல்லது கீழே தேடவும்.',
    'How much do you have?': 'உங்களிடம் எவ்வளவு அளவு உள்ளது?',
    'Enter quantity and select unit.': 'அளவை உள்ளிட்டு எடை அலகைத் தேர்ந்தெடுக்கவும்.',
    'Where is your produce?': 'உங்கள் விளைபொருள் எங்கே உள்ளது?',
    'Select your village and district.': 'உங்கள் ஊர் மற்றும் மாவட்டத்தைத் தேர்ந்தெடுக்கவும்.',
    'Tell us about the quality': 'விளைபொருளின் தரம் எப்படி உள்ளது?',
    'Select the option that describes your produce.': 'உங்கள் விளைபொருளுக்குப் பொருத்தமான தரத்தைத் தேர்ந்தெடுக்கவும்.',
    'When do you want to sell?': 'எப்போது விற்க விரும்புகிறீர்கள்?',
    'Choose your preferred selling date.': 'நீங்கள் விற்க விரும்பும் தேதியைத் தேர்ந்தெடுக்கவும்.',
    'Produce Summary': 'விளைபொருள் சுருக்கம்',
    'Review your produce details and check your estimated market range.':
      'உங்கள் விளைபொருள் விவரங்களைச் சரிபார்த்து எதிர்பார்க்கப்படும் சந்தை விலையைப் பார்க்கவும்.',
    'Get Price Estimate': 'விலை மதிப்பீட்டைப் பெறுக',
    'Publish Produce Listing': 'விளைபொருளை விற்பனைக்கு வெளியிடு',
    'Publish Listing': 'பட்டியலை வெளியிடு',
    'Your produce has been published.': 'உங்கள் விளைபொருள் வெற்றிகரமாக பட்டியலிடப்பட்டது.',
    'Your produce has been successfully listed.': 'உங்கள் விளைபொருள் வெற்றிகரமாக பட்டியலிடப்பட்டது.',
    'Based on recent market information. Nearby buyers can now send offers.':
      'சமீபத்திய சந்தை தகவலின் அடிப்படையில். அருகிலுள்ள வாங்குபவர்கள் இப்போது சலுகைகளை அனுப்பலாம்.',
    'Crop': 'பயிர்',
    'Crop:': 'பயிர்:',
    'Quantity': 'அளவு',
    'Quantity:': 'அளவு:',
    'Unit': 'அலகு',
    'Quality': 'தரம்',
    'Quality Grade': 'தர வகை',
    'Location': 'இடம் / ஊர்',
    'Village / District': 'கிராமம் / மாவட்டம்',
    'Selling Date': 'விற்பனை தேதி',
    'Today': 'இன்று',
    'Tomorrow': 'நாளை',
    'Within 2 Days': '2 நாட்களுக்குள்',
    'This Week': 'இந்த வாரம்',
    'Good': 'நல்ல தரம்',
    'Very Good': 'மிக நல்ல தரம்',
    'Premium': 'பிரீமியம் தரம்',

    // Buyer Offers & Bidding
    'Compare buyer offers and select the best option for your harvest.':
      'வாங்குபவர் சலுகைகளை ஒப்பிட்டு உங்கள் அறுவடைக்கு சிறந்ததைத் தேர்ந்தெடுக்கவும்.',
    'Comparison Matrix': 'ஒப்பீட்டு அட்டவணை',
    'Card View': 'அட்டை காட்சி',
    'Total Offers': 'மொத்த சலுகைகள்',
    'Verified Buyers': 'சரிபார்க்கப்பட்ட வாங்குபவர்கள்',
    'The selected buyer is no longer available.': 'தேர்ந்தெடுக்கப்பட்ட வாங்குபவர் இப்போது கிடைக்கவில்லை.',
    'We found another eligible buyer for your produce.': 'உங்கள் விளைபொருளுக்கு மற்றொரு தகுதியான வாங்குபவரைக் கண்டறிந்துள்ளோம்.',
    'Select Buyer': 'வாங்குபவரைத் தேர்ந்தெடு',
    'Offer Details': 'சலுகை விவரங்கள்',
    "Buyer's Current Offer": 'வாங்குபவரின் தற்போதைய சலுகை',
    'Send Counter Offer': 'மாற்று விலை சலுகை அனுப்பு',

    // Farm Decision Engine & Net Realisation
    'Farm Decision & Net Realisation Advisor': 'விற்பனை முடிவு & நிகர வருமான ஆலோசகர்',
    'Farm Decision Engine • AI-Assisted Decision Support': 'விற்பனை முடிவு இயந்திரம் • AI உதவி ஆலோசனை',
    'Based on the available market information, these are your current options.':
      'கிடைத்துள்ள சந்தை தகவலின் அடிப்படையில், உங்களுக்கான தற்போதைய வழிகள் இங்கே உள்ளன.',
    'Compare selling now, comparing buyer/pool channels, or short-term waiting based on estimated net realization after known costs.':
      'போக்குவரத்து மற்றும் இதர செலவுகளுக்குப் பிறகு கிடைக்கும் நிகர வருமானத்தின் அடிப்படையில் இப்போது விற்பதா, மற்ற சலுகைகளை ஒப்பிடுவதா அல்லது காத்திருப்பதா என்பதை ஒப்பிடுங்கள்.',
    'Listen to Options': 'வழிகளைக் கேளுங்கள்',
    'Hide Lot & Cost Inputs': 'விவரங்களை மறை',
    'Customize Crop, Storage & Costs': 'பயிர், சேமிப்பு & செலவுகளை மாற்றுக',
    'Edit Inputs': 'விவரங்களைத் திருத்து',
    'A. SELL NOW': 'A. இப்போது விற்கலாம்',
    'B. COMPARE OPTIONS': 'B. சலுகைகளை ஒப்பிடுக',
    'C. CONSIDER WAITING/STORING': 'C. சேமிப்பு இருந்தால் காத்திருக்கலாம்',
    'Consider selling now': 'இப்போது விற்பதைப் பரிசீலிக்கலாம்',
    'Consider comparing other offers': 'மற்ற சலுகைகளை ஒப்பிட்டுப் பார்க்கலாம்',
    'Consider waiting if storage is available': 'பாதுகாப்பான சேமிப்பு இருந்தால் காத்திருக்கலாம்',
    'Direct Farm-Gate Buyer Offer': 'பண்ணையில் நேரடி வாங்குபவர் சலுகை',
    'Compare Buyers, Mandi & Crop Pool': 'வாங்குபவர்கள், மண்டி & கூட்டு விற்பனையை ஒப்பிடுக',
    'Review Buyer Offers': 'வாங்குபவர் சலுகைகளைப் பார்',
    'Compare Net Realisation Below': 'கீழே நிகர வருமானத்தை ஒப்பிடுக',
    'Check 6-Day Market Trend': '6-நாள் சந்தை விலைப் போக்கைப் பார்',

    // Voice Assistant
    'Ask FarmGrade • Voice Market Assistant': 'பார்ம்கிரேடு குரல் சந்தை உதவியாளர்',
    'Speak → Understand → Analyze → Explain → Show Options → Farmer Decides':
      'பேசுக → புரிந்துகொள் → ஆய்வு செய் → விளக்கு → வழிகளைக் காட்டு → விவசாயி முடிவு',
    'Hide Text Input': 'உரை பெட்டியை மறை',
    'Type instead': 'தட்டச்சு செய்க',
    'Ask FarmGrade': 'பார்ம்கிரேடிடம் கேள்',
    'Or tap a spoken phrase to test the complete voice flow:':
      'அல்லது கீழே உள்ள கேள்வியைத் தொட்டு குரல் உதவியைச் சோதிக்கவும்:',
    'Listen Again': 'மீண்டும் கேள்',
    'Voice → Action: Pre-Fill Produce Confirmation': 'குரல் → செயல்: விளைபொருள் விவரம் உறுதிப்படுத்தல்',
    'Confirmation Required': 'உறுதிப்படுத்தல் தேவை',
    'Question:': 'கேள்வி:',
    '"Is this correct?"': '"இது சரியா?"',
    'Open in Add Produce Form': 'விளைபொருள் சேர்க்கும் படிவத்தில் திற',
    'Open Full Buyer Offers Page': 'முழு வாங்குபவர் சலுகைகள் பக்கம்',
    'Decision support only — the final decision belongs to the farmer.':
      'இது விற்பனை ஆலோசனை மட்டுமே — இறுதி முடிவு விவசாயியுடையது.',

    // Profile & Settings & Auth
    'Farmer Profile & Settings': 'விவசாயி சுயவிவரம் & அமைப்புகள்',
    'Buyer Profile & Settings': 'வாங்குபவர் சுயவிவரம் & அமைப்புகள்',
    'Administrator Profile & Settings': 'நிர்வாகி சுயவிவரம் & அமைப்புகள்',
    'Manage contact details, linked accounts, language, and security settings.':
      'தொடர்பு விவரங்கள், இணைக்கப்பட்ட கணக்குகள், மொழி மற்றும் பாதுகாப்பு அமைப்புகளை நிர்வகிக்கவும்.',
    'Edit Profile': 'சுயவிவரத்தைத் திருத்து',
    'Cancel Editing': 'திருத்தத்தை ரத்து செய்',
    'Save Profile Changes': 'சுயவிவர மாற்றங்களைச் சேமி',
    'Verified': 'சரிபார்க்கப்பட்டது',
    'Verification Status': 'சரிபார்ப்பு நிலை',
    'Direct UPI Payouts Enabled': 'நேரடி UPI பணப் பரிமாற்றம் செயலில் உள்ளது',
    'Full Name': 'முழுப் பெயர்',
    'Mobile Number (SMS & Calls)': 'கைபேசி எண் (SMS & அழைப்புகள்)',
    'Village / Panchayat': 'கிராமம் / பஞ்சாயத்து',
    'Business Location': 'வணிக இடம்',
    'District': 'மாவட்டம்',
    'Payout UPI ID (Instant Bank Settlement)': 'UPI ஐடி (உடனடி வங்கி வரவு)',
    'Farm / Landholding': 'பண்ணை / நில விவரம்',
    'Registered Business': 'பதிவு செய்யப்பட்ட நிறுவனம்',
    'Welcome to FarmGrade': 'பார்ம்கிரேடிற்கு வரவேற்கிறோம்',
    'Connect with the right market for your produce.': 'உங்கள் விளைபொருளுக்கு ஏற்ற சரியான சந்தையுடன் இணையுங்கள்.',
    'Signing you in...': 'உள்நுழைகிறது...',
    'Create your account': 'உங்கள் கணக்கை உருவாக்கவும்',
    'Choose your account type': 'உங்கள் கணக்கு வகையைத் தேர்ந்தெடுக்கவும்',
    'Verify your details': 'உங்கள் விவரங்களைச் சரிபார்க்கவும்',
    'Account Recovery': 'கணக்கு மீட்பு',
  },

  hi: {
    // Navigation & Roles
    'Home': 'होम',
    'Market Prices': 'बाज़ार भाव',
    'How It Works': 'यह कैसे काम करता है',
    'About': 'हमारे बारे में',
    'Farmer': 'किसान',
    'Farmers': 'किसान',
    'Buyer': 'खरीदार',
    'Buyers': 'खरीदार',
    'Admin': 'एडमिन',
    'Administrator': 'प्रशासक',
    'Role': 'भूमिका',
    'Role:': 'भूमिका:',
    'Language': 'भाषा',
    'Language:': 'भाषा:',
    'Simple Mode': 'सरल मोड',
    'Simple Mode ON': 'सरल मोड चालू',
    'Standard View': 'सामान्य दृश्य',
    'Profile': 'प्रोफ़ाइल',
    'My Profile': 'मेरी प्रोफ़ाइल',
    'Settings': 'सेटिंग्स',
    'Notifications': 'सूचनाएं',
    'Mark all read': 'सभी को पढ़ा हुआ चिह्नित करें',
    'No notifications.': 'कोई सूचना नहीं।',
    'Logout': 'लॉग आउट',
    'Sign In': 'साइन इन करें',
    'Sign Out': 'लॉग आउट',
    'Menu': 'मेनू',
    'More': 'अधिक',
    'Farmer Helpline': 'किसान हेल्पलाइन',
    'Helpline': 'हेल्पलाइन',
    'Call': 'कॉल करें',
    'Support': 'सहायता केंद्र',
    'Right Price. Right Buyer. Right Time.': 'सही दाम. सही खरीदार. सही समय.',
    'Helping farmers make informed selling decisions and connect with buyers.':
      'किसानों को सही बिक्री निर्णय लेने और खरीदारों से जुड़ने में मदद करना।',

    // Sidebar & Bottom Nav Items
    'Farm Decision': 'बिक्री निर्णय',
    'Farm Decision & Net Realisation': 'बिक्री निर्णय और शुद्ध आय',
    'Add Produce': 'उपज जोड़ें',
    'My Listings': 'मेरी सूचियाँ',
    'Buyer Offers': 'खरीदार प्रस्ताव',
    'My Sales': 'मेरी बिक्री',
    'Find Produce': 'उपज खोजें',
    'My Bids': 'मेरी बोलियां',
    'Purchases': 'खरीदारी',
    'Dashboard': 'डैशबोर्ड',
    'Listings': 'सूचियाँ',
    'Bids': 'बोलियां',
    'Transactions': 'लेन-देन',
    'Market Data': 'बाज़ार डेटा',
    'Reports': 'रिपोर्ट',

    // Farmer Dashboard
    'Net Realisation & Options': 'शुद्ध आय और विकल्प',
    'Compare Sell Now, Options & Net Realisation': 'अभी बेचें, विकल्प और शुद्ध आय की तुलना करें',
    'List your produce': 'अपनी उपज सूचीबद्ध करें',
    'List your harvest for sale': 'अपनी फसल बिक्री के लिए दर्ज करें',
    "Check today's mandi rates": 'आज के मंडी भाव देखें',
    'View and accept buyer bids': 'खरीदारों के प्रस्ताव देखें और स्वीकार करें',
    'Farm Decision Engine & Net Realisation Comparison': 'बिक्री निर्णय इंजन और शुद्ध आय तुलना',
    'Open Full Decision Studio': 'पूरा निर्णय स्टूडियो खोलें',
    'Price Insight': 'मूल्य जानकारी',
    'Current Price, Expected Range & Sell-or-Wait Advisor': 'वर्तमान भाव, अनुमानित दायरा और बिक्री सलाहकार',
    'Latest Offers': 'नवीनतम प्रस्ताव',
    'No pending buyer offers.': 'कोई लंबित खरीदार प्रस्ताव नहीं है।',
    'Nearby Opportunities': 'आस-पास के अवसर',
    'Nearby Buyers & Possible Crop Pooling': 'आस-पास के खरीदार और सामूहिक बिक्री अवसर',
    'No completed sales yet.': 'अभी तक कोई पूरी हुई बिक्री नहीं है।',
    'Completed': 'पूर्ण',
    'Active': 'सक्रिय',
    'Pending': 'लंबित',
    'Accepted': 'स्वीकृत',
    'Rejected': 'अस्वीकृत',
    'Declined': 'अस्वीकृत',
    'Cancelled': 'रद्द किया गया',

    // Cards & Actions
    'Offered Rate & Quantity': 'प्रस्तावित दर और मात्रा',
    'Offered Price': 'प्रस्तावित कीमत',
    'Required Qty': 'आवश्यक मात्रा',
    'Gross Value': 'कुल मूल्य',
    'Pickup': 'पिकअप / उठान',
    'Payment': 'भुगतान',
    'Buyer Note:': 'खरीदार की टिप्पणी:',
    'Buyer Note: ': 'खरीदार की टिप्पणी: ',
    'View Offer': 'प्रस्ताव देखें',
    'View New Offer': 'नया प्रस्ताव देखें',
    'View Details': 'विवरण देखें',
    'Produce Details': 'उपज विवरण',
    'Place Bid': 'बोली लगाएं',
    'Submit Bid': 'बोली जमा करें',
    'Accept': 'स्वीकार करें',
    'Decline': 'अस्वीकार करें',
    'Reject': 'अस्वीकार करें',
    'Cancel': 'रद्द करें',
    'Cancel Bid': 'बोली रद्द करें',
    'Confirm': 'पुष्टि करें',
    'Edit': 'बदलें',
    'Done Editing': 'बदलाव पूरा हुआ',
    'Save': 'सहेजें',
    'Refresh': 'रीफ्रेश करें',
    'Close': 'बंद करें',
    'Go Back': 'वापस जाएं',
    'Back': 'वापस',
    'Next': 'आगे',
    'Continue': 'जारी रखें',
    'Yes, Continue': 'हाँ, आगे बढ़ें',
    'Are you sure?': 'क्या आप निश्चित हैं?',
    'Offer received today': 'आज प्राप्त प्रस्ताव',
    'Deal confirmed! Direct farm pickup unlocked.': 'सौदा पक्का हुआ! खेत से सीधा पिकअप तैयार है।',
    'Purchase completed & settled via UPI. Weighment slip archived.':
      'खरीद पूरी हुई और UPI से भुगतान हो गया। तौल पर्ची सुरक्षित है।',
    'Waiting for farmer approval at village kiosk': 'किसान की स्वीकृति की प्रतीक्षा है',
    'Current market information': 'वर्तमान बाज़ार भाव',
    'Expected range': 'अनुमानित मूल्य दायरा',
    'Prices can change based on market conditions.': 'बाज़ार की स्थिति के अनुसार कीमतें बदल सकती हैं।',
    'View Trend →': 'भाव का रुझान देखें →',
    'Price Estimate': 'मूल्य अनुमान',
    'Immediate UPI': 'तुरंत UPI भुगतान',
    'Immediate UPI at Weighment': 'तौल पर तुरंत UPI भुगतान',
    'Buyer Pickup from Farm Gate': 'खेत से खरीदार द्वारा पिकअप',
    'Buyer Pickup from Farm Gate (₹0 transport)': 'खेत से पिकअप (₹0 परिवहन खर्च)',
    'Kiosk Center Dropoff': 'ग्राम कियोस्क केंद्र पर जमा',
    'Village Kiosk Dropoff': 'ग्राम कियोस्क केंद्र पर जमा',
    'Bank Transfer on Weighment': 'तौल पर बैंक ट्रांसफर',

    // Add Produce Page
    'What are you selling?': 'आप क्या बेच रहे हैं?',
    'Select your crop or search below.': 'अपनी फसल चुनें या नीचे खोजें।',
    'How much do you have?': 'आपके पास कितनी मात्रा है?',
    'Enter quantity and select unit.': 'मात्रा दर्ज करें और इकाई चुनें।',
    'Where is your produce?': 'आपकी उपज कहाँ है?',
    'Select your village and district.': 'अपना गाँव और जिला चुनें।',
    'Tell us about the quality': 'गुणवत्ता के बारे में बताएं',
    'Select the option that describes your produce.': 'अपनी उपज की गुणवत्ता चुनें।',
    'When do you want to sell?': 'आप कब बेचना चाहते हैं?',
    'Choose your preferred selling date.': 'अपनी पसंदीदा बिक्री तारीख चुनें।',
    'Produce Summary': 'उपज सारांश',
    'Review your produce details and check your estimated market range.':
      'अपनी उपज का विवरण जांचें और अनुमानित बाज़ार भाव देखें।',
    'Get Price Estimate': 'मूल्य अनुमान प्राप्त करें',
    'Publish Produce Listing': 'उपज सूची प्रकाशित करें',
    'Publish Listing': 'सूची प्रकाशित करें',
    'Your produce has been published.': 'आपकी उपज सफलतापूर्वक सूचीबद्ध हो गई है.',
    'Your produce has been successfully listed.': 'आपकी उपज सफलतापूर्वक सूचीबद्ध हो गई है.',
    'Based on recent market information. Nearby buyers can now send offers.':
      'हाल की बाज़ार जानकारी के आधार पर। आस-पास के खरीदार अब प्रस्ताव भेज सकते हैं।',
    'Crop': 'फसल',
    'Crop:': 'फसल:',
    'Quantity': 'मात्रा',
    'Quantity:': 'मात्रा:',
    'Unit': 'इकाई',
    'Quality': 'गुणवत्ता',
    'Quality Grade': 'गुणवत्ता ग्रेड',
    'Location': 'स्थान / गाँव',
    'Village / District': 'गाँव / जिला',
    'Selling Date': 'बिक्री की तारीख',
    'Today': 'आज',
    'Tomorrow': 'कल',
    'Within 2 Days': '2 दिनों के भीतर',
    'This Week': 'इस सप्ताह',
    'Good': 'अच्छी गुणवत्ता',
    'Very Good': 'बहुत अच्छी गुणवत्ता',
    'Premium': 'प्रीमियम गुणवत्ता',

    // Buyer Offers & Bidding
    'Compare buyer offers and select the best option for your harvest.':
      'खरीदारों के प्रस्तावों की तुलना करें और अपनी फसल के लिए सबसे अच्छा विकल्प चुनें।',
    'Comparison Matrix': 'तुलना तालिका',
    'Card View': 'कार्ड दृश्य',
    'Total Offers': 'कुल प्रस्ताव',
    'Verified Buyers': 'सत्यापित खरीदार',
    'The selected buyer is no longer available.': 'चुना गया खरीदार अब उपलब्ध नहीं है।',
    'We found another eligible buyer for your produce.': 'हमने आपकी उपज के लिए एक और योग्य खरीदार ढूंढा है।',
    'Select Buyer': 'खरीदार चुनें',
    'Offer Details': 'प्रस्ताव विवरण',
    "Buyer's Current Offer": 'खरीदार का वर्तमान प्रस्ताव',
    'Send Counter Offer': 'काउंटर प्रस्ताव भेजें',

    // Farm Decision Engine & Net Realisation
    'Farm Decision & Net Realisation Advisor': 'बिक्री निर्णय और शुद्ध आय सलाहकार',
    'Farm Decision Engine • AI-Assisted Decision Support': 'बिक्री निर्णय इंजन • एआई निर्णय सहायता',
    'Based on the available market information, these are your current options.':
      'उपलब्ध बाज़ार जानकारी के आधार पर, ये आपके वर्तमान विकल्प हैं।',
    'Compare selling now, comparing buyer/pool channels, or short-term waiting based on estimated net realization after known costs.':
      'ज्ञात खर्चों के बाद अनुमानित शुद्ध आय के आधार पर अभी बेचने, अन्य विकल्पों की तुलना करने या रुकने का मूल्यांकन करें।',
    'Listen to Options': 'विकल्प सुनें',
    'Hide Lot & Cost Inputs': 'इनपुट छुपाएं',
    'Customize Crop, Storage & Costs': 'फसल, भंडारण और खर्च बदलें',
    'Edit Inputs': 'इनपुट बदलें',
    'A. SELL NOW': 'A. अभी बेचें',
    'B. COMPARE OPTIONS': 'B. विकल्पों की तुलना करें',
    'C. CONSIDER WAITING/STORING': 'C. भंडारण हो तो रुकने पर विचार करें',
    'Consider selling now': 'अभी बेचने पर विचार करें',
    'Consider comparing other offers': 'अन्य प्रस्तावों की तुलना करने पर विचार करें',
    'Consider waiting if storage is available': 'यदि भंडारण उपलब्ध है तो रुकने पर विचार करें',
    'Direct Farm-Gate Buyer Offer': 'खेत से सीधा खरीदार प्रस्ताव',
    'Compare Buyers, Mandi & Crop Pool': 'खरीदार, मंडी और सामूहिक बिक्री की तुलना करें',
    'Review Buyer Offers': 'खरीदार प्रस्ताव देखें',
    'Compare Net Realisation Below': 'नीचे शुद्ध आय की तुलना करें',
    'Check 6-Day Market Trend': '6-दिन का बाज़ार रुझान देखें',

    // Voice Assistant
    'Ask FarmGrade • Voice Market Assistant': 'फार्मग्रेड वॉइस बाज़ार सहायक',
    'Speak → Understand → Analyze → Explain → Show Options → Farmer Decides':
      'बोलें → समझें → विश्लेषण करें → समझाएं → विकल्प दिखाएं → किसान का निर्णय',
    'Hide Text Input': 'टेक्स्ट इनपुट छुपाएं',
    'Type instead': 'लिखकर पूछें',
    'Ask FarmGrade': 'फार्मग्रेड से पूछें',
    'Or tap a spoken phrase to test the complete voice flow:':
      'या वॉइस सहायक का परीक्षण करने के लिए नीचे किसी वाक्य पर टैप करें:',
    'Listen Again': 'फिर से सुनें',
    'Voice → Action: Pre-Fill Produce Confirmation': 'आवाज़ → कार्रवाई: उपज विवरण की पुष्टि',
    'Confirmation Required': 'पुष्टि आवश्यक है',
    'Question:': 'प्रश्न:',
    '"Is this correct?"': '"क्या यह सही है?"',
    'Open in Add Produce Form': 'उपज जोड़ें फॉर्म में खोलें',
    'Open Full Buyer Offers Page': 'पूरा खरीदार प्रस्ताव पृष्ठ खोलें',
    'Decision support only — the final decision belongs to the farmer.':
      'केवल निर्णय सहायता — अंतिम निर्णय किसान का है।',

    // Profile & Settings & Auth
    'Farmer Profile & Settings': 'किसान प्रोफ़ाइल और सेटिंग्स',
    'Buyer Profile & Settings': 'खरीदार प्रोफ़ाइल और सेटिंग्स',
    'Administrator Profile & Settings': 'प्रशासक प्रोफ़ाइल और सेटिंग्स',
    'Manage contact details, linked accounts, language, and security settings.':
      'संपर्क विवरण, जुड़े खाते, भाषा और सुरक्षा सेटिंग्स प्रबंधित करें।',
    'Edit Profile': 'प्रोफ़ाइल संपादित करें',
    'Cancel Editing': 'संपादन रद्द करें',
    'Save Profile Changes': 'प्रोफ़ाइल बदलाव सहेजें',
    'Verified': 'सत्यापित',
    'Verification Status': 'सत्यापन स्थिति',
    'Direct UPI Payouts Enabled': 'सीधा UPI भुगतान सक्रिय है',
    'Full Name': 'पूरा नाम',
    'Mobile Number (SMS & Calls)': 'मोबाइल नंबर (SMS और कॉल)',
    'Village / Panchayat': 'गाँव / पंचायत',
    'Business Location': 'व्यापार स्थान',
    'District': 'जिला',
    'Payout UPI ID (Instant Bank Settlement)': 'भुगतान UPI आईडी (तुरंत बैंक सेटलमेंट)',
    'Farm / Landholding': 'खेत / भूमि विवरण',
    'Registered Business': 'पंजीकृत व्यवसाय',
    'Welcome to FarmGrade': 'फार्मग्रेड में आपका स्वागत है',
    'Connect with the right market for your produce.': 'अपनी उपज के लिए सही बाज़ार से जुड़ें।',
    'Signing you in...': 'साइन इन हो रहा है...',
    'Create your account': 'अपना खाता बनाएं',
    'Choose your account type': 'अपना खाता प्रकार चुनें',
    'Verify your details': 'अपने विवरण की पुष्टि करें',
    'Account Recovery': 'खाता रिकवरी',
  },
};

// Build case-insensitive lookup maps for fast translation
const LOWER_PHRASE_MAP: Record<'ta' | 'hi', Map<string, string>> = {
  ta: new Map(),
  hi: new Map(),
};

for (const lang of ['ta', 'hi'] as const) {
  // First add key-based English -> Target mappings from en & target locale
  for (const [key, enVal] of Object.entries(en)) {
    const targetVal = translations[lang][key];
    if (enVal && targetVal) {
      LOWER_PHRASE_MAP[lang].set(enVal.trim().toLowerCase(), targetVal);
    }
  }
  // Then add explicit phrase dictionary mappings
  for (const [enPhrase, targetPhrase] of Object.entries(PHRASE_DICTIONARY[lang])) {
    LOWER_PHRASE_MAP[lang].set(enPhrase.trim().toLowerCase(), targetPhrase);
  }
}

export function translateText(rawInput: string, lang: Language): string {
  if (!rawInput) return '';
  if (lang === 'en') {
    if (en[rawInput]) return en[rawInput];
    // Clean multi-script crop names in English mode like "Tomato (நாட்டு தக்காளி / देशी टमाटर)" -> "Tomato"
    if (rawInput.includes('(') && /[\u0B80-\u0BFF\u0900-\u097F]/.test(rawInput)) {
      return rawInput.replace(/\s*\([^)]*[\u0B80-\u0BFF\u0900-\u097F][^)]*\)/g, '').trim();
    }
    return rawInput;
  }

  // Direct key lookup first
  if (translations[lang][rawInput]) {
    return translations[lang][rawInput];
  }

  const leadingSpace = rawInput.match(/^\s*/)?.[0] || '';
  const trailingSpace = rawInput.match(/\s*$/)?.[0] || '';
  const trimmed = rawInput.trim();
  if (!trimmed) return rawInput;

  const lower = trimmed.toLowerCase();

  // Exact phrase match
  const exact = LOWER_PHRASE_MAP[lang].get(lower);
  if (exact) {
    return `${leadingSpace}${exact}${trailingSpace}`;
  }

  // Handle multi-script crop titles e.g. "Tomato (நாட்டு தக்காளி / देशी टमाटर)"
  if (trimmed.includes('(') && /[\u0B80-\u0BFF\u0900-\u097F]/.test(trimmed)) {
    const baseCrop = trimmed.split('(')[0].trim();
    const localized = localizeCropName(baseCrop, lang);
    if (localized) return `${leadingSpace}${localized}${trailingSpace}`;
  }

  // Dynamic patterns with numbers, units, crops, and statuses
  // 1. "Welcome, <Name>" or "Welcome, <Name>!"
  const welcomeMatch = trimmed.match(/^Welcome(?:,\s*(.+?))?(!)?$/i);
  if (welcomeMatch) {
    const namePart = welcomeMatch[1] ? `, ${welcomeMatch[1]}` : '';
    const bang = welcomeMatch[2] || '';
    const word = lang === 'ta' ? 'வணக்கம்' : 'नमस्ते';
    return `${leadingSpace}${word}${namePart}${bang}${trailingSpace}`;
  }

  // 2. "Buyer Offers (3)" or "View All (5)"
  const buyerOffersCount = trimmed.match(/^Buyer Offers\s*\((\d+)\)$/i);
  if (buyerOffersCount) {
    return `${leadingSpace}${lang === 'ta' ? 'வாங்குபவர் சலுகைகள்' : 'खरीदार प्रस्ताव'} (${buyerOffersCount[1]})${trailingSpace}`;
  }

  const viewAllCount = trimmed.match(/^View All\s*\((\d+)\)$/i);
  if (viewAllCount) {
    return `${leadingSpace}${lang === 'ta' ? 'அனைத்தையும் காண்க' : 'सभी देखें'} (${viewAllCount[1]})${trailingSpace}`;
  }

  const viewOffersBtn = trimmed.match(/^View\s+(\d+)\s+Offers?$/i);
  if (viewOffersBtn) {
    return `${leadingSpace}${
      lang === 'ta' ? `${viewOffersBtn[1]} சலுகைகளைக் காண்க` : `${viewOffersBtn[1]} प्रस्ताव देखें`
    }${trailingSpace}`;
  }

  const verifiedOffersCount = trimmed.match(/^Verified Buyer Offers\s*\((\d+)\)$/i);
  if (verifiedOffersCount) {
    return `${leadingSpace}${
      lang === 'ta'
        ? `சரிபார்க்கப்பட்ட வாங்குபவர் சலுகைகள் (${verifiedOffersCount[1]})`
        : `सत्यापित खरीदार प्रस्ताव (${verifiedOffersCount[1]})`
    }${trailingSpace}`;
  }

  // 3. Counts: "6 Markets", "3 Offers", "1 Offer", "5 Active", "2 Completed"
  const countMetric = trimmed.match(/^(\d+)\s+(Markets?|Offers?|Active|Completed|Pending|Buyers?|Listings?)$/i);
  if (countMetric) {
    const num = countMetric[1];
    const word = countMetric[2].toLowerCase();
    const taMap: Record<string, string> = {
      market: 'சந்தை',
      markets: 'சந்தைகள்',
      offer: 'சலுகை',
      offers: 'சலுகைகள்',
      active: 'செயலில்',
      completed: 'முடிந்தன',
      pending: 'நிலுவையில்',
      buyer: 'வாங்குபவர்',
      buyers: 'வாங்குபவர்கள்',
      listing: 'பட்டியல்',
      listings: 'பட்டியல்கள்',
    };
    const hiMap: Record<string, string> = {
      market: 'मंडी',
      markets: 'मंडियां',
      offer: 'प्रस्ताव',
      offers: 'प्रस्ताव',
      active: 'सक्रिय',
      completed: 'पूर्ण',
      pending: 'लंबित',
      buyer: 'खरीदार',
      buyers: 'खरीदार',
      listing: 'सूची',
      listings: 'सूचियाँ',
    };
    const label = lang === 'ta' ? taMap[word] : hiMap[word];
    if (label) return `${leadingSpace}${num} ${label}${trailingSpace}`;
  }

  // 4. Distance: "8 km away" or "12 km"
  const kmAwayMatch = trimmed.match(/^(\d+(?:\.\d+)?)\s*km\s+away$/i);
  if (kmAwayMatch) {
    return `${leadingSpace}${
      lang === 'ta' ? `${kmAwayMatch[1]} கி.மீ தொலைவில்` : `${kmAwayMatch[1]} किमी दूर`
    }${trailingSpace}`;
  }

  // 5. Quantity + Unit: "300 kg", "500 kg", "35 quintal", "80 bags"
  const qtyUnitMatch = trimmed.match(/^(\d+(?:,\d+)*(?:\.\d+)?)\s*(kg|kilos?|kilograms?|quintals?|tons?|bags?|crates?)$/i);
  if (qtyUnitMatch) {
    return `${leadingSpace}${qtyUnitMatch[1]} ${localizeUnit(qtyUnitMatch[2], lang)}${trailingSpace}`;
  }

  // 6. Rate + Unit: "₹26/kg", "₹24 – ₹27 / kg", "/ kg", "₹27 / unit"
  const slashUnitMatch = trimmed.match(/^\/\s*(kg|quintal|ton|bags|crates|unit)$/i);
  if (slashUnitMatch) {
    return `${leadingSpace}/ ${localizeUnit(slashUnitMatch[1], lang)}${trailingSpace}`;
  }

  const pricePerUnitMatch = trimmed.match(/^(₹\d+(?:,\d+)*(?:\s*[–-]\s*₹?\d+(?:,\d+)*)?)\s*\/\s*(kg|quintal|ton|bags|crates|unit)$/i);
  if (pricePerUnitMatch) {
    return `${leadingSpace}${pricePerUnitMatch[1]}/${localizeUnit(pricePerUnitMatch[2], lang)}${trailingSpace}`;
  }

  // 7. "Quality: Very Good"
  const qualityPrefix = trimmed.match(/^Quality:\s*(.+)$/i);
  if (qualityPrefix) {
    return `${leadingSpace}${lang === 'ta' ? 'தரம்' : 'गुणवत्ता'}: ${localizeQuality(qualityPrefix[1], lang)}${trailingSpace}`;
  }

  // 8. "Selling Date: ..."
  const sellingDatePrefix = trimmed.match(/^Selling Date:\s*(.+)$/i);
  if (sellingDatePrefix) {
    const val = translateText(sellingDatePrefix[1], lang);
    return `${leadingSpace}${lang === 'ta' ? 'விற்பனை தேதி' : 'बिक्री की तारीख'}: ${val}${trailingSpace}`;
  }

  // 9. "Updated: ..."
  const updatedPrefix = trimmed.match(/^Updated:\s*(.+)$/i);
  if (updatedPrefix) {
    const rest = updatedPrefix[1]
      .replace(/Today/gi, lang === 'ta' ? 'இன்று' : 'आज')
      .replace(/Just now/gi, lang === 'ta' ? 'இப்போது' : 'अभी-अभी');
    return `${leadingSpace}${lang === 'ta' ? 'புதுப்பிக்கப்பட்டது' : 'अपडेट किया गया'}: ${rest}${trailingSpace}`;
  }

  // 10. "Est. Take-Home: ₹7,950"
  const estTakeHomeMatch = trimmed.match(/^Est\.\s*Take-Home:\s*(₹[\d,]+)$/i);
  if (estTakeHomeMatch) {
    return `${leadingSpace}${
      lang === 'ta' ? `எதிர்பார்க்கப்படும் நிகர வருமானம்: ${estTakeHomeMatch[1]}` : `अनुमानित शुद्ध आय: ${estTakeHomeMatch[1]}`
    }${trailingSpace}`;
  }

  // 11. "Take-Home Price: ₹7,950 (Estimated amount after known costs)"
  const takeHomeFullMatch = trimmed.match(/^Take-Home Price:\s*(₹[\d,]+)\s*\(Estimated amount after known costs\)$/i);
  if (takeHomeFullMatch) {
    return `${leadingSpace}${
      lang === 'ta'
        ? `நிகர வருமானம்: ${takeHomeFullMatch[1]} (செலவுகளுக்குப் பிறகு எதிர்பார்க்கப்படும் தொகை)`
        : `शुद्ध आय: ${takeHomeFullMatch[1]} (ज्ञात खर्चों के बाद अनुमानित राशि)`
    }${trailingSpace}`;
  }

  // 12. Single crop or status or quality fallback
  const cropTry = localizeCropName(trimmed, lang);
  if (cropTry !== trimmed && !trimmed.includes(' ')) {
    return `${leadingSpace}${cropTry}${trailingSpace}`;
  }

  const statusTry = localizeStatus(trimmed, lang);
  if (statusTry !== trimmed) {
    return `${leadingSpace}${statusTry}${trailingSpace}`;
  }

  const qualityTry = localizeQuality(trimmed, lang);
  if (qualityTry !== trimmed) {
    return `${leadingSpace}${qualityTry}${trailingSpace}`;
  }

  return rawInput;
}

// ============================================================================
// REVERSIBLE DOM LOCALIZATION ENGINE (Ensures 100% UI Coverage Across All Screens)
// ============================================================================
interface NodeLocalizationMeta {
  orig: string;
  lastRendered: string;
}

const textNodeMeta = new WeakMap<Text, NodeLocalizationMeta>();
const elementAttrMeta = new WeakMap<Element, Record<string, NodeLocalizationMeta>>();

const SKIP_TAGS = new Set(['SCRIPT', 'STYLE', 'CODE', 'PRE', 'NOSCRIPT', 'SVG', 'PATH']);

export function applyDomLocalization(root: HTMLElement | Document | null, lang: Language): void {
  if (!root || typeof document === 'undefined') return;

  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT);
  let current: Node | null = walker.currentNode;

  while (current) {
    if (current.nodeType === Node.ELEMENT_NODE) {
      const el = current as HTMLElement;
      if (SKIP_TAGS.has(el.tagName)) {
        current = walker.nextNode();
        continue;
      }

      // Translate attributes: placeholder, title, aria-label
      const attrs = ['placeholder', 'title', 'aria-label'];
      let attrMap = elementAttrMeta.get(el);
      for (const attr of attrs) {
        const val = el.getAttribute(attr);
        if (!val) continue;
        if (!attrMap) {
          attrMap = {};
          elementAttrMeta.set(el, attrMap);
        }
        const existing = attrMap[attr];
        const sourceText = !existing || existing.lastRendered !== val ? val : existing.orig;
        const localized = lang === 'en' ? translateText(sourceText, 'en') : translateText(sourceText, lang);
        attrMap[attr] = { orig: sourceText, lastRendered: localized };
        if (val !== localized) {
          el.setAttribute(attr, localized);
        }
      }
    } else if (current.nodeType === Node.TEXT_NODE) {
      const textNode = current as Text;
      const parent = textNode.parentElement;
      if (parent && !SKIP_TAGS.has(parent.tagName) && !parent.hasAttribute('data-no-translate')) {
        const val = textNode.nodeValue || '';
        if (val.trim().length > 0) {
          const existing = textNodeMeta.get(textNode);
          // If React updated the textNode to a new value different from what we last wrote, capture new orig
          const sourceText = !existing || existing.lastRendered !== val ? val : existing.orig;
          const localized = lang === 'en' ? translateText(sourceText, 'en') : translateText(sourceText, lang);
          textNodeMeta.set(textNode, { orig: sourceText, lastRendered: localized });
          if (val !== localized) {
            textNode.nodeValue = localized;
          }
        }
      }
    }
    current = walker.nextNode();
  }
}
