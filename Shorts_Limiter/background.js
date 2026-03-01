chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({ shortLimit: 5, shortsWatched: 0 });
});