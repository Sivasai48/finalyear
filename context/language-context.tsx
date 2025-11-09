"use client"

import { createContext, useContext, useState, type ReactNode } from "react"

type Language = "en" | "te" | "hi"

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
}

const translations: Record<Language, Record<string, string>> = {
  en: {
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
    "farmer.needHelp": "Need Help?",
    "farmer.support": "Support",
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
    "common.logout": "Logout",
  },
  te: {
    // Farmer Dashboard
    "farmer.welcome": "స్వాగతం, రైతు!",
    "farmer.subtitle": "మీ పంటలను నిర్వహించండి, ధరలను ట్రాక్ చేయండి మరియు వర్తకులతో సংযోగం చేయండి",
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
    "farmer.needHelp": "సహాయం కావాలా?",
    "farmer.support": "సపోర్టు",
    // Dhalari Dashboard
    "dhalari.welcome": "స్వాగతం, వర్తకుడు!",
    "dhalari.subtitle": "రైత అభ్యర్థనలను నిర్వహించండి, ఆదాయాన్ని ట్రాక్ చేయండి మరియు మీ ব్యবసాయాన్ని పెంచండి",
    "dhalari.pendingRequests": "పెండింగ్ అభ్యర్థనలు",
    "dhalari.acceptedDeals": "ఆమోదించిన ఒప్పందాలు",
    "dhalari.totalEarnings": "మొత్తం ఆదాయం",
    "dhalari.thisMonth": "ఈ నెలలో",
    "dhalari.avgDealValue": "సగటు ఒప్పందం విలువ",
    "dhalari.perTransaction": "లావాదేవీకి",
    "dhalari.weeklyEarnings": "వారాభ్యంతర ఆదాయం",
    "dhalari.yourEarningsThisWeek": "ఈ వారం మీ ఆదాయం",
    "dhalari.viewRequests": "అభ్యర్థనలను చూడండి",
    "dhalari.myProfile": "నా ప్రొఫైల్",
    "dhalari.analytics": "విశ్లేషణలు",
    "dhalari.profileStats": "ప్రొఫైల్ గణాంకాలు",
    "dhalari.rating": "రేటింగ్",
    "dhalari.successRate": "విజయ రేటు",
    "dhalari.verified": "ధృవీకరించబడిన",
    "common.logout": "లాగআউట్",
  },
  hi: {
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
    "farmer.needHelp": "मदद चाहिए?",
    "farmer.support": "समर्थन",
    // Dhalari Dashboard
    "dhalari.welcome": "स्वागत है, व्यापारी!",
    "dhalari.subtitle": "किसान अनुरोधों को प्रबंधित करें, आय को ट्रैक करें और अपने व्यवसाय को बढ़ाएं",
    "dhalari.pendingRequests": "लंबित अनुरोध",
    "dhalari.acceptedDeals": "स्वीकृत सौदे",
    "dhalari.totalEarnings": "कुल आय",
    "dhalari.thisMonth": "इस महीने",
    "dhalari.avgDealValue": "औसत डील मूल्य",
    "dhalari.perTransaction": "प्रति लेनदेन",
    "dhalari.weeklyEarnings": "साप्ताहिक आय",
    "dhalari.yourEarningsThisWeek": "इस सप्ताह आपकी आय",
    "dhalari.viewRequests": "अनुरोध देखें",
    "dhalari.myProfile": "मेरी प्रोफाइल",
    "dhalari.analytics": "विश्लेषण",
    "dhalari.profileStats": "प्रोफाइल आंकड़े",
    "dhalari.rating": "रेटिंग",
    "dhalari.successRate": "सफलता दर",
    "dhalari.verified": "सत्यापित",
    "common.logout": "लॉगआउट",
  },
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>("en")

  const t = (key: string): string => {
    return translations[language][key] || key
  }

  return <LanguageContext.Provider value={{ language, setLanguage, t }}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider")
  }
  return context
}
