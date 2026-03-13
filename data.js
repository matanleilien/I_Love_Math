// ============================
//  data.js - פריטים ומוכרים
// ============================

// ---- פריטים ----
// basePrice = מחיר בסיס הגיוני בין פריטים
const ITEMS = {
    // מזון ושתייה (זול)
    apple:    { he: 'תפוח',       en: 'Apple',        emoji: '🍎', basePrice: 1 },
    pencil:   { he: 'עיפרון',     en: 'Pencil',       emoji: '✏️', basePrice: 1 },
    bread:    { he: 'לחם',        en: 'Bread',        emoji: '🍞', basePrice: 2 },
    cards:    { he: 'קלפים',      en: 'Cards',        emoji: '🃏', basePrice: 2 },
    cheese:   { he: 'גבינה',      en: 'Cheese',       emoji: '🧀', basePrice: 3 },
    juice:    { he: 'מיץ סחוט',   en: 'Fresh Juice',  emoji: '🥤', basePrice: 4 },
    ball:     { he: 'כדור',       en: 'Ball',         emoji: '⚽', basePrice: 4 },
    basket:   { he: 'סל קש',      en: 'Straw Basket', emoji: '🧺', basePrice: 5 },
    notebook: { he: 'מחברת',      en: 'Notebook',     emoji: '📓', basePrice: 5 },

    // מלאכת יד ואביזרים (בינוני)
    bracelet: { he: 'צמיד',       en: 'Bracelet',     emoji: '📿', basePrice: 5 },
    honey:    { he: 'דבש',        en: 'Honey',        emoji: '🍯', basePrice: 6 },
    belt:     { he: 'חגורה',      en: 'Belt',         emoji: '🪢', basePrice: 6 },
    hat:      { he: 'כובע',       en: 'Hat',          emoji: '🎩', basePrice: 6 },
    necklace: { he: 'שרשרת',      en: 'Necklace',     emoji: '💎', basePrice: 7 },
    gloves:   { he: 'כפפות',      en: 'Gloves',       emoji: '🧤', basePrice: 7 },
    doll:     { he: 'בובה',       en: 'Doll',         emoji: '🪆', basePrice: 8 },
    cake:     { he: 'עוגה',       en: 'Cake',         emoji: '🎂', basePrice: 8 },
    scissors: { he: 'מספריים',    en: 'Scissors',     emoji: '✂️', basePrice: 8 },
    scarf:    { he: 'צעיף',       en: 'Scarf',        emoji: '🧣', basePrice: 8 },

    // פריטים יקרים יותר
    mirror:   { he: 'מראה',       en: 'Mirror',       emoji: '🪞', basePrice: 9 },
    book:     { he: 'ספר',        en: 'Book',         emoji: '📚', basePrice: 10 },
    lantern:  { he: 'פנס',        en: 'Lantern',      emoji: '🪔', basePrice: 11 },
    pot:      { he: 'סיר',        en: 'Cooking Pot',  emoji: '🍲', basePrice: 12 },
    bag:      { he: 'תיק',        en: 'Bag',          emoji: '🎒', basePrice: 15 },
    blanket:  { he: 'שמיכה',      en: 'Blanket',      emoji: '🛏️', basePrice: 18 },
    shoes:    { he: 'נעליים',     en: 'Shoes',        emoji: '👟', basePrice: 20 },
};

// ---- סוגי מוכרים ----
// sells = פריטים שהמוכר מוכר לשחקן
// buys  = פריטים שהמוכר קונה מהשחקן
// markup  = הכפלת מחיר בסיס למכירה (מוכר מרוויח כשמוכר)
// buyRate = שיעור קנייה מהשחקן (מוכר קונה בזול)
const VENDOR_TYPES = [
    {
        id: 'food',
        he: 'מוכר מזון',
        en: 'Food Vendor',
        emoji: '🥬',
        sells: ['apple', 'bread', 'cheese', 'honey', 'cake'],
        buys:  ['juice', 'basket'],
        markup: 1.2,
        buyRate: 0.6,
    },
    {
        id: 'craft',
        he: 'מוכרת מלאכת יד',
        en: 'Craft Seller',
        emoji: '🧶',
        sells: ['bracelet', 'necklace', 'basket', 'scarf'],
        buys:  ['bracelet', 'necklace', 'mirror'],
        markup: 1.3,
        buyRate: 0.7,
    },
    {
        id: 'toy',
        he: 'מוכר צעצועים',
        en: 'Toy Vendor',
        emoji: '🎮',
        sells: ['doll', 'ball', 'cards'],
        buys:  ['doll', 'ball'],
        markup: 1.1,
        buyRate: 0.6,
    },
    {
        id: 'clothing',
        he: 'מוכר בגדים',
        en: 'Clothing Vendor',
        emoji: '👗',
        sells: ['hat', 'gloves', 'scarf', 'belt', 'shoes'],
        buys:  ['hat', 'scarf', 'gloves', 'belt'],
        markup: 1.4,
        buyRate: 0.5,
    },
    {
        id: 'household',
        he: 'מוכר כלי בית',
        en: 'Household Vendor',
        emoji: '🏠',
        sells: ['pot', 'blanket', 'lantern', 'mirror', 'bag'],
        buys:  ['pot', 'lantern', 'basket'],
        markup: 1.2,
        buyRate: 0.6,
    },
    {
        id: 'stationery',
        he: 'מוכר ציוד לימוד',
        en: 'Stationery Vendor',
        emoji: '📚',
        sells: ['notebook', 'pencil', 'book', 'scissors'],
        buys:  ['notebook', 'book', 'pencil'],
        markup: 1.1,
        buyRate: 0.5,
    },
    {
        id: 'mixed',
        he: 'שוק מעורב',
        en: 'Mixed Market',
        emoji: '🏪',
        sells: ['apple', 'bracelet', 'notebook', 'ball', 'hat', 'honey'],
        buys:  ['juice', 'doll', 'bracelet', 'cards'],
        markup: 1.15,
        buyRate: 0.55,
    },
];

// ---- שמות מוכרים ----
const VENDOR_NAMES = {
    he: {
        first: ['רחל', 'דינה', 'מרים', 'אסתר', 'שרה', 'חנה',
                'שלמה', 'דוד', 'אברהם', 'יעקב', 'נועה', 'תמר',
                'ליאת', 'יוסף', 'בנימין', 'רות'],
        title: {
            food:       'המוכר',
            craft:      'המוכרת',
            toy:        'המוכר',
            clothing:   'הסוחר',
            household:  'המוכר',
            stationery: 'הסופר',
            mixed:      'הסוחר',
        }
    },
    en: {
        first: ['Rachel', 'Dina', 'Miriam', 'Esther', 'Sara', 'Hannah',
                'Solomon', 'David', 'Abraham', 'Jacob', 'Noah', 'Tamar',
                'Lia', 'Joseph', 'Benjamin', 'Ruth'],
        title: {
            food:       'the Grocer',
            craft:      'the Artisan',
            toy:        'the Toy Seller',
            clothing:   'the Tailor',
            household:  'the Merchant',
            stationery: 'the Scribe',
            mixed:      'the Trader',
        }
    }
};

// ---- ברכות מוכרים ----
const VENDOR_GREETINGS = {
    he: [
        'שלום! ברוכה הבאה לדוכן שלי!',
        'אהלן! מה את מחפשת היום?',
        'יש לי סחורה מעולה! בואי תראי!',
        'שלום צעירה! אפשר לעזור?',
        'ברוכה הבאה! תסתכלי על הסחורה שלי!',
        'אהלן ואהלן! מה יש לי לעשות בשבילך?',
    ],
    en: [
        'Hello! Welcome to my stall!',
        'Hi there! What are you looking for?',
        'I have great goods! Come take a look!',
        'Welcome, young one! Can I help you?',
        'Come see my wares!',
        'Greetings! What can I do for you today?',
    ]
};

// ---- פונקציית עזר: מחיר מעוגל ----
function calcPrice(basePrice, rate) {
    return Math.max(1, Math.round(basePrice * rate));
}

// ---- יצירת מוכר אקראי ----
function generateVendor(vendorNumber, language) {
    const type = VENDOR_TYPES[Math.floor(Math.random() * VENDOR_TYPES.length)];

    // וריאציה אישית של המוכר (±15%)
    const personalFactor = 0.85 + Math.random() * 0.3;
    const markup  = type.markup  * personalFactor;
    const buyRate = type.buyRate * personalFactor;

    // שם אקראי
    const names = VENDOR_NAMES[language];
    const firstName = names.first[Math.floor(Math.random() * names.first.length)];
    const title = names.title[type.id];
    const name = language === 'he'
        ? `${firstName} ${title}`
        : `${firstName} ${title}`;

    // ברכה אקראית
    const greetings = VENDOR_GREETINGS[language];
    const greeting = greetings[Math.floor(Math.random() * greetings.length)];

    // בניית מלאי המוכר לקנייה (מה הוא מוכר לשחקן)
    const forSale = type.sells.map(itemId => ({
        itemId,
        qty: Math.floor(Math.random() * 3) + 1,
        price: calcPrice(ITEMS[itemId].basePrice, markup),
    }));

    return {
        number: vendorNumber,
        typeId: type.id,
        name,
        emoji: type.emoji,
        greeting,
        markup: parseFloat(markup.toFixed(2)),
        buyRate: parseFloat(buyRate.toFixed(2)),
        forSale,           // מה המוכר מוכר לשחקן
        buysItemIds: type.buys,  // סוגי פריטים שהמוכר קונה מהשחקן
    };
}
