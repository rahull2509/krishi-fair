// Bilingual EN/HI dictionary for Krishi Fair
import { useUIStore } from "@/store/uiStore";

export const dict = {
  // Navbar
  "nav.marketplace": { en: "Marketplace", hi: "मंडी" },
  "nav.mandi_prices": { en: "Mandi Prices", hi: "मंडी भाव" },
  "nav.agro": { en: "Agro Monitoring", hi: "मौसम व मिट्टी" },
  "nav.ai_assistant": { en: "Krishi AI", hi: "कृषि AI" },
  "nav.dashboard": { en: "Dashboard", hi: "डैशबोर्ड" },
  "nav.chats": { en: "Chats", hi: "बातचीत" },
  "nav.profile": { en: "Profile", hi: "प्रोफ़ाइल" },
  "nav.login": { en: "Sign in", hi: "लॉगिन" },
  "nav.register": { en: "Get started", hi: "रजिस्टर करें" },
  "nav.logout": { en: "Sign out", hi: "लॉगआउट" },

  // Landing
  "land.eyebrow": { en: "BUILT FOR INDIAN FARMERS", hi: "भारतीय किसानों के लिए" },
  "land.hero_h1_a": { en: "A fair price ", hi: "उचित दाम — " },
  "land.hero_h1_b": { en: "for every harvest.", hi: "हर फसल का।" },
  "land.hero_sub": {
    en: "Krishi Fair connects farmers and verified buyers through a transparent bidding marketplace, real-time mandi prices and AI advisory in your language.",
    hi: "कृषि फ़ेयर किसानों और वेरिफ़ाइड खरीदारों को पारदर्शी बोली, असली मंडी भाव और आपकी भाषा में AI सलाहकार से जोड़ता है।",
  },
  "land.cta_farmer": { en: "I am a Farmer", hi: "मैं किसान हूँ" },
  "land.cta_buyer": { en: "I am a Buyer", hi: "मैं खरीदार हूँ" },
  "land.feature_h": { en: "Everything a fair mandi should be", hi: "एक न्यायपूर्ण मंडी की हर ज़रूरत" },
  "land.f1_t": { en: "Transparent bidding", hi: "पारदर्शी बोली" },
  "land.f1_d": { en: "Set base price + minimum bid. Buyers compete openly within a time window the admin controls.", hi: "बेस प्राइस और न्यूनतम बोली तय करें। खरीदार खुले रूप से बोली लगाएँ।" },
  "land.f2_t": { en: "Verified buyers (KYC)", hi: "वेरिफ़ाइड खरीदार (KYC)" },
  "land.f2_d": { en: "Aadhar, GST and PAN verified. No fake calls, no middlemen tricks.", hi: "आधार, GST और PAN सत्यापित। कोई नकली ख़रीदार नहीं।" },
  "land.f3_t": { en: "Live mandi prices", hi: "लाइव मंडी भाव" },
  "land.f3_d": { en: "Daily AGMARKNET prices for every state, district and commodity.", hi: "AGMARKNET से हर राज्य, ज़िले और फसल का दैनिक भाव।" },
  "land.f4_t": { en: "Krishi AI in your language", hi: "आपकी भाषा में कृषि AI" },
  "land.f4_d": { en: "Upload a leaf, ask about pests, irrigation, weather. Hindi, English & regional languages.", hi: "पत्ती की फ़ोटो भेजें, कीट, सिंचाई, मौसम पूछें — हिन्दी, अंग्रेज़ी व क्षेत्रीय भाषाओं में।" },
  "land.f5_t": { en: "Weather & soil insight", hi: "मौसम व मिट्टी जानकारी" },
  "land.f5_d": { en: "Hyper-local forecasts, irrigation advice and soil moisture for your field.", hi: "स्थानीय पूर्वानुमान, सिंचाई सलाह व मिट्टी की नमी।" },
  "land.f6_t": { en: "Direct buy or auction", hi: "सीधी ख़रीद या नीलामी" },
  "land.f6_d": { en: "Each crop can be set as direct sale or open for bidding — your choice.", hi: "हर फसल — सीधी बिक्री या नीलामी, फ़ैसला आपका।" },

  // Auth
  "auth.welcome_back": { en: "Welcome back", hi: "वापसी पर स्वागत" },
  "auth.create_account": { en: "Create your account", hi: "खाता बनाएँ" },
  "auth.email": { en: "Email", hi: "ईमेल" },
  "auth.phone": { en: "Phone", hi: "मोबाइल" },
  "auth.name": { en: "Full name", hi: "पूरा नाम" },
  "auth.password": { en: "Password", hi: "पासवर्ड" },
  "auth.role": { en: "I want to register as", hi: "मैं रजिस्टर करना चाहता हूँ" },
  "auth.farmer": { en: "Farmer", hi: "किसान" },
  "auth.buyer": { en: "Buyer / Trader", hi: "खरीदार / व्यापारी" },
  "auth.signin_btn": { en: "Sign in", hi: "लॉगिन करें" },
  "auth.register_btn": { en: "Create account", hi: "खाता बनाएँ" },
  "auth.have_account": { en: "Already have an account?", hi: "पहले से खाता है?" },
  "auth.no_account": { en: "New here?", hi: "नए हैं?" },
  "auth.demo_title": { en: "Try a demo account", hi: "डेमो खाता आज़माएँ" },
  "auth.demo_admin": { en: "Continue as Admin", hi: "एडमिन के रूप में जारी रखें" },
  "auth.demo_farmer": { en: "Continue as Farmer", hi: "किसान के रूप में जारी रखें" },
  "auth.demo_buyer": { en: "Continue as Buyer", hi: "खरीदार के रूप में जारी रखें" },

  // Marketplace
  "mkt.title": { en: "Open marketplace", hi: "खुली मंडी" },
  "mkt.subtitle": { en: "Browse fresh listings, place bids, or buy directly.", hi: "ताज़ी लिस्टिंग देखें, बोली लगाएँ या सीधे ख़रीदें।" },
  "mkt.filter.category": { en: "Category", hi: "श्रेणी" },
  "mkt.filter.state": { en: "State", hi: "राज्य" },
  "mkt.filter.min_price": { en: "Min ₹/qtl", hi: "न्यून ₹/क्विंटल" },
  "mkt.filter.max_price": { en: "Max ₹/qtl", hi: "अधिकतम ₹/क्विंटल" },
  "mkt.filter.bidding_only": { en: "Bidding only", hi: "केवल बोली" },
  "mkt.filter.search": { en: "Search crop, variety…", hi: "फसल, क़िस्म खोजें…" },
  "mkt.no_results": { en: "No crops match your filters yet.", hi: "इन फ़िल्टर पर अभी कोई फसल नहीं।" },

  // Crop card
  "crop.base_price": { en: "Base price", hi: "बेस प्राइस" },
  "crop.min_bid": { en: "Min bid", hi: "न्यून बोली" },
  "crop.current_bid": { en: "Highest bid", hi: "उच्चतम बोली" },
  "crop.qty": { en: "Quantity", hi: "मात्रा" },
  "crop.bidding_open": { en: "Bidding open", hi: "बोली चालू" },
  "crop.direct_buy": { en: "Direct buy", hi: "सीधी ख़रीद" },
  "crop.ends_in": { en: "Ends in", hi: "बंद होगी" },
  "crop.view": { en: "View listing", hi: "देखें" },
  "crop.place_bid": { en: "Place bid", hi: "बोली लगाएँ" },
  "crop.buy_now": { en: "Buy now", hi: "अभी ख़रीदें" },
  "crop.chat_farmer": { en: "Chat with farmer", hi: "किसान से बात करें" },

  // Bid panel
  "bid.your_bid": { en: "Your bid (₹/quintal)", hi: "आपकी बोली (₹/क्विंटल)" },
  "bid.message": { en: "Message to farmer (optional)", hi: "किसान को संदेश (वैकल्पिक)" },
  "bid.submit": { en: "Submit bid", hi: "बोली भेजें" },
  "bid.kyc_required": { en: "Complete KYC verification to place bids.", hi: "बोली लगाने के लिए KYC पूरा करें।" },
  "bid.history": { en: "Bid history", hi: "बोलियाँ" },
  "bid.accepted": { en: "Accepted", hi: "स्वीकृत" },
  "bid.rejected": { en: "Rejected", hi: "अस्वीकृत" },
  "bid.pending": { en: "Pending", hi: "लंबित" },

  // Dashboard
  "dash.farmer.title": { en: "Farmer dashboard", hi: "किसान डैशबोर्ड" },
  "dash.buyer.title": { en: "Buyer dashboard", hi: "खरीदार डैशबोर्ड" },
  "dash.admin.title": { en: "Admin dashboard", hi: "एडमिन डैशबोर्ड" },
  "dash.my_crops": { en: "My crops", hi: "मेरी फ़सलें" },
  "dash.add_crop": { en: "List new crop", hi: "नई फसल लिस्ट करें" },
  "dash.my_bids": { en: "My bids", hi: "मेरी बोलियाँ" },
  "dash.kyc": { en: "KYC verification", hi: "KYC सत्यापन" },
  "dash.users": { en: "Users", hi: "उपयोगकर्ता" },
  "dash.settings": { en: "Marketplace settings", hi: "मंडी सेटिंग" },
  "dash.bidding_duration": { en: "Default bidding duration (hours)", hi: "बोली की अवधि (घंटे)" },
  "dash.save": { en: "Save", hi: "सेव करें" },
  "dash.earnings": { en: "Total earnings", hi: "कुल आय" },
  "dash.active_bids": { en: "Active bids", hi: "चालू बोलियाँ" },
  "dash.listings": { en: "Active listings", hi: "चालू लिस्टिंग" },
  "dash.sold": { en: "Crops sold", hi: "बिकी फसलें" },

  // KYC
  "kyc.title": { en: "Buyer KYC verification", hi: "खरीदार KYC सत्यापन" },
  "kyc.intro": { en: "Genuine buyers only. Submit Aadhar, GST, and PAN to start bidding and direct purchases.", hi: "केवल असली खरीदार। बोली व ख़रीद के लिए आधार, GST और PAN दें।" },
  "kyc.aadhar": { en: "Aadhar number", hi: "आधार संख्या" },
  "kyc.gst": { en: "GST number", hi: "GST नंबर" },
  "kyc.pan": { en: "PAN number", hi: "PAN नंबर" },
  "kyc.doc": { en: "Document image", hi: "दस्तावेज़ चित्र" },
  "kyc.submit": { en: "Submit for review", hi: "समीक्षा हेतु भेजें" },
  "kyc.status_pending": { en: "Under review", hi: "समीक्षा में" },
  "kyc.status_verified": { en: "Verified", hi: "सत्यापित" },
  "kyc.status_rejected": { en: "Rejected", hi: "अस्वीकृत" },
  "kyc.status_not_submitted": { en: "Not submitted", hi: "नहीं भेजा" },

  // AI
  "ai.title": { en: "Krishi AI Assistant", hi: "कृषि AI सहायक" },
  "ai.intro": { en: "Ask anything about your crop. Upload a leaf or pest photo for instant analysis. Reply will be in your language.", hi: "अपनी फसल बारे कुछ भी पूछें। पत्ती/कीट की फ़ोटो भेजें — आपकी भाषा में जवाब।" },
  "ai.placeholder": { en: "e.g. मेरी गेहूं की पत्तियाँ पीली हो रही हैं…", hi: "जैसे — मेरी गेहूं की पत्तियाँ पीली हो रही हैं…" },
  "ai.send": { en: "Send", hi: "भेजें" },
  "ai.upload": { en: "Attach image", hi: "चित्र संलग्न करें" },
  "ai.thinking": { en: "Thinking…", hi: "सोच रहे हैं…" },

  // Mandi prices
  "mandi.title": { en: "Live mandi prices (AGMARKNET)", hi: "लाइव मंडी भाव (AGMARKNET)" },
  "mandi.subtitle": { en: "Variety-wise daily prices across India.", hi: "पूरे भारत के दैनिक क़िस्म-वार भाव।" },
  "mandi.commodity": { en: "Commodity", hi: "फसल" },
  "mandi.state": { en: "State", hi: "राज्य" },
  "mandi.district": { en: "District", hi: "ज़िला" },
  "mandi.market": { en: "Mandi", hi: "मंडी" },
  "mandi.variety": { en: "Variety", hi: "क़िस्म" },
  "mandi.min": { en: "Min ₹", hi: "न्यून ₹" },
  "mandi.max": { en: "Max ₹", hi: "अधिक ₹" },
  "mandi.modal": { en: "Modal ₹", hi: "मॉडल ₹" },
  "mandi.date": { en: "Arrival date", hi: "आगमन तिथि" },

  // Agro monitoring
  "agro.title": { en: "Agro monitoring", hi: "मौसम व मिट्टी निगरानी" },
  "agro.subtitle": { en: "Hyper-local weather, soil and irrigation guidance for your field.", hi: "स्थानीय मौसम, मिट्टी और सिंचाई सलाह।" },
  "agro.lat": { en: "Latitude", hi: "अक्षांश" },
  "agro.lon": { en: "Longitude", hi: "देशांतर" },
  "agro.fetch": { en: "Get insights", hi: "जानकारी लें" },
  "agro.current": { en: "Current weather", hi: "मौजूदा मौसम" },
  "agro.forecast": { en: "7-day forecast", hi: "7-दिन पूर्वानुमान" },
  "agro.irrigation": { en: "Irrigation advice", hi: "सिंचाई सलाह" },
  "agro.soil": { en: "Soil snapshot", hi: "मिट्टी जानकारी" },

  // Generic
  "generic.loading": { en: "Loading…", hi: "लोड हो रहा है…" },
  "generic.cancel": { en: "Cancel", hi: "रद्द करें" },
  "generic.confirm": { en: "Confirm", hi: "पक्का" },
  "generic.back": { en: "Back", hi: "वापस" },
  "generic.required": { en: "Required", hi: "आवश्यक" },
  "generic.error": { en: "Something went wrong", hi: "कुछ गड़बड़ हुई" },
};

export function t(key, lang = "en") {
  const entry = dict[key];
  if (!entry) return key;
  return entry[lang] ?? entry.en ?? key;
}

export function useT() {
  const lang = useUIStore((s) => s.language);
  return (key) => t(key, lang);
}
