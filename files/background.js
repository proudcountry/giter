// background.js - Background service worker for the extension

let tabRoles = {}; // Store roles (numbers) assigned to each tab
let workflowState = {}; // Store the current workflow state (Gist data)

// Listen for messages from the popup or content scripts
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === "assignRole") {
    // Assign a role to the tab
    tabRoles[sender.tab.id] = msg.role;
    sendResponse({ success: true, role: msg.role });
  } else if (msg.type === "getRole") {
    // Get the role of a specific tab
    const role = tabRoles[sender.tab.id] || null;
    sendResponse({ success: true, role });
  } else if (msg.type === "nextStep") {
    // Handle the next step in the workflow
    handleNextStep(msg.gistId, msg.ghToken, sendResponse);
    return true; // Keep the message channel open for async response
  }
});

// Handle the workflow progression
async function handleNextStep(gistId, ghToken, sendResponse) {
  try {
    // Fetch the current workflow state from the Gist
    const gistResponse = await fetch(`https://api.github.com/gists/${gistId}`, {
      headers: { Authorization: `token ${ghToken}` }
    });
    const gistData = await gistResponse.json();
    workflowState = JSON.parse(gistData.files["workflow.json"].content);

    // Determine the next step
    const currentStep = workflowState.currentStep || 1;
    const nextStep = (currentStep % 3) + 1; // Cycle through 1 → 2 → 3 → 1
    workflowState.currentStep = nextStep;

    // Update the Gist with the new state
    await fetch(`https://api.github.com/gists/${gistId}`, {
      method: "PATCH",
      headers: {
        Authorization: `token ${ghToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        files: {
          "workflow.json": {
            content: JSON.stringify(workflowState, null, 2)
          }
        }
      })
    });

    // Notify the tab with the corresponding role
    const tabId = Object.keys(tabRoles).find(
      (id) => tabRoles[id] === nextStep
    );
    if (tabId) {
      chrome.tabs.sendMessage(Number(tabId), {
        type: "performAction",
        step: nextStep,
        workflowState
      });
    }

    sendResponse({ success: true, nextStep });
  } catch (error) {
    console.error("Error handling workflow step:", error);
    sendResponse({ success: false, error: error.message });
  }
}