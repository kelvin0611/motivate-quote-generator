// Define global variable for quotes
var globalQuotes = [];

$(document).ready(function() {
    // --- Settings ---
    const yourSheetID = "1o0-ffDBOVSnoTOQnAhLSbE8pf-ZS-QgmrOcYOzxF9fo"; 
    
    // UI Dictionary
    const translations = {
        tc: { nextBtn: "下一句", copyTitle: "複製文字", waTitle: "分享到 WhatsApp", credit: "Designed for HK Students", copied: "已複製！", error: "暫時無法獲取語錄", shareText: "✨ 今日一句：" },
        en: { nextBtn: "Next Quote", copyTitle: "Copy Text", waTitle: "Share to WhatsApp", credit: "Designed for HK Students", copied: "Copied!", error: "Unable to fetch quotes", shareText: "✨ Daily Quote:" },
        sc: { nextBtn: "下一句", copyTitle: "复制文字", waTitle: "分享到 WhatsApp", credit: "Designed for HK Students", copied: "已复制！", error: "暂时无法获取语录", shareText: "✨ 今日一句：" }
    };

    let currentLang = "tc"; 
    let currentQuoteData = {}; 
    const hkTags = ["#DSE加油", "#頂住呀", "#HKStudent", "#NeverGiveUp", "#搏盡無悔", "#DSEfighter"];

    // 1. Initialize
    init();

    function init() {
        updateDate();
        loadTheme();
        
        // Language Switcher
        $("#lang-select").change(function() {
            currentLang = $(this).val();
            updateUILanguage();
            if (globalQuotes.length > 0) {
                renderQuoteText(currentQuoteData); 
            }
        });

        // Start Loading Data
        fetchGoogleSheetJSONP();
    }

    // --- Core Data Fetching ---
    function fetchGoogleSheetJSONP() {
        $("#quote").css("opacity", 0.5);
        const callbackName = 'googleSheetCallback';
        // gid=0 is the first sheet
        const url = `https://docs.google.com/spreadsheets/d/${yourSheetID}/gviz/tq?tqx=responseHandler:${callbackName}&gid=0`;

        const script = document.createElement('script');
        script.src = url;
        script.onerror = function() {
            console.error("Fetch failed");
            useLocalQuotes();
        };
        document.body.appendChild(script);
    }

    // --- Fallback Data ---
    function useLocalQuotes() {
        globalQuotes = [
            { quote_tc: "休息是為了走更長的路。", author_tc: "老生常談", quote_en: "Rest is for a longer journey.", author_en: "Proverb", quote_sc: "休息是为了走更长的路。", author_sc: "老生常谈" },
            { quote_tc: "做人如果無夢想，同條鹹魚有咩分別？", author_tc: "少林足球", quote_en: "No dream, no difference from a salted fish.", author_en: "Shaolin Soccer", quote_sc: "做人如果没有梦想，跟咸鱼有什么区别？", author_sc: "少林足球" }
        ];
        console.log("Using local backup data");
        displayRandomQuote();
    }

    // --- Display Logic ---
    window.displayRandomQuote = function() {
        if (globalQuotes.length === 0) return;
        const randomIndex = Math.floor(Math.random() * globalQuotes.length);
        currentQuoteData = globalQuotes[randomIndex];
        renderQuoteText(currentQuoteData);
        updateTag();
    };

    function updateTag() {
        const randomTag = hkTags[Math.floor(Math.random() * hkTags.length)];
        $("#dynamic-tag").text(randomTag).removeClass("animated pulse");
        setTimeout(() => $("#dynamic-tag").addClass("animated pulse"), 10);
    }

    function renderQuoteText(item) {
        let q = "", a = "";
        
        if (currentLang === "tc") {
            q = item.quote_tc || item.quote_en; 
            a = item.author_tc || item.author_en;
        } else if (currentLang === "en") {
            q = item.quote_en || item.quote_tc;
            a = item.author_en || item.author_tc;
        } else if (currentLang === "sc") {
            q = item.quote_sc || item.quote_tc;
            a = item.author_sc || item.author_tc;
        }

        if (!q) q = translations[currentLang].error;

        // Auto-Resize Font for Long Text
        adjustFontSize(q);

        $("#quote").animate({ opacity: 0 }, 200, function() {
            $(this).text(q).animate({ opacity: 1 }, 200);
        });
        
        $("#author").animate({ opacity: 0 }, 200, function() {
            $(this).text(a ? "- " + a : "").animate({ opacity: 1 }, 200);
        });
    }

    // Helper: Shrink font if text is too long (Mobile Friendly)
    function adjustFontSize(text) {
        const length = text.length;
        const $quote = $("#quote");
        
        // Default size defined in CSS is 1.5rem
        if (length > 150) {
            $quote.css("font-size", "1rem"); 
        } else if (length > 80) {
            $quote.css("font-size", "1.2rem");
        } else {
            $quote.css("font-size", ""); // Reset to default
        }
    }

    // --- Event Listeners ---
    $("#new").click(function() { window.displayRandomQuote(); });

    $("#copy-btn").click(function() {
        const btn = $(this);
        const icon = btn.find("i");
        const quote = $("#quote").text();
        const author = $("#author").text();
        const textToCopy = `"${quote}" ${author}`;

        navigator.clipboard.writeText(textToCopy).then(() => {
            btn.addClass("copied");
            icon.removeClass("fa-copy").addClass("fa-check");
            setTimeout(() => {
                btn.removeClass("copied");
                icon.removeClass("fa-check").addClass("fa-copy");
            }, 1500);
        });
    });

    $("#whatsapp-btn").click(function() {
        const quote = $("#quote").text();
        const author = $("#author").text();
        const tag = $("#dynamic-tag").text();
        const sharePrefix = translations[currentLang].shareText;
        const text = encodeURIComponent(`${sharePrefix}\n"${quote}"\n${author}\n\n${tag}`);
        window.open('https://wa.me/?text=' + text, '_blank');
    });

    // --- Utilities ---
    function updateDate() {
        const dateOptions = { year: 'numeric', month: 'short', day: 'numeric' };
        const locale = currentLang === 'en' ? 'en-US' : (currentLang === 'sc' ? 'zh-CN' : 'zh-HK');
        $("#current-date").text(new Date().toLocaleDateString(locale, dateOptions));
    }
    
    function updateUILanguage() {
        const t = translations[currentLang];
        $(".btn-text").text(t.nextBtn);
        $("#copy-btn").attr("title", t.copyTitle);
        $("#whatsapp-btn").attr("title", t.waTitle);
        $(".credit").text(t.credit);
    }
    
    function loadTheme() {
        if (localStorage.getItem("theme") === "dark") {
            $("body").addClass("dark-mode");
            $("#theme-toggle i").removeClass("fa-moon").addClass("fa-sun");
        }
        $("#theme-toggle").click(function() {
            $("body").toggleClass("dark-mode");
            const isDark = $("body").hasClass("dark-mode");
            $("#theme-toggle i").attr("class", isDark ? "fas fa-sun" : "fas fa-moon");
            localStorage.setItem("theme", isDark ? "dark" : "light");
        });
    }
});

// --- Google Sheet Callback (Must be global) ---
window.googleSheetCallback = function(json) {
    console.log("Data Received", json);
    
    const rows = json.table.rows;
    const result = [];

    rows.forEach(row => {
        const c = row.c;
        if (!c) return;

        // Map Columns A-F
        const item = {
            quote_tc: c[0] ? c[0].v : "",
            author_tc: c[1] ? c[1].v : "",
            quote_en: c[2] ? c[2].v : "",
            author_en: c[3] ? c[3].v : "",
            quote_sc: c[4] ? c[4].v : "",
            author_sc: c[5] ? c[5].v : ""
        };

        if (item.quote_tc !== "quote_tc" && (item.quote_tc || item.quote_en)) {
            result.push(item);
        }
    });

    if (result.length > 0) {
        globalQuotes = result;
        window.displayRandomQuote();
    }
};
