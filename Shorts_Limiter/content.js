let shortsWatched = 0;
let shortLimit = 5;
let lastVideoId = null;
let lastUrl = location.href;
let waitingForFinalShort = false;

// ------------------ Safe storage helpers ------------------
function safeSetStorage(obj) {
  try {
    if (chrome?.storage?.local) {
      chrome.storage.local.set(obj);
    }
  } catch (err) {
    if (err.message?.includes("Extension context invalidated")) {
      console.warn("[YT Shorts Limiter] Context invalidated, ignoring set().");
      return;
    }
    console.error("[YT Shorts Limiter] Storage error:", err);
  }
}

function safeGetStorage(keys, callback) {
  try {
    if (chrome?.storage?.local) {
      chrome.storage.local.get(keys, callback);
    }
  } catch (err) {
    if (err.message?.includes("Extension context invalidated")) {
      console.warn("[YT Shorts Limiter] Context invalidated, ignoring get().");
      callback({});
      return;
    }
    console.error("[YT Shorts Limiter] Storage get error:", err);
    callback({});
  }
}

// ------------------ Load settings ------------------
safeGetStorage(["shortLimit", "shortsWatched"], (data) => {
  shortLimit = data.shortLimit || 5;
  shortsWatched = data.shortsWatched || 0;
  console.log("[YT Shorts Limiter] Settings loaded:", { shortLimit, shortsWatched });
});

// ------------------ Listen for settings changes ------------------
if (chrome?.storage?.onChanged) {
  try {
    chrome.storage.onChanged.addListener((changes) => {
      if (changes.shortLimit) {
        shortLimit = changes.shortLimit.newValue;
        console.log("[YT Shorts Limiter] Limit updated:", shortLimit);
      }
    });
  } catch (err) {
    console.warn("[YT Shorts Limiter] Could not attach onChanged listener:", err);
  }
}

// ------------------ Shorts detection ------------------
function getCurrentVideoId() {
  if (!location.pathname.startsWith("/shorts/")) return null;
  return location.pathname.split("/shorts/")[1]?.split("?")[0] || null;
}

function handleShortsChange() {
  const videoId = getCurrentVideoId();

  if (!videoId) {
    if (shortsWatched > 0) {
      console.log("[YT Shorts Limiter] Left Shorts, resetting counter.");
      shortsWatched = 0;
      waitingForFinalShort = false;
      safeSetStorage({ shortsWatched: 0 });
    }
    lastVideoId = null;
    return;
  }

  if (videoId !== lastVideoId) {
    lastVideoId = videoId;

    shortsWatched++;
    safeSetStorage({ shortsWatched });
    console.log(`[YT Shorts Limiter] New Short detected (${shortsWatched}/${shortLimit}).`);

    if (shortsWatched === shortLimit && !waitingForFinalShort) {
      console.log("[YT Shorts Limiter] Final Short reached. Waiting until it finishes...");
      waitingForFinalShort = true;

      const observer = new MutationObserver(() => {
        const video = document.querySelector("video");
        if (video) {
          video.addEventListener("ended", () => {
            console.log("[YT Shorts Limiter] Limit reached. Redirecting to homepage...");
            shortsWatched = 0;
            waitingForFinalShort = false;
            safeSetStorage({ shortsWatched: 0 });
            window.location.href = "https://www.youtube.com/";
          }, { once: true });
          observer.disconnect();
        }
      });

      observer.observe(document.body, { childList: true, subtree: true });

    } else if (shortsWatched > shortLimit) {
      console.log("[YT Shorts Limiter] Limit exceeded. Redirecting immediately...");
      shortsWatched = 0;
      waitingForFinalShort = false;
      safeSetStorage({ shortsWatched: 0 });
      window.location.href = "https://www.youtube.com/";
    }
  }
}

// ------------------ Lightweight URL change listener ------------------
// YouTube uses a single-page app, so URL changes without reloads
function checkUrlChange() {
  if (location.href !== lastUrl) {
    lastUrl = location.href;
    handleShortsChange();
  }
}

// Poll for URL changes (every 500ms is enough)
setInterval(() => {
  try {
    checkUrlChange();
  } catch (err) {
    if (err.message?.includes("Extension context invalidated")) {
      console.warn("[YT Shorts Limiter] Context invalidated during URL check, ignoring.");
    } else {
      console.error("[YT Shorts Limiter] Unexpected error in URL check:", err);
    }
  }
}, 500);

// Run once initially
try {
  handleShortsChange();
} catch (err) {
  console.error("[YT Shorts Limiter] Error on initial run:", err);
}