export const translations = {
    en: {
        title: "AlgeriaPulse 2.0",
        fetching: "Fetching latest news...",
        loadingHistory: "Loading history...",
        syncing: "Syncing live news...",
        live: "Live",
        offline: "Offline Mode",
        errorMaps: "Error loading maps.",
        resetView: "Reset View",
        pause: "Pause",
        play: "Play",
        speed: "Speed",
        events: "Events",
        location: "Location",
        timelineRange: "Timeline Range",
        readMore: "Read Full Article →",
        globalEvent: "Global Event",
        wilaya: "Wilaya",
        noEvents: "No events found in this range."
    },
    ar: {
        title: "نبض الجزائر 2.0",
        fetching: "جاري جلب آخر الأخبار...",
        loadingHistory: "جاري تحميل الأرشيف...",
        syncing: "جاري المزامنة مع الأخبار العاجلة...",
        live: "مباشر",
        offline: "وضع غير متصل بالإنترنت",
        errorMaps: "خطأ في تحميل الخرائط.",
        resetView: "إعادة تعيين المشهد",
        pause: "إيقاف مؤقت",
        play: "تشغيل",
        speed: "السرعة",
        events: "أحداث",
        location: "الموقع",
        timelineRange: "النطاق الزمني",
        readMore: "اقرأ المقال كاملاً ←",
        globalEvent: "حدث عالمي",
        wilaya: "ولاية",
        noEvents: "لم يتم العثور على أحداث في هذا النطاق."
    }
};

export function t(key, lang = 'en') {
    return translations[lang][key] || key;
}
