"use client"

import { createContext, useContext, useState, type ReactNode, useEffect } from "react"

type Language = "en" | "te" | "hi"

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    // Common
    "common.logout": "Logout",
    "common.submit": "Submit",
    "common.cancel": "Cancel",
    "common.save": "Save",
    "common.back": "Back to Dashboard",
    "common.loading": "Loading...",
    "common.available": "Available",
    "common.sold": "Sold",
    "common.message": "Message",
    "common.accept": "Accept",
    "common.decline": "Decline",
    "common.success": "Success",
    "common.error": "Error",
    "common.myProfile": "My Profile", // Added myProfile translation
    notifications: "Notifications",
    "notifications.markAllRead": "Mark all as read",
    "notifications.noNotifications": "No notifications yet",
    "notifications.unread": "unread notification",
    "notifications.unreadPlural": "unread notifications",
    // Farmer Dashboard
    "farmer.welcome": "Welcome, Farmer!",
    "farmer.subtitle": "Manage your crops, track prices, and connect with traders",
    "farmer.activeCrops": "Active Crops",
    "farmer.traderRequests": "Trader Requests",
    "farmer.avgPrice": "Average Price",
    "farmer.perQuintal": "Per quintal",
    "farmer.successRate": "Success Rate",
    "farmer.transactions": "Transactions",
    "farmer.yieldPerformance": "Crop Performance",
    "farmer.yourYieldVsAverage": "Your crops vs. region average",
    "farmer.quickActions": "Quick Actions",
    "farmer.predictCrop": "Predict Crop",
    "farmer.pricePredictions": "Price Predictions",
    "farmer.findTraders": "Find Traders",
    "farmer.addMyCrop": "Add My Crop",
    "farmer.needHelp": "Need Help?",
    "farmer.support": "Support",
    "farmer.myCrops": "My Active Crops",
    "farmer.myCropsDescription": "View and manage all your listed crops",
    "farmer.noCrops": "You haven't added any crops yet",
    "farmer.traderRequestsDescription": "Manage requests from traders interested in your crops",
    "farmer.noTraderRequests": "No trader requests at the moment",
    // Farmer Add Crop
    "addCrop.title": "Add Your Crop for Sale",
    "addCrop.subtitle": "List your crop details to connect with traders",
    "addCrop.cropName": "Crop Name",
    "addCrop.cropNamePlaceholder": "e.g., Wheat, Rice, Cotton",
    "addCrop.quantity": "Quantity (in Kg)",
    "addCrop.quantityPlaceholder": "e.g., 5000",
    "addCrop.pricePerKg": "Price Per Kg (₹)",
    "addCrop.pricePlaceholder": "e.g., 25",
    "addCrop.location": "Location",
    "addCrop.locationPlaceholder": "e.g., Punjab",
    "addCrop.description": "Description",
    "addCrop.descriptionPlaceholder": "Quality, harvest date, etc.",
    "addCrop.phone": "Contact Phone",
    "addCrop.phonePlaceholder": "+91 98765 43210",
    "addCrop.success": "Crop listed successfully!",
    // Dhalari Dashboard
    "dhalari.welcome": "Welcome, Trader!",
    "dhalari.subtitle": "Manage farmer requests, track earnings, and grow your business",
    "dhalari.pendingRequests": "Pending Requests",
    "dhalari.acceptedDeals": "Accepted Deals",
    "dhalari.totalEarnings": "Total Earnings",
    "dhalari.thisMonth": "This month",
    "dhalari.avgDealValue": "Average Deal Value",
    "dhalari.perTransaction": "Per transaction",
    "dhalari.weeklyEarnings": "Weekly Earnings",
    "dhalari.yourEarningsThisWeek": "Your earnings this week",
    "dhalari.viewRequests": "View Requests",
    "dhalari.myProfile": "My Profile",
    "dhalari.analytics": "Analytics",
    "dhalari.profileStats": "Profile Stats",
    "dhalari.rating": "Rating",
    "dhalari.successRate": "Success Rate",
    "dhalari.verified": "Verified",
    // Dhalari Requests
    "requests.title": "Farmer Crop Listings",
    "requests.subtitle": "Browse available crops from farmers",
    "requests.farmerName": "Farmer Name",
    "requests.crop": "Crop",
    "requests.quantity": "Quantity",
    "requests.price": "Price",
    "requests.location": "Location",
    "requests.phone": "Phone",
    "requests.accept": "Accept Deal",
    "requests.contact": "Contact Farmer",
    // Find Verified Traders
    find_verified_traders: "Find Verified Traders",
    connect_with_trusted_dhalaris: "Connect with trusted dhalaris (agricultural traders) in your area",
    filter_by_crop: "Filter by Crop",
    filter_by_location: "Filter by Location",
    all_crops: "All Crops",
    wheat: "Wheat",
    rice: "Rice",
    cotton: "Cotton",
    sugarcane: "Sugarcane",
    all_locations: "All Locations",
    punjab: "Punjab",
    haryana: "Haryana",
    maharashtra: "Maharashtra",
    delhi: "Delhi",
    west_bengal: "West Bengal",
    specializations: "Specializations",
    experience: "Experience",
    years: "years",
    commission_rate: "Commission Rate",
    contacting: "Contacting",
    no_traders_found: "No traders found with selected filters. Try adjusting your search.",
  },
  te: {
    // Common
    "common.logout": "లాగోవుట్",
    "common.submit": "సమర్పించు",
    "common.cancel": "రద్దు",
    "common.save": "సేవ్ చేయి",
    "common.back": "డాష్‌బోర్డ్‌కు తిరిగి",
    "common.loading": "లోడ్ అవుతోంది...",
    "common.available": "అందుబాటులో ఉంది",
    "common.sold": "విక్రయించబడింది",
    "common.message": "సందేశం",
    "common.accept": "అంగీకరించు",
    "common.decline": "తిరస్కరించు",
    "common.success": "విజయం",
    "common.error": "లోపం",
    "common.myProfile": "నా ప్రొఫైల్", // Added myProfile translation in Telugu
    notifications: "నోటిఫికేషన్లు",
    "notifications.markAllRead": "అన్నింటినీ చదివినట్లు గుర్తించు",
    "notifications.noNotifications": "ఇంకా నోటిఫికేషన్లు లేవు",
    "notifications.unread": "చదవని నోటిఫికేషన్",
    "notifications.unreadPlural": "చదవని నోటిఫికేషన్లు",
    // Farmer Dashboard
    "farmer.welcome": "స్వాగతం, రైతు!",
    "farmer.subtitle": "మీ పంటలను నిర్వహించండి, ధరలను ట్రాక్ చేయండి మరియు వర్తకులతో సంయోగం చేయండి",
    "farmer.activeCrops": "సక్రియ పంటలు",
    "farmer.traderRequests": "వర్తక అభ్యర్థనలు",
    "farmer.avgPrice": "సగటు ధర",
    "farmer.perQuintal": "క్విన్టాల్‌కు",
    "farmer.successRate": "విజయ రేటు",
    "farmer.transactions": "లావాదేవీలు",
    "farmer.yieldPerformance": "పంట పనితీరు",
    "farmer.yourYieldVsAverage": "మీ పంటలు vs. ప్రాంత సగటు",
    "farmer.quickActions": "త్వరిత చర్యలు",
    "farmer.predictCrop": "పంట అంచనా",
    "farmer.pricePredictions": "ధర అంచనాలు",
    "farmer.findTraders": "వర్తకులను కనుగొనండి",
    "farmer.addMyCrop": "నా పంట జోడించు",
    "farmer.needHelp": "సహాయం కావాలా?",
    "farmer.support": "సపోర్టు",
    "farmer.myCrops": "నా సక్రియ పంటలు",
    "farmer.myCropsDescription": "మీ జాబితా చేసిన పంటలన్నింటినీ చూడండి మరియు నిర్వహించండి",
    "farmer.noCrops": "మీరు ఇంకా ఎటువంటి పంటలను జోడించలేదు",
    "farmer.traderRequestsDescription": "మీ పంటలపై ఆసక్తి కలిగి ఉన్న వర్తకుల నుండి అభ్యర్థనలను నిర్వహించండి",
    "farmer.noTraderRequests": "ప్రస్తుతం వర్తక అభ్యర్థనలు లేవు",
    // Farmer Add Crop
    "addCrop.title": "విక్రయం కోసం మీ పంట జోడించండి",
    "addCrop.subtitle": "వర్తకులతో కనెక్ట్ అవ్వడానికి మీ పంట వివరాలను జాబితా చేయండి",
    "addCrop.cropName": "పంట పేరు",
    "addCrop.cropNamePlaceholder": "ఉదా., గోధుమ, బియ్యం, పత్తి",
    "addCrop.quantity": "పరిమాణం (కిలోలలో)",
    "addCrop.quantityPlaceholder": "ఉదా., 5000",
    "addCrop.pricePerKg": "కిలోకు ధర (₹)",
    "addCrop.pricePlaceholder": "ఉదా., 25",
    "addCrop.location": "స్థానం",
    "addCrop.locationPlaceholder": "ఉదా., పంజాబ్",
    "addCrop.description": "వివరణ",
    "addCrop.descriptionPlaceholder": "నాణ్యత, పంట తేదీ, మొదలైనవి",
    "addCrop.phone": "సంప్రదింపు ఫోన్",
    "addCrop.phonePlaceholder": "+91 98765 43210",
    "addCrop.success": "పంట విజయవంతంగా జాబితా చేయబడింది!",
    // Dhalari Dashboard
    "dhalari.welcome": "స్వాగతం, వర్తకుడు!",
    "dhalari.subtitle": "రైత అభ్యర్థనలను నిర్వహించండి, ఆదాయాన్ని ట్రాక్ చేయండి మరియు మీ వ్యాపారాన్ని పెంచండి",
    "dhalari.pendingRequests": "అందుబాటులో ఉన్న పంటలు",
    "dhalari.acceptedDeals": "ఆమోదించిన ఒప్పందాలు",
    "dhalari.totalEarnings": "మొత్తం ఆదాయం",
    "dhalari.thisMonth": "ఈ నెలలో",
    "dhalari.avgDealValue": "సగటు ఒప్పందం విలువ",
    "dhalari.perTransaction": "లావాదేవీకి",
    "dhalari.weeklyEarnings": "వారాభ్యంతర ఆదాయం",
    "dhalari.yourEarningsThisWeek": "ఈ వారం మీ ఆదాయం",
    "dhalari.viewRequests": "పంటలను చూడండి",
    "dhalari.myProfile": "నా ప్రొఫైల్",
    "dhalari.analytics": "విశ్లేషణలు",
    "dhalari.profileStats": "ప్రొఫైల్ గణాంకాలు",
    "dhalari.rating": "రేటింగ్",
    "dhalari.successRate": "విజయ రేటు",
    "dhalari.verified": "ధృవీకరించబడిన",
    // Dhalari Requests
    "requests.title": "రైతు పంట జాబితాలు",
    "requests.subtitle": "రైతుల నుండి అందుబాటులో ఉన్న పంటలను బ్రౌజ్ చేయండి",
    "requests.farmerName": "రైతు పేరు",
    "requests.crop": "పంట",
    "requests.quantity": "పరిమాణం",
    "requests.price": "ధర",
    "requests.location": "స్థానం",
    "requests.phone": "ఫోన్",
    "requests.accept": "ఒప్పందాన్ని అంగీకరించు",
    "requests.contact": "రైతును సంప్రదించండి",
    // Find Verified Traders
    find_verified_traders: "ధృవీకరించబడిన వర్తకులను కనుగొనండి",
    connect_with_trusted_dhalaris: "మీ ప్రాంతంలో విశ్వసనీయ దళారీలు (వ్యవసాయ వర్తకులు)తో కనెక్ట్ అవ్వండి",
    filter_by_crop: "పంట ద్వారా ఫిల్టర్ చేయండి",
    filter_by_location: "స్థానం ద్వారా ఫిల్టర్ చేయండి",
    all_crops: "అన్ని పంటలు",
    wheat: "గోధుమలు",
    rice: "బియ్యం",
    cotton: "పత్తి",
    sugarcane: "చెరకు",
    all_locations: "అన్ని స్థానాలు",
    punjab: "పంజాబ్",
    haryana: "హర్యానా",
    maharashtra: "మహారాష్ట్ర",
    delhi: "ఢిల్లీ",
    west_bengal: "పశ్చిమ బెంగాల్",
    specializations: "ప్రత్యేకతలు",
    experience: "అనుభవం",
    years: "సంవత్సరాలు",
    commission_rate: "కమీషన్ రేటు",
    contacting: "సంప్రదిస్తోంది",
    no_traders_found: "ఎంచుకున్న ఫిల్టర్లతో వర్తకులు కనుగొనబడలేదు. మీ శోధనను సర్దుబాటు చేయడానికి ప్రయత్నించండి.",
  },
  hi: {
    // Common
    "common.logout": "लॉगआउट",
    "common.submit": "जमा करें",
    "common.cancel": "रद्द करें",
    "common.save": "सहेजें",
    "common.back": "डैशबोर्ड पर वापस",
    "common.loading": "लोड हो रहा है...",
    "common.available": "उपलब्ध",
    "common.sold": "बिक गया",
    "common.message": "संदेश",
    "common.accept": "स्वीकार करें",
    "common.decline": "अस्वीकार करें",
    "common.success": "सफलता",
    "common.error": "त्रुटि",
    "common.myProfile": "मेरी प्रोफ़ाइल", // Added myProfile translation in Hindi
    notifications: "सूचनाएं",
    "notifications.markAllRead": "सभी को पढ़ा हुआ चिह्नित करें",
    "notifications.noNotifications": "अभी तक कोई सूचना नहीं",
    "notifications.unread": "अपठित सूचना",
    "notifications.unreadPlural": "अपठित सूचनाएं",
    // Farmer Dashboard
    "farmer.welcome": "स्वागत है, किसान!",
    "farmer.subtitle": "अपनी फसलों को प्रबंधित करें, कीमतों को ट्रैक करें और व्यापारियों से जुड़ें",
    "farmer.activeCrops": "सक्रिय फसलें",
    "farmer.traderRequests": "व्यापारी अनुरोध",
    "farmer.avgPrice": "औसत मूल्य",
    "farmer.perQuintal": "प्रति क्विंटल",
    "farmer.successRate": "सफलता दर",
    "farmer.transactions": "लेनदेन",
    "farmer.yieldPerformance": "फसल प्रदर्शन",
    "farmer.yourYieldVsAverage": "आपकी फसलें बनाम क्षेत्र औसत",
    "farmer.quickActions": "त्वरित कार्य",
    "farmer.predictCrop": "फसल पूर्वानुमान",
    "farmer.pricePredictions": "मूल्य पूर्वानुमान",
    "farmer.findTraders": "व्यापारी खोजें",
    "farmer.addMyCrop": "मेरी फसल जोड़ें",
    "farmer.needHelp": "मदद चाहिए?",
    "farmer.support": "समर्थन",
    "farmer.myCrops": "मेरी सक्रिय फसलें",
    "farmer.myCropsDescription": "अपनी सूचीबद्ध सभी फसलों को देखें और प्रबंधित करें",
    "farmer.noCrops": "आपने अभी तक कोई फसल नहीं जोड़ी है",
    "farmer.traderRequestsDescription": "अपनी फसलों में रुचि रखने वाले व्यापारियों से अनुरोध प्रबंधित करें",
    "farmer.noTraderRequests": "फिलहाल कोई व्यापारी अनुरोध नहीं है",
    // Farmer Add Crop
    "addCrop.title": "बिक्री के लिए अपनी फसल जोड़ें",
    "addCrop.subtitle": "व्यापारियों से जुड़ने के लिए अपनी फसल का विवरण सूचीबद्ध करें",
    "addCrop.cropName": "फसल का नाम",
    "addCrop.cropNamePlaceholder": "उदा., गेहूं, चावल, कपास",
    "addCrop.quantity": "मात्रा (किलो में)",
    "addCrop.quantityPlaceholder": "उदा., 5000",
    "addCrop.pricePerKg": "प्रति किलो मूल्य (₹)",
    "addCrop.pricePlaceholder": "उदा., 25",
    "addCrop.location": "स्थान",
    "addCrop.locationPlaceholder": "उदा., पंजाब",
    "addCrop.description": "विवरण",
    "addCrop.descriptionPlaceholder": "गुणवत्ता, कटाई की तारीख, आदि",
    "addCrop.phone": "संपर्क फोन",
    "addCrop.phonePlaceholder": "+91 98765 43210",
    "addCrop.success": "फसल सफलतापूर्वक सूचीबद्ध की गई!",
    // Dhalari Dashboard
    "dhalari.welcome": "स्वागत है, व्यापारी!",
    "dhalari.subtitle": "किसान अनुरोधों को प्रबंधित करें, आय को ट्रैक करें और अपने व्यवसाय को बढ़ाएं",
    "dhalari.pendingRequests": "उपलब्ध फसलें",
    "dhalari.acceptedDeals": "स्वीकृत सौदे",
    "dhalari.totalEarnings": "कुल आय",
    "dhalari.thisMonth": "इस महीने",
    "dhalari.avgDealValue": "औसत डील मूल्य",
    "dhalari.perTransaction": "प्रति लेनदेन",
    "dhalari.weeklyEarnings": "साप्ताहिक आय",
    "dhalari.yourEarningsThisWeek": "इस सप्ताह आपकी आय",
    "dhalari.viewRequests": "फसलें देखें",
    "dhalari.myProfile": "मेरी प्रोफाइल",
    "dhalari.analytics": "विश्लेषण",
    "dhalari.profileStats": "प्रोफाइल आंकड़े",
    "dhalari.rating": "रेटिंग",
    "dhalari.successRate": "सफलता दर",
    "dhalari.verified": "सत्यापित",
    // Dhalari Requests
    "requests.title": "किसान फसल सूची",
    "requests.subtitle": "किसानों से उपलब्ध फसलों को ब्राउज़ करें",
    "requests.farmerName": "किसान का नाम",
    "requests.crop": "फसल",
    "requests.quantity": "मात्रा",
    "requests.price": "मूल्य",
    "requests.location": "स्थान",
    "requests.phone": "फोन",
    "requests.accept": "सौदा स्वीकार करें",
    "requests.contact": "किसान से संपर्क करें",
    // Find Verified Traders
    find_verified_traders: "सत्यापित व्यापारी खोजें",
    connect_with_trusted_dhalaris: "अपने क्षेत्र में विश्वसनीय दलालों (कृषि व्यापारियों) से जुड़ें",
    filter_by_crop: "फसल के अनुसार फ़िल्टर करें",
    filter_by_location: "स्थान के अनुसार फ़िल्टर करें",
    all_crops: "सभी फसलें",
    wheat: "गेहूं",
    rice: "चावल",
    cotton: "कपास",
    sugarcane: "गन्ना",
    all_locations: "सभी स्थान",
    punjab: "पंजाब",
    haryana: "हरियाणा",
    maharashtra: "महाराष्ट्र",
    delhi: "दिल्ली",
    west_bengal: "पश्चिम बंगाल",
    specializations: "विशेषज्ञता",
    experience: "अनुभव",
    years: "वर्ष",
    commission_rate: "कमीशन दर",
    contacting: "संपर्क कर रहे हैं",
    no_traders_found: "चयनित फ़िल्टर के साथ कोई व्यापारी नहीं मिला। अपनी खोज को समायोजित करने का प्रयास करें।",
  },
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>("en")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    // Load saved language from localStorage on mount
    const savedLanguage = localStorage.getItem("app-language") as Language
    if (savedLanguage && ["en", "te", "hi"].includes(savedLanguage)) {
      setLanguage(savedLanguage)
    }
    setMounted(true)
  }, [])

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang)
    localStorage.setItem("app-language", lang)
  }

  const t = (key: string): string => {
    return translations[language][key] || key
  }

  if (!mounted) return null

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider")
  }
  return context
}
