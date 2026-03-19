// ============================
//  game.js - ילדה בשוק
// ============================
/* global ITEMS, VENDOR_TYPES, calcPrice, generateVendor, PixelWalk */

// ---- מצב המשחק ----
const gameState = {
    language:      'he',
    coins:         0,
    inventory:     [],      // [{ itemId, qty }]
    vendorCount:   0,
    currentVendor: null,
    prevVendorEmoji: '🏚️',
    prevVendorName:  '',
    walking:       false,
    visitedVendors: [],     // שמירת מוכרים שביקרנו לבלונים
};

let balloonColor = '#e74c3c'; // ברירת מחדל: אדום

function setBalloonColor(color) {
    balloonColor = color;
    document.querySelectorAll('.color-btn').forEach(b => {
        b.classList.toggle('active', b.dataset.color === color);
    });
}

// ---- מצב עסקה ----
const tradeState = {
    pendingItem:   null,   // { itemId, price, isBuy }
    attempts:      0,
    correctAnswer: null,
    // סל קניות
    buyCart:  [],   // [{ itemId, price }]
    sellCart: [],   // [{ itemId, price }]
    mathStep: 0,   // 0=total, 1=remaining
    cartTotal: 0,
    isBuyCheckout: true,
};

const MAX_ATTEMPTS = 5;

// ---- PixelWalk instance ----
let pixelWalk = null;

let WIN_GOAL = 100;

function setGoal(val) {
    WIN_GOAL = parseInt(val, 10);
}

// ---- תרגומים ----
const T = {
    he: {
        title:          'ילדה בשוק',
        subtitle:       'MARKET GIRL',
        startBtn:       'התחל משחק',
        settingsBtn:    'הגדרות',
        pressStart:     'לחץ כדי להתחיל',
        settingsTitle:  'הגדרות',
        langLabel:      'שפה',
        coinsLabel:     'מטבעות התחלתיים',
        goalLabel:      'יעד לניצחון',
        back:           'חזור',
        vendorLabel:    'מוכר',
        vendorLabelF:   'מוכרת',
        bannerText:     'שוק הכפר',
        talkBtn:        'דבר עם המוכר',
        nextVendor:     'עבור לדוכן הבא',
        walkMsg1:       'הילדה יוצאת לשוק...',
        walkMsg2:       'הילדה הולכת לדוכן הבא...',
        arrivedMsg:     'הגעת לדוכן!',
        tradeHeader:    'עסקה',
        backTrade:      'חזור לשוק',
        tabBuy:         'קנה',
        tabSell:        'מכור',
        buyBtn:         'קנה',
        sellBtn:        'מכור',
        noForSale:      'אין פריטים למכירה',
        noToSell:       'אין פריטים שהמוכר קונה',
        correct:        '✓ נכון! 🌟',
        tryAgain:       '✗ נסה שוב',
        attemptsLeft:   'נסיונות שנותרו:',
        answerWas:      'התשובה הייתה',
        mathBuy:        'יש לך {coins} 🪙\n{item} עולה {price} 🪙\nכמה יישאר לך?',
        mathSell:       'יש לך {coins} 🪙\nמוכרים {item} ב-{price} 🪙\nכמה יהיה לך?',
        winHeader:      'ניצחת!',
        winTitle:       'כל הכבוד! 🌟',
        winCoinsLabel:  'מטבעות',
        winVendorsLabel:'דוכנים שביקרת',
        winMsg:         'הצלחת לאסוף 100 מטבעות!',
        winAgain:       'שחק שוב',
        overHeader:     'אוי לא!',
        overTitle:      'נגמרו המטבעות',
        overVendorsLabel:'דוכנים שביקרת',
        overMsg:        'אין מטבעות ואין מה למכור...',
        overAgain:      'נסה שוב',
        volumeLabel:    'מוסיקה',
        walkSettings:   'הגדרות',
        balloonColor:   'צבע בלונים',
        popBalloons:    'לחצי על הבלונים!',
        instructionsBtn:'הוראות',
        instructionsTitle:'הוראות המשחק',
        instrGoalTitle: '🎯 מטרת המשחק',
        instrGoal:      'אספו מטבעות על ידי קנייה ומכירה חכמה בשוק! הגיעו ליעד המטבעות כדי לנצח.',
        instrHowTitle:  '🛒 איך משחקים?',
        instrHow:       'הילדה מסיירת בשוק ופוגשת מוכרים. אפשר לקנות פריטים במחיר זול ולמכור אותם במחיר גבוה יותר אצל מוכר אחר.',
        instrMathTitle: '🧮 שאלות חשבון',
        instrMath:      'בכל קנייה או מכירה צריך לפתור שאלות חשבון: חיבור וחיסור. טעיתם 5 פעמים? העסקה מתבטלת!',
        instrTipsTitle: '💡 טיפים',
        instrTips:      '• קנו בזול ומכרו ביוקר\n\n• שימו לב למחירים אצל כל מוכר\n\n• אם נגמרו המטבעות והפריטים - המשחק נגמר!',
        backInstr:      'חזור לתפריט',
        instrNext:      'עמוד הבא',
        youGot:         'קיבלת:',
        addToCart:       '+',
        removeFromCart:  '−',
        cartBuy:        'סל קניות',
        cartSell:       'סל מכירה',
        total:          'סה"כ',
        checkout:       'שלם',
        sellAll:        'מכור הכל',
        mathTotal:      'כמה עולים כל הפריטים בסל ביחד?',
        mathTotalSell:  'כמה שווים כל הפריטים שאת מוכרת ביחד?',
        mathRemainBuy:  'יש לך {coins} 🪙\nהסל עולה {total} 🪙\nכמה יישאר לך?',
        mathRemainSell: 'יש לך {coins} 🪙\nמכרת ב-{total} 🪙\nכמה יהיה לך?',
        cartItems:      'פריטים בסל:',
        items:          'פריטים',
    },
    en: {
        title:          'MARKET GIRL',
        subtitle:       'ילדה בשוק',
        startBtn:       'START GAME',
        settingsBtn:    'SETTINGS',
        pressStart:     'PRESS TO START',
        settingsTitle:  'SETTINGS',
        langLabel:      'Language',
        coinsLabel:     'Starting Coins',
        goalLabel:      'Win Goal',
        back:           'BACK',
        vendorLabel:    'Vendor',
        vendorLabelF:   'Vendor',
        bannerText:     'Village Market',
        talkBtn:        'Talk to Vendor',
        nextVendor:     'Next Stall',
        walkMsg1:       'The girl heads to the market...',
        walkMsg2:       'The girl walks to the next stall...',
        arrivedMsg:     'You arrived at the stall!',
        tradeHeader:    'Trade',
        backTrade:      'Back to Market',
        tabBuy:         'Buy',
        tabSell:        'Sell',
        buyBtn:         'Buy',
        sellBtn:        'Sell',
        noForSale:      'No items for sale',
        noToSell:       'No items this vendor buys',
        correct:        '✓ Correct! 🌟',
        tryAgain:       '✗ Try again',
        attemptsLeft:   'Attempts left:',
        answerWas:      'Answer was',
        mathBuy:        'You have {coins} 🪙\n{item} costs {price} 🪙\nHow many coins left?',
        mathSell:       'You have {coins} 🪙\nSell {item} for {price} 🪙\nHow many coins total?',
        winHeader:      'You Win!',
        winTitle:       'Well Done! 🌟',
        winCoinsLabel:  'Coins',
        winVendorsLabel:'Stalls Visited',
        winMsg:         'You collected 100 coins!',
        winAgain:       'Play Again',
        overHeader:     'Oh No!',
        overTitle:      'Out of Coins',
        overVendorsLabel:'Stalls Visited',
        overMsg:        'No coins and nothing left to sell...',
        overAgain:      'Try Again',
        volumeLabel:    'Music',
        walkSettings:   'Settings',
        balloonColor:   'Balloon Color',
        popBalloons:    'Pop the balloons!',
        instructionsBtn:'Instructions',
        instructionsTitle:'How to Play',
        instrGoalTitle: '🎯 Goal',
        instrGoal:      'Collect coins by buying and selling smartly at the market! Reach the coin goal to win.',
        instrHowTitle:  '🛒 How to Play?',
        instrHow:       'The girl walks through the market meeting vendors. Buy items cheap and sell them for more at another vendor.',
        instrMathTitle: '🧮 Math Questions',
        instrMath:      'Each buy or sell requires solving math questions: addition and subtraction. Wrong 5 times? The deal is cancelled!',
        instrTipsTitle: '💡 Tips',
        instrTips:      '• Buy low, sell high\n\n• Compare prices between vendors\n\n• If you run out of coins and items - game over!',
        backInstr:      'Back to Menu',
        instrNext:      'Next Page',
        youGot:         'You got:',
        addToCart:       '+',
        removeFromCart:  '−',
        cartBuy:        'Shopping Cart',
        cartSell:       'Sell Cart',
        total:          'Total',
        checkout:       'Pay',
        sellAll:        'Sell All',
        mathTotal:      'How much do all the items in the cart cost together?',
        mathTotalSell:  'How much are all the items you are selling worth together?',
        mathRemainBuy:  'You have {coins} 🪙\nCart costs {total} 🪙\nHow many coins left?',
        mathRemainSell: 'You have {coins} 🪙\nYou sold for {total} 🪙\nHow many coins total?',
        cartItems:      'Items in cart:',
        items:          'items',
    }
};

// ---- מיפוי טקסטים לאלמנטים ----
const textMap = {
    'txt-title':          'title',
    'txt-subtitle':       'subtitle',
    'txt-start':          'startBtn',
    'txt-settings-btn':   'settingsBtn',
    'txt-press':          'pressStart',
    'txt-settings-title': 'settingsTitle',
    'txt-lang-label':     'langLabel',
    'txt-coins-label':    'coinsLabel',
    'txt-goal-label':     'goalLabel',
    'txt-back':           'back',
    'txt-talk':           'talkBtn',
    'txt-next':           'nextVendor',
    'walk-banner-text':   'bannerText',
    'txt-trade-header':   'tradeHeader',
    'txt-back-trade':     'backTrade',
    'txt-tab-buy':        'tabBuy',
    'txt-tab-sell':       'tabSell',
    'txt-win-header':     'winHeader',
    'txt-win-title':      'winTitle',
    'txt-win-coins-label':'winCoinsLabel',
    'txt-win-vendors-label':'winVendorsLabel',
    'txt-win-msg':        'winMsg',
    'txt-win-again':      'winAgain',
    'txt-over-header':    'overHeader',
    'txt-over-title':     'overTitle',
    'txt-over-vendors-label':'overVendorsLabel',
    'txt-over-msg':       'overMsg',
    'txt-over-again':     'overAgain',
    'txt-volume-label':   'volumeLabel',
    'txt-walk-settings':  'walkSettings',
    'txt-balloon-color':  'balloonColor',
    'txt-pop-balloons':   'popBalloons',
    'txt-instructions-btn':'instructionsBtn',
    'txt-instructions-title-1':'instructionsTitle',
    'txt-instructions-title-2':'instructionsTitle',
    'txt-instr-next':     'instrNext',
    'txt-instr-goal-title':'instrGoalTitle',
    'txt-instr-goal':     'instrGoal',
    'txt-instr-how-title':'instrHowTitle',
    'txt-instr-how':      'instrHow',
    'txt-instr-math-title':'instrMathTitle',
    'txt-instr-math':     'instrMath',
    'txt-instr-tips-title':'instrTipsTitle',
    'txt-instr-tips':     'instrTips',
    'txt-back-instr':     'backInstr',
};

function updateTexts() {
    const t = T[gameState.language];
    for (const [id, key] of Object.entries(textMap)) {
        const el = document.getElementById(id);
        if (el && t[key] !== undefined) el.textContent = t[key];
    }
}

// ---- שפה ----
function setLanguage(lang) {
    gameState.language = lang;
    document.documentElement.setAttribute('lang', lang);
    document.documentElement.setAttribute('dir', lang === 'he' ? 'rtl' : 'ltr');
    document.getElementById('btn-lang-he').classList.toggle('active', lang === 'he');
    document.getElementById('btn-lang-en').classList.toggle('active', lang === 'en');
    updateTexts();
}

// ---- ניווט ----
let previousScreen = 'screen-title';

function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    const target = document.getElementById(screenId);
    if (target) target.classList.add('active');

    // מוסיקה לכל מסך
    const musicMap = {
        'screen-title': 'title',
        'screen-instructions-1': 'title',
        'screen-instructions-2': 'title',
        'screen-walk': 'walk',
        'screen-trade': 'trade',
        'screen-win': 'win',
        'screen-balloons': 'win',
        'screen-gameover': 'gameover',
    };
    if (musicMap[screenId]) Music.play(musicMap[screenId]);
}

function openSettings() {
    const active = document.querySelector('.screen.active');
    if (active) previousScreen = active.id;
    showScreen('screen-settings');
}

function closeSettings() {
    showScreen(previousScreen);
}

function openInstructions() {
    previousScreen = 'screen-title';
    showScreen('screen-instructions-1');
}

function closeInstructions() {
    showScreen('screen-title');
}

// ---- אתחול מלאי ----
function buildStartingInventory() {
    return [
        { itemId: 'juice',    qty: 3 },
        { itemId: 'bracelet', qty: 4 },
        { itemId: 'doll',     qty: 5 + Math.floor(Math.random() * 3) },
    ];
}

// ---- התחלת משחק ----
function startGame() {
    gameState.coins         = 0;
    gameState.inventory     = buildStartingInventory();
    gameState.vendorCount   = 0;
    gameState.currentVendor = null;
    gameState.prevVendorEmoji = '🏚️';
    gameState.prevVendorName  = '';
    gameState.visitedVendors  = [];

    window.onVendorArrived = function(vendorData) {
        setMessage(vendorData.greeting, vendorData.emoji);
        document.getElementById('btn-talk').style.display = 'flex';
        document.getElementById('btn-next').style.display = 'flex';
        document.getElementById('btn-walk-settings').style.display = 'flex';
        gameState.prevVendorEmoji = vendorData.emoji;
        gameState.prevVendorName  = vendorData.name;
        gameState.walking = false;
    };

    showScreen('screen-walk');
    updateHUD();
    walkToNextVendor(true);
}

// ---- עדכון HUD ----
function updateHUD() {
    const el = document.getElementById('walk-coins');
    if (el) el.textContent = gameState.coins;

    const vl = document.getElementById('walk-vendor-label');
    if (vl) {
        const t = T[gameState.language];
        const vendor = gameState.currentVendor;
        const label = (vendor && vendor.isFemale) ? t.vendorLabelF : t.vendorLabel;
        vl.textContent = `${label} ${gameState.vendorCount}`;
    }
}

// ---- הליכה לדוכן הבא ----
function walkToNextVendor(firstTime = false) {
    if (gameState.walking) return;
    gameState.walking = true;

    const t    = T[gameState.language];
    const lang = gameState.language;

    gameState.vendorCount++;
    const vendor = generateVendor(gameState.vendorCount, lang);
    gameState.currentVendor = vendor;
    gameState.visitedVendors.push(vendor);

    updateHUD();

    document.getElementById('btn-talk').style.display = 'none';
    document.getElementById('btn-next').style.display = 'none';
    document.getElementById('btn-walk-settings').style.display = 'none';
    setMessage(firstTime ? t.walkMsg1 : t.walkMsg2, '🧒');

    if (pixelWalk) pixelWalk.stop();
    const canvas = document.getElementById('walk-canvas');
    pixelWalk = new PixelWalk(canvas, {
        vendor,
        language: lang,
        prevEmoji: gameState.prevVendorEmoji,
    });
    pixelWalk.start();
}

// ---- עדכון תיבת הודעה ----
function setMessage(text, portrait = '🧒') {
    const msgEl  = document.getElementById('walk-message');
    const portEl = document.getElementById('msg-portrait');
    if (msgEl)  msgEl.textContent  = text;
    if (portEl) portEl.textContent = portrait;
}

// ============================
//  מסך עסקה
// ============================

function openTrade() {
    const vendor = gameState.currentVendor;
    if (!vendor) return;

    document.getElementById('trade-vendor-name').textContent  = vendor.name;
    document.getElementById('trade-vendor-emoji').textContent = vendor.emoji;
    document.getElementById('trade-coins').textContent        = gameState.coins;

    // איפוס סלים
    tradeState.buyCart  = [];
    tradeState.sellCart = [];

    buildBuyList(vendor);
    buildSellList(vendor);
    updateCartDisplay('buy');
    updateCartDisplay('sell');
    switchTab('buy');
    hideMathOverlay();

    showScreen('screen-trade');
}

function buildBuyList(vendor) {
    const lang = gameState.language;
    const t    = T[lang];
    const list = document.getElementById('buy-list');
    list.innerHTML = '';

    if (!vendor.forSale.length) {
        list.innerHTML = `<div class="empty-msg">${t.noForSale}</div>`;
        return;
    }

    vendor.forSale.forEach(({ itemId, qty, price }) => {
        const item = ITEMS[itemId];
        if (!item) return;
        const inCart = tradeState.buyCart.filter(c => c.itemId === itemId).length;
        const availQty = qty - inCart;
        const cartTotal = tradeState.buyCart.reduce((s, c) => s + c.price, 0);
        const canAdd = availQty > 0 && (gameState.coins - cartTotal) >= price;

        const row = document.createElement('div');
        row.className = 'item-row' + (canAdd ? '' : ' cant-afford');
        row.innerHTML = `
            <div class="item-info">
                <span class="item-emoji">${item.emoji}</span>
                <span class="item-name">${item[lang]}</span>
                <span class="item-price">🪙${price}</span>
            </div>
            <div class="item-right">
                <span class="item-stock">x${availQty}</span>
                <button class="pixel-btn small-btn cart-add-btn" ${canAdd ? '' : 'disabled'}
                    onclick="addToCart(true, '${itemId}', ${price})">
                    ${t.addToCart}
                </button>
            </div>`;
        list.appendChild(row);
    });
}

function buildSellList(vendor) {
    const lang     = gameState.language;
    const t        = T[lang];
    const list     = document.getElementById('sell-list');
    list.innerHTML = '';

    const sellable = gameState.inventory.filter(({ qty }) => qty > 0);

    if (!sellable.length) {
        list.innerHTML = `<div class="empty-msg">${t.noToSell}</div>`;
        return;
    }

    const specialtyIds = vendor.forSale.map(i => i.itemId);

    sellable.forEach(({ itemId, qty }) => {
        const item       = ITEMS[itemId];
        if (!item) return;
        const isSpecialty = specialtyIds.includes(itemId);
        const rate        = isSpecialty ? vendor.buyRate : vendor.buyRate * 0.5;
        const sellPrice   = calcPrice(item.basePrice, rate);
        const inCart = tradeState.sellCart.filter(c => c.itemId === itemId).length;
        const availQty = qty - inCart;
        const canAdd = availQty > 0;

        const row = document.createElement('div');
        row.className = 'item-row';
        row.innerHTML = `
            <div class="item-info">
                <span class="item-emoji">${item.emoji}</span>
                <span class="item-name">${item[lang]}</span>
                <span class="item-price">🪙${sellPrice}</span>
            </div>
            <div class="item-right">
                <span class="item-stock">x${availQty}</span>
                <button class="pixel-btn small-btn cart-add-btn" ${canAdd ? '' : 'disabled'}
                    onclick="addToCart(false, '${itemId}', ${sellPrice})">
                    ${t.addToCart}
                </button>
            </div>`;
        list.appendChild(row);
    });
}

// ---- סל קניות ----

function addToCart(isBuy, itemId, price) {
    const cart = isBuy ? tradeState.buyCart : tradeState.sellCart;
    cart.push({ itemId, price });
    refreshTradeUI();
}

function removeFromCart(isBuy, index) {
    const cart = isBuy ? tradeState.buyCart : tradeState.sellCart;
    cart.splice(index, 1);
    refreshTradeUI();
}

function refreshTradeUI() {
    const vendor = gameState.currentVendor;
    buildBuyList(vendor);
    buildSellList(vendor);
    updateCartDisplay('buy');
    updateCartDisplay('sell');
}

function updateCartDisplay(type) {
    const isBuy = type === 'buy';
    const cart = isBuy ? tradeState.buyCart : tradeState.sellCart;
    const lang = gameState.language;
    const t = T[lang];

    const areaEl = document.getElementById(isBuy ? 'buy-cart' : 'sell-cart');
    const itemsEl = document.getElementById(isBuy ? 'buy-cart-items' : 'sell-cart-items');
    const countEl = document.getElementById(isBuy ? 'buy-cart-count' : 'sell-cart-count');

    if (!cart.length) {
        areaEl.style.display = 'none';
        return;
    }

    areaEl.style.display = 'block';
    itemsEl.innerHTML = '';

    cart.forEach((entry, i) => {
        const item = ITEMS[entry.itemId];
        if (!item) return;
        const chip = document.createElement('span');
        chip.className = 'cart-chip';
        chip.innerHTML = `${item.emoji} <button class="cart-remove" onclick="removeFromCart(${isBuy}, ${i})">✕</button>`;
        itemsEl.appendChild(chip);
    });

    countEl.textContent = cart.length;
}

function switchTab(tab) {
    document.getElementById('panel-buy').style.display  = tab === 'buy'  ? 'block' : 'none';
    document.getElementById('panel-sell').style.display = tab === 'sell' ? 'block' : 'none';
    document.getElementById('tab-buy').classList.toggle('active',  tab === 'buy');
    document.getElementById('tab-sell').classList.toggle('active', tab === 'sell');
}

// ---- שאלות חשבון (סל קניות) ----

function startCheckout(isBuy) {
    const cart = isBuy ? tradeState.buyCart : tradeState.sellCart;
    if (!cart.length) return;

    const lang = gameState.language;
    const t    = T[lang];
    const total = cart.reduce((s, c) => s + c.price, 0);

    tradeState.isBuyCheckout = isBuy;
    tradeState.cartTotal     = total;
    tradeState.mathStep      = 0;  // שלב 1: חשב סה"כ
    tradeState.attempts      = 0;
    tradeState.correctAnswer = total;

    // הצג שאלה 1: כמה עולים כל הפריטים ביחד?
    const itemsList = cart.map(c => {
        const item = ITEMS[c.itemId];
        return item ? `${item.emoji} 🪙${c.price}` : '';
    }).join('  +  ');

    const question = (isBuy ? t.mathTotal : t.mathTotalSell) + '\n\n' + itemsList;
    showMathOverlay(question);
}

function showMathOverlay(question) {
    document.getElementById('math-question').textContent = question;
    document.getElementById('math-answer').value         = '';
    document.getElementById('math-feedback').textContent = '';
    document.getElementById('math-attempts').textContent = '';
    document.getElementById('math-overlay').style.display = 'flex';
    document.getElementById('math-answer').focus();
}

function hideMathOverlay() {
    document.getElementById('math-overlay').style.display = 'none';
}

function submitAnswer() {
    const val = parseInt(document.getElementById('math-answer').value, 10);
    if (isNaN(val)) return;

    const lang = gameState.language;
    const t    = T[lang];

    if (val === tradeState.correctAnswer) {
        document.getElementById('math-feedback').textContent = t.correct;

        if (tradeState.mathStep === 0) {
            // שלב 1 נכון → עבור לשלב 2: כמה יישאר/יהיה
            setTimeout(() => {
                tradeState.mathStep = 1;
                tradeState.attempts = 0;

                if (tradeState.isBuyCheckout) {
                    tradeState.correctAnswer = gameState.coins - tradeState.cartTotal;
                    const q = t.mathRemainBuy
                        .replace('{coins}', gameState.coins)
                        .replace('{total}', tradeState.cartTotal);
                    showMathOverlay(q);
                } else {
                    tradeState.correctAnswer = gameState.coins + tradeState.cartTotal;
                    const q = t.mathRemainSell
                        .replace('{coins}', gameState.coins)
                        .replace('{total}', tradeState.cartTotal);
                    showMathOverlay(q);
                }
            }, 900);
        } else {
            // שלב 2 נכון → בצע עסקה
            const won = completeCartTrade();
            if (!won) {
                setTimeout(() => {
                    hideMathOverlay();
                    openTrade();
                }, 900);
            }
        }
    } else {
        tradeState.attempts++;
        if (tradeState.attempts >= MAX_ATTEMPTS) {
            document.getElementById('math-feedback').textContent =
                `${t.answerWas} ${tradeState.correctAnswer}`;
            document.getElementById('math-attempts').textContent = '';
            // כישלון → ריקון הסל, לא מבצעים עסקה
            setTimeout(() => {
                hideMathOverlay();
                tradeState.buyCart = [];
                tradeState.sellCart = [];
                refreshTradeUI();
            }, 2000);
        } else {
            document.getElementById('math-feedback').textContent = t.tryAgain;
            document.getElementById('math-attempts').textContent =
                `${t.attemptsLeft} ${MAX_ATTEMPTS - tradeState.attempts}`;
            document.getElementById('math-answer').value = '';
            document.getElementById('math-answer').focus();
        }
    }
}

function completeCartTrade() {
    const isBuy = tradeState.isBuyCheckout;
    const cart = isBuy ? tradeState.buyCart : tradeState.sellCart;

    cart.forEach(({ itemId, price }) => {
        if (isBuy) {
            gameState.coins -= price;
            const existing = gameState.inventory.find(i => i.itemId === itemId);
            if (existing) existing.qty++;
            else gameState.inventory.push({ itemId, qty: 1 });

            const vendorItem = gameState.currentVendor.forSale.find(i => i.itemId === itemId);
            if (vendorItem) vendorItem.qty--;
        } else {
            gameState.coins += price;
            const existing = gameState.inventory.find(i => i.itemId === itemId);
            if (existing) existing.qty = Math.max(0, existing.qty - 1);
        }
    });

    // ריקון הסל
    tradeState.buyCart = [];
    tradeState.sellCart = [];

    document.getElementById('trade-coins').textContent = gameState.coins;
    updateHUD();
    return checkWin();
}

function closeTrade() {
    showScreen('screen-walk');
    checkGameOver();
}

// ============================
//  תנאי ניצחון / הפסד
// ============================

function checkWin() {
    if (gameState.coins >= WIN_GOAL) {
        showWin();
        return true;
    }
    return false;
}

function checkGameOver() {
    if (gameState.coins > 0) return false;
    const hasAnything = gameState.inventory.some(i => i.qty > 0);
    if (!hasAnything) {
        showGameOver();
        return true;
    }
    return false;
}

function showWin() {
    if (pixelWalk) { pixelWalk.stop(); pixelWalk = null; }
    updateTexts();
    showBalloons();
}

// ============================
//  מסך בלונים (ניצחון)
// ============================

function showBalloons() {
    const area = document.getElementById('balloons-area');
    area.innerHTML = '';

    // בחירת עד 6 מוכרים אקראיים מהמוכרים שביקרנו
    const vendors = [...gameState.visitedVendors];
    while (vendors.length > 6) {
        vendors.splice(Math.floor(Math.random() * vendors.length), 1);
    }
    // אם פחות מ-3, נוסיף מוכרים חדשים
    while (vendors.length < 3) {
        vendors.push(generateVendor(vendors.length + 1, gameState.language));
    }

    vendors.forEach((vendor, i) => {
        const balloon = document.createElement('div');
        balloon.className = 'balloon';
        balloon.style.setProperty('--balloon-color', balloonColor);
        balloon.style.setProperty('--x', (12 + (i % 3) * 30 + Math.random() * 15) + '%');
        balloon.style.setProperty('--delay', (i * 0.3) + 's');
        balloon.style.setProperty('--duration', (2.5 + Math.random() * 1.5) + 's');

        // תוכן הבלון (נסתר)
        balloon.dataset.vendorIndex = i;
        balloon.innerHTML = '<span class="balloon-knot"></span>';

        balloon.addEventListener('click', () => popBalloon(balloon, vendor, i));
        area.appendChild(balloon);
    });

    area.dataset.remaining = vendors.length;
    showScreen('screen-balloons');
}

function popBalloon(balloon, vendor, index) {
    if (balloon.classList.contains('popped')) return;

    balloon.classList.add('popped');

    // אנימציית פיצוץ → הצג חנות
    setTimeout(() => {
        balloon.innerHTML = '';
        balloon.className = 'revealed-shop';

        const lang = gameState.language;
        const t = T[lang];
        const itemsHtml = vendor.forSale.map(({ itemId }) => {
            const item = ITEMS[itemId];
            return item ? `<span class="shop-item-emoji">${item.emoji}</span>` : '';
        }).join('');

        balloon.innerHTML = `
            <div class="shop-emoji">${vendor.emoji}</div>
            <div class="shop-name">${vendor.name}</div>
            <div class="shop-items">${itemsHtml}</div>
        `;

        balloon.addEventListener('click', () => collectShopItems(balloon, vendor));
    }, 400);
}

function collectShopItems(shopEl, vendor) {
    if (shopEl.classList.contains('collected')) return;
    shopEl.classList.add('collected');

    const lang = gameState.language;
    const t = T[lang];

    // הצג מה קיבלנו
    const itemNames = vendor.forSale.map(({ itemId }) => {
        const item = ITEMS[itemId];
        return item ? `${item.emoji} ${item[lang]}` : '';
    }).filter(Boolean).join(', ');

    // הוסף לגוף הטוסט
    const toast = document.createElement('div');
    toast.className = 'collect-toast';
    toast.textContent = `${t.youGot} ${itemNames}`;
    shopEl.appendChild(toast);

    // אנימציית איסוף
    shopEl.classList.add('fly-away');

    const area = document.getElementById('balloons-area');
    let remaining = parseInt(area.dataset.remaining) - 1;
    area.dataset.remaining = remaining;

    if (remaining <= 0) {
        setTimeout(() => {
            showScreen('screen-title');
        }, 1500);
    }
}

function showGameOver() {
    if (pixelWalk) { pixelWalk.stop(); pixelWalk = null; }
    document.getElementById('over-vendors').textContent = gameState.vendorCount;
    updateTexts();
    showScreen('screen-gameover');
}

// ---- שליטה בווליום ----
function setMusicVolume(val) {
    Music.setVolume(parseFloat(val));
}

function toggleMute() {
    const muted = Music.toggleMute();
    const btn = document.getElementById('btn-mute');
    const slider = document.getElementById('volume-slider');
    if (btn) btn.textContent = muted ? '🔇' : '🔊';
    if (slider) slider.disabled = muted;
}

// ---- אתחול ----
document.addEventListener('DOMContentLoaded', () => {
    updateTexts();
});
