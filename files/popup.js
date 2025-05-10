// === popup.js ===
// Handles sending the message to all open tabs via background.js
document.getElementById("send").addEventListener("click", () => {
  const message = document.getElementById("message").value.trim();
  if (message) {
    chrome.runtime.sendMessage({ type: "broadcastMessage", text: message }, (response) => {
      if (response?.success) {
        alert("Message broadcasted to all open tabs!");
      } else {
        console.error("Failed to broadcast the message.");
      }
    });
  } else {
    alert("Please enter a message first.");
  }
});