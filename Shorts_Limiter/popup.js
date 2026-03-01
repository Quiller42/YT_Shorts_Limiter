document.addEventListener("DOMContentLoaded", () => {
  const limitInput = document.getElementById("limit");
  const saveBtn = document.getElementById("save");
  const status = document.getElementById("status");

  chrome.storage.local.get(["shortLimit"], (data) => {
    limitInput.value = data.shortLimit || 5;
  });

  saveBtn.addEventListener("click", () => {
    const limit = parseInt(limitInput.value);
    if (limit > 0) {
      chrome.storage.local.set({ shortLimit: limit }, () => {
        status.textContent = "Saved!";
        setTimeout(() => (status.textContent = ""), 1000);
      });
    }
  });
});