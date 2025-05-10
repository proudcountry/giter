// content.js - Content script to handle actions within the webpage

// Listen for messages from the background script
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === "performAction") {
    // Perform the action for the current step
    const { step, workflowState } = msg;
    handleAction(step, workflowState);
    sendResponse({ success: true });
  }
});

// Perform the action based on the step
function handleAction(step, workflowState) {
  const inputField = findChatInput();
  if (!inputField) {
    console.warn("🛑 Chat input not found on this page.");
    return;
  }

  let message = "";
  if (step === 1) {
    message = `Planning: ${workflowState.plan}`;
  } else if (step === 2) {
    message = `Coding: ${workflowState.code}`;
  } else if (step === 3) {
    message = `Reviewing: ${workflowState.review}`;
  }

  injectAndSend(inputField, message);
}

// Helper to find chat input fields
function findChatInput() {
  return (
    document.querySelector('div[role="textbox"][contenteditable="true"]') ||
    document.querySelector("textarea") ||
    document.querySelector('input[type="text"]')
  );
}

// Inject a message and simulate pressing Enter
function injectAndSend(input, text) {
  if (input.tagName === "TEXTAREA" || input.tagName === "INPUT") {
    input.value = text;
    input.dispatchEvent(new Event("input", { bubbles: true }));
  } else {
    input.focus();
    document.execCommand("selectAll", false, null);
    document.execCommand("insertText", false, text);
  }

  const enterEvent = new KeyboardEvent("keydown", {
    key: "Enter",
    code: "Enter",
    keyCode: 13,
    which: 13,
    bubbles: true,
    cancelable: true
  });
  input.dispatchEvent(enterEvent);
}