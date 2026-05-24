// ──── API ────
const API_URL = "https://fakesitehuter.dev";

// ──── DOM ────
const urlInput         = document.getElementById("urlInput");
const scanBtn          = document.getElementById("scanBtn");
const resultPhishing   = document.getElementById("resultPhishing");
const resultLegitimate = document.getElementById("resultLegitimate");
const resultError      = document.getElementById("resultError");
var resultSuspicious   = document.getElementById("resultSuspicious");
var resultUnknown      = document.getElementById("resultUnknown");

// ──── ENTER KEY ────
urlInput.addEventListener("keydown", function(e) {
    if (e.key === "Enter") { e.preventDefault(); scanURL(); }
});

// ──── MOBILE MENU ────
function toggleMobileMenu() {
    document.getElementById("mobileMenu").classList.toggle("active");
}

// ══════════════════════════════════════════════════════════════
// STATS — Fetches from backend /api/stats
// ══════════════════════════════════════════════════════════════

function loadStatsFromBackend() {
    fetch(API_URL + "/api/stats", { method: "GET" })
    .then(function(r) {
        if (!r.ok) throw new Error("No stats endpoint");
        return r.json();
    })
    .then(function(data) {
        var el1 = document.getElementById("statTotalScans");
        var el2 = document.getElementById("statTodayScans");
        var el3 = document.getElementById("statPhishDetected");
        var el4 = document.getElementById("statVisitors");
        if (el1) el1.textContent = formatNumber(data.total_scans || 0);
        if (el2) el2.textContent = formatNumber(data.today_scans || 0);
        if (el3) el3.textContent = formatNumber(data.threats_detected || 0);
        if (el4) el4.textContent = formatNumber(data.total_visitors || 0);
    })
    .catch(function() {
        // Backend not available — keep showing dash
        console.log("Stats endpoint not available");
    });
}

function formatNumber(n) {
    n = Number(n) || 0;
    if (n >= 1000000) return (n / 1000000).toFixed(1) + "M";
    if (n >= 1000) return (n / 1000).toFixed(1) + "K";
    return String(n);
}

// ══════════════════════════════════════════════════════════════
// RECENT SCANS — Fetches from backend /api/recent
// ══════════════════════════════════════════════════════════════
var HISTORY_KEY = "fsh_history";
var MAX_HISTORY = 10;
var useBackendHistory = false;

function loadRecentFromBackend() {
    fetch(API_URL + "/api/recent", { method: "GET" })
    .then(function(r) {
        if (!r.ok) throw new Error("No recent endpoint");
        return r.json();
    })
    .then(function(data) {
        useBackendHistory = true;
        var scans = Array.isArray(data) ? data : (data.scans || data.recent || []);
        renderHistoryFromData(scans);
    })
    .catch(function() {
        useBackendHistory = false;
        renderHistoryFromLocal();
    });
}

function getLocalHistory() {
    try {
        var h = JSON.parse(localStorage.getItem(HISTORY_KEY));
        return Array.isArray(h) ? h : [];
    } catch(e) { return []; }
}

function saveLocalHistory(h) {
    try { localStorage.setItem(HISTORY_KEY, JSON.stringify(h.slice(0, MAX_HISTORY))); } catch(e) {}
}

function addToHistory(url, verdict) {
    try {
        var h = getLocalHistory();
        h.unshift({ url: url, verdict: verdict, time: Date.now() });
        if (h.length > MAX_HISTORY) h = h.slice(0, MAX_HISTORY);
        saveLocalHistory(h);
        if (useBackendHistory) {
            // Reload from backend after a small delay so the DB has the new scan
            setTimeout(function() { loadRecentFromBackend(); }, 500);
        } else {
            renderHistoryFromLocal();
        }
    } catch(e) {}
}

function escapeHtml(str) {
    var div = document.createElement("div");
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
}

// FIX: Handle both Unix timestamps (ms) and UTC date strings from backend
function timeAgo(ts) {
    var diff;
    if (typeof ts === "number") {
        diff = Math.floor((Date.now() - ts) / 1000);
    } else if (typeof ts === "string") {
        // Backend sends UTC timestamps like "2026-03-11 14:30:22"
        // Append "Z" to tell the browser it's UTC
        var utcStr = ts;
        if (!utcStr.endsWith("Z") && !utcStr.includes("+") && !utcStr.includes("T")) {
            utcStr = utcStr.replace(" ", "T") + "Z";
        } else if (!utcStr.endsWith("Z") && !utcStr.includes("+")) {
            utcStr = utcStr + "Z";
        }
        diff = Math.floor((Date.now() - new Date(utcStr).getTime()) / 1000);
    } else {
        return "";
    }
    if (isNaN(diff) || diff < 0) diff = 0;
    if (diff < 5)     return "just now";
    if (diff < 60)    return diff + "s ago";
    if (diff < 3600)  return Math.floor(diff / 60) + "m ago";
    if (diff < 86400) return Math.floor(diff / 3600) + "h ago";
    return Math.floor(diff / 86400) + "d ago";
}

function buildRecentHTML(items) {
    if (!items || items.length === 0) {
        return '<div class="recent-empty">No scans yet. Be the first to scan a URL above.</div>';
    }
    var html = "";
    for (var i = 0; i < items.length; i++) {
        var item = items[i];
        var v = item.verdict || "";
        var dotClass, rvClass, label;

        if (v === "PHISHING") {
            dotClass = "recent-dot-phish"; rvClass = "rv-phish"; label = "PHISHING";
        } else if (v === "SUSPICIOUS") {
            dotClass = "recent-dot-susp"; rvClass = "rv-susp"; label = "SUSPICIOUS";
        } else if (v === "LEGITIMATE") {
            dotClass = "recent-dot-safe"; rvClass = "rv-safe"; label = "SAFE";
        } else {
            dotClass = "recent-dot-err"; rvClass = "rv-err"; label = v || "ERROR";
        }

        var t = item.time || item.timestamp || item.created_at || item.scanned_at || "";

        html += '<div class="recent-scan-item">' +
            '<div class="recent-dot ' + dotClass + '"></div>' +
            '<div class="recent-url">' + escapeHtml(item.url || "") + '</div>' +
            '<div class="recent-verdict ' + rvClass + '">' + label + '</div>' +
            '<div class="recent-time">' + timeAgo(t) + '</div>' +
            '</div>';
    }
    return html;
}

function renderHistoryFromData(items) {
    var list = document.getElementById("recentScansList");
    if (list) list.innerHTML = buildRecentHTML(items);
}

function renderHistoryFromLocal() {
    renderHistoryFromData(getLocalHistory());
}

// ══════════════════════════════════════════════════════════════
// ENGINE PILLS
// ══════════════════════════════════════════════════════════════
function buildEngineHTML(enginesUsed) {
    if (typeof enginesUsed !== "number" || enginesUsed <= 0) return "";
    var engineNames = ["Engine 1: URL Analysis", "Engine 2: Content Analysis", "Engine 3: Visual Analysis"];
    var html = "";
    for (var i = 0; i < 3; i++) {
        var used = i < enginesUsed;
        var pillClass = used ? "engine-pill-used" : "engine-pill-skipped";
        var dotClass = used ? "epd-active" : "epd-skipped";
        html += '<span class="engine-pill ' + pillClass + '">' +
                    '<span class="engine-pill-dot ' + dotClass + '"></span>' +
                    engineNames[i] +
                '</span>';
    }
    return html;
}

// ──── HELPERS ────
function hideAllResults() {
    if (resultPhishing)   resultPhishing.classList.remove("active");
    if (resultLegitimate) resultLegitimate.classList.remove("active");
    if (resultError)      resultError.classList.remove("active");
    if (resultSuspicious) resultSuspicious.classList.remove("active");
    if (resultUnknown)    resultUnknown.classList.remove("active");
}

function setLoading(loading) {
    if (loading) {
        scanBtn.classList.add("loading");
        scanBtn.disabled = true;
        urlInput.disabled = true;
    } else {
        scanBtn.classList.remove("loading");
        scanBtn.disabled = false;
        urlInput.disabled = false;
    }
}

function scrollToResult() {
    setTimeout(function() {
        var resultContainer = document.getElementById("resultContainer");
        if (resultContainer) {
            var rect = resultContainer.getBoundingClientRect();
            var headerHeight = 70;
            var targetY = window.pageYOffset + rect.top - headerHeight - 200;
            if (targetY < 0) targetY = 0;
            window.scrollTo({ top: targetY, behavior: "smooth" });
        }
    }, 100);
}

function showPhishing(url, confidence, enginesUsed) {
    hideAllResults();
    document.getElementById("phishURL").textContent = url;
    var confEl = document.getElementById("phishConfidence");
    if (confEl) confEl.innerHTML = "";
    var engEl = document.getElementById("phishEngines");
    if (engEl) engEl.innerHTML = buildEngineHTML(enginesUsed);
    resultPhishing.classList.add("active");
    scrollToResult();
    addToHistory(url, "PHISHING");
    loadStatsFromBackend();
}

function showSuspicious(url, confidence, enginesUsed) {
    hideAllResults();
    if (!resultSuspicious) { showPhishing(url, confidence, enginesUsed); return; }
    document.getElementById("suspURL").textContent = url;
    var confEl = document.getElementById("suspConfidence");
    if (confEl) confEl.innerHTML = "";
    var engEl = document.getElementById("suspEngines");
    if (engEl) engEl.innerHTML = buildEngineHTML(enginesUsed);
    resultSuspicious.classList.add("active");
    scrollToResult();
    addToHistory(url, "SUSPICIOUS");
    loadStatsFromBackend();
}

function showLegitimate(url, confidence, enginesUsed) {
    hideAllResults();
    document.getElementById("legitURL").textContent = url;
    var confEl = document.getElementById("legitConfidence");
    if (confEl) confEl.innerHTML = "";
    var engEl = document.getElementById("legitEngines");
    if (engEl) engEl.innerHTML = buildEngineHTML(enginesUsed);
    resultLegitimate.classList.add("active");
    scrollToResult();
    addToHistory(url, "LEGITIMATE");
    loadStatsFromBackend();
}

function showUnknown(url) {
    hideAllResults();
    if (!resultUnknown) { showError(url, "Could not determine the safety of this URL."); return; }
    document.getElementById("unknownURL").textContent = url || "";
    resultUnknown.classList.add("active");
    scrollToResult();
    addToHistory(url, "UNKNOWN");
    loadStatsFromBackend();
}

function showError(url, message) {
    hideAllResults();
    document.getElementById("errorURL").textContent = url || "";
    var errorMsg = document.getElementById("errorMsg");
    if (errorMsg && message) { errorMsg.textContent = message; }
    resultError.classList.add("active");
    scrollToResult();
    if (url && url.length >= 4) {
        addToHistory(url, "ERROR");
        loadStatsFromBackend();
    }
}

function validateURL(url) {
    if (!url || url.trim() === "")    return { valid: false, message: "Please enter a URL to scan." };
    if (url.trim().length < 4)        return { valid: false, message: "URL is too short." };
    if (url.trim().length > 2048)     return { valid: false, message: "URL is too long." };
    return { valid: true, message: "" };
}

// ──── MAIN SCAN ────
async function scanURL() {
    var url = urlInput.value.trim().replace(/^["']+|["']+$/g, "");
    var check = validateURL(url);
    if (!check.valid) { showError(url, check.message); return; }

    if (API_URL === "YOUR_BACKEND_URL_HERE" || API_URL === "") { runDemoMode(url); return; }

    hideAllResults();
    setLoading(true);

    var controller = new AbortController();
    var timeoutId = setTimeout(function() { controller.abort(); }, 120000);

    try {
        var response = await fetch(API_URL + "/api/scan", {
            method: "POST",
            headers: { "Content-Type": "application/json", "Accept": "application/json" },
            body: JSON.stringify({ url: url }),
            signal: controller.signal
        });

        clearTimeout(timeoutId);
        if (!response.ok) throw new Error("Server error: " + response.status);
        var data = await response.json();
        var enginesUsed = typeof data.engines_used === "number" ? data.engines_used : undefined;

        if (data.verdict === "PHISHING") {
            showPhishing(url, null, enginesUsed);
        }
        else if (data.verdict === "SUSPICIOUS") {
            showSuspicious(url, null, enginesUsed);
        }
        else if (data.verdict === "LEGITIMATE") {
            showLegitimate(url, null, enginesUsed);
        }
        else if (data.verdict === "LINK DOES NOT EXIST") {
            showError(url, "The URL could not be reached. The website may be offline or the domain may not exist.");
        }
        else if (data.verdict === "UNKNOWN") {
            showUnknown(url);
        }
        else {
            showError(url, "Could not determine the safety of this URL.");
        }

    } catch (error) {
        clearTimeout(timeoutId);
        console.error("Scan error:", error);

        if (error.name === "AbortError") {
            showError(url, "Scan timed out. The server may be busy — please try again.");
        }
        else if (error.message.includes("Failed to fetch") || error.message.includes("NetworkError")) {
            showError(url, "Cannot connect to the scanning server. Please make sure the backend is running.");
        }
        else {
            showError(url, "An error occurred while scanning. Please try again.");
        }
    } finally {
        setLoading(false);
    }
}

// ──── DEMO MODE ────
function runDemoMode(url) {
    setLoading(true); hideAllResults();
    setTimeout(function() {
        setLoading(false);
        var urlLower = url.toLowerCase();
        var phishPatterns = ["g00gle","g0ogle","paypa1","paypai","faceb00k","micros0ft","app1e","amaz0n","arnazon","netfl1x","xn--"];
        var safeDomains   = ["google.com","facebook.com","amazon.com","microsoft.com","github.com","youtube.com","twitter.com","x.com","linkedin.com","instagram.com","apple.com","netflix.com","paypal.com","reddit.com","wikipedia.org"];
        var cleaned = urlLower.replace("https://","").replace("http://","").replace(/\/+$/,"");
        for (var i = 0; i < safeDomains.length; i++) {
            if (cleaned === safeDomains[i] || cleaned.startsWith(safeDomains[i]+"/")) { showLegitimate(url, null, 2); return; }
        }
        for (var j = 0; j < phishPatterns.length; j++) {
            if (urlLower.includes(phishPatterns[j])) { showPhishing(url, null, 1); return; }
        }
        for (var k = 0; k < url.length; k++) { if (url.charCodeAt(k) > 127) { showPhishing(url, null, 1); return; } }
        showLegitimate(url, null, 2);
    }, 1500);
}

// ──── SMOOTH SCROLL ────
document.querySelectorAll('a[href^="#"]').forEach(function(anchor) {
    anchor.addEventListener("click", function(e) {
        e.preventDefault();
        var target = document.querySelector(this.getAttribute("href"));
        if (target) target.scrollIntoView({ behavior: "smooth" });
    });
});

// ──── HEADER SCROLL ────
window.addEventListener("scroll", function() {
    var header = document.querySelector(".header");
    header.style.background = window.pageYOffset > 50
        ? "rgba(6, 6, 16, 0.97)"
        : "rgba(6, 6, 16, 0.75)";
});

// ──── PARTICLE CANVAS ────
(function() {
    var canvas = document.getElementById("particleCanvas");
    if (!canvas) return;
    var ctx = canvas.getContext("2d");
    var particles = [];
    var W, H;

    function resize() {
        W = canvas.width  = window.innerWidth;
        H = canvas.height = canvas.offsetHeight || window.innerHeight;
    }

    function Particle() {
        this.x  = Math.random() * W;
        this.y  = Math.random() * H;
        this.vx = (Math.random() - 0.5) * 0.4;
        this.vy = (Math.random() - 0.5) * 0.4;
        this.r  = Math.random() * 1.8 + 0.6;
        this.color = Math.random() > 0.5 ? "99,102,241" : "6,182,212";
    }

    function init() {
        particles = [];
        var count = Math.floor((W * H) / 14000);
        count = Math.min(Math.max(count, 40), 120);
        for (var i = 0; i < count; i++) particles.push(new Particle());
    }

    function draw() {
        ctx.clearRect(0, 0, W, H);

        for (var i = 0; i < particles.length; i++) {
            for (var j = i + 1; j < particles.length; j++) {
                var dx   = particles[i].x - particles[j].x;
                var dy   = particles[i].y - particles[j].y;
                var dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 130) {
                    ctx.beginPath();
                    ctx.strokeStyle = "rgba(99,102,241," + (0.15 * (1 - dist / 130)) + ")";
                    ctx.lineWidth   = 0.6;
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.stroke();
                }
            }
        }

        for (var k = 0; k < particles.length; k++) {
            var p = particles[k];
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fillStyle = "rgba(" + p.color + ",0.7)";
            ctx.fill();

            p.x += p.vx;
            p.y += p.vy;
            if (p.x < 0 || p.x > W) p.vx *= -1;
            if (p.y < 0 || p.y > H) p.vy *= -1;
        }

        requestAnimationFrame(draw);
    }

    window.addEventListener("resize", function() { resize(); init(); });
    resize(); init(); draw();
})();

// ──── FADE-IN ON SCROLL ────
var observer = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
        if (entry.isIntersecting) {
            entry.target.style.opacity = "1";
            entry.target.style.transform = "translateY(0)";
        }
    });
}, { threshold: 0.1, rootMargin: "0px 0px -50px 0px" });

document.addEventListener("DOMContentLoaded", function() {
    document.querySelectorAll(".step-card, .contact-card").forEach(function(card, i) {
        card.style.opacity    = "0";
        card.style.transform  = "translateY(30px)";
        card.style.transition = "opacity 0.6s ease " + (i * 0.1) + "s, transform 0.6s ease " + (i * 0.1) + "s";
        observer.observe(card);
    });
    setTimeout(function() { if(urlInput) urlInput.focus(); }, 500);

    // Load stats and recent scans from backend
    loadStatsFromBackend();
    loadRecentFromBackend();
});