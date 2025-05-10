// Store tab roles and their order
let tabRoles = new Map();
const roleOrder = [1, 2, 3];

// Listen for installation
chrome.runtime.onInstalled.addListener(() => {
  console.log('Workflow extension installed');
});

// Listen for messages from content script or popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.type) {
    case 'assignRole':
      try {
        const tabId = sender.tab ? sender.tab.id : null;
        if (!tabId) {
          throw new Error('No active tab found');
        }

        tabRoles.set(tabId, request.role);
        sendResponse({ success: true });
      } catch (error) {
        sendResponse({ success: false, error: error.message });
      }
      break;

    case 'sendToNext':
      try {
        const currentTabId = sender.tab ? sender.tab.id : null;
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

        // Send message to all tabs with the next role
        targetTabs.forEach(tabId => {
          chrome.tabs.sendMessage(tabId, {
            type: 'incomingMessage',
            content: request.content,
            fromRole: currentRole
          });
        });

        sendResponse({ success: true });
      } catch (error) {
        sendResponse({ success: false, error: error.message });
      }
      break;

    default:
      sendResponse({ success: false, error: 'Unknown message type' });
  }
  return true; // Keep the message channel open for async response
});

// Clean up when tabs are closed
chrome.tabs.onRemoved.addListener((tabId) => {
  tabRoles.delete(tabId);
}); 