// Store tab roles and their order
let tabRoles = new Map();
const roleOrder = [1, 2, 3];

// Listen for installation
chrome.runtime.onInstalled.addListener(() => {
  console.log('Workflow extension installed');
});

// Listen for messages from content script or popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log("Received message:", request, "from:", sender);

  switch (request.type) {
    case 'assignRole':
      // Handle popup messages differently than content script messages
      if (!sender.tab) {
        // Message from popup - need to query active tab
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          const activeTab = tabs[0];
          if (activeTab) {
            tabRoles.set(activeTab.id, request.role);
            console.log(`Assigned role ${request.role} to tab ${activeTab.id}`);
            sendResponse({ success: true, role: request.role });
          } else {
            console.error("No active tab found");
            sendResponse({ success: false, error: "No active tab found" });
          }
        });
        return true; // Keep async channel open
      } else {
        // Message from content script
        try {
          tabRoles.set(sender.tab.id, request.role);
          console.log(`Assigned role ${request.role} to tab ${sender.tab.id}`);
          sendResponse({ success: true });
        } catch (error) {
          console.error("Error assigning role:", error);
          sendResponse({ success: false, error: error.message });
        }
      }
      break;

    case 'getTabs':
      chrome.tabs.query({}, (tabs) => {
        const tabList = tabs.map(tab => ({
          id: tab.id,
          url: tab.url,
          role: tabRoles.get(tab.id) || null
        }));
        console.log("Returning tab list:", tabList);
        sendResponse({ success: true, tabs: tabList });
      });
      return true; // Keep async channel open

    case 'sendToNext':
      try {
        const currentTabId = sender.tab ? sender.tab.id : 
          (await chrome.tabs.query({ active: true, currentWindow: true }))[0]?.id;

        if (!currentTabId) {
          throw new Error('No active tab found');
        }

        const currentRole = tabRoles.get(currentTabId);
        if (!currentRole) {
          throw new Error('Current tab has no assigned role');
        }

        const nextRole = roleOrder[(roleOrder.indexOf(currentRole) + 1) % roleOrder.length];
        const targetTabs = Array.from(tabRoles.entries())
          .filter(([_, role]) => role === nextRole)
          .map(([tabId]) => tabId);

        if (targetTabs.length === 0) {
          throw new Error('No tab found with next role');
        }

        console.log(`Sending message from role ${currentRole} to role ${nextRole}`);

        // Send message to all tabs with the next role
        for (const tabId of targetTabs) {
          try {
            await chrome.tabs.sendMessage(tabId, {
              type: 'incomingMessage',
              content: request.content,
              fromRole: currentRole
            });
            console.log(`Message sent to tab ${tabId}`);
          } catch (error) {
            console.error(`Failed to send message to tab ${tabId}:`, error);
          }
        }

        sendResponse({ success: true });
      } catch (error) {
        console.error("Error sending message:", error);
        sendResponse({ success: false, error: error.message });
      }
      break;

    default:
      console.warn("Unknown message type:", request.type);
      sendResponse({ success: false, error: 'Unknown message type' });
  }
  return true; // Keep the message channel open for async response
});

// Clean up when tabs are closed
chrome.tabs.onRemoved.addListener((tabId) => {
  console.log(`Tab ${tabId} closed, removing role`);
  tabRoles.delete(tabId);
}); 