// Content script runs in the context of web pages
console.log('Content script loaded');

// Listen for messages from the extension
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log("Content script received message:", request);

  if (request.type === 'getData') {
    // Handle data collection from the page
    const pageData = {
      title: document.title,
      url: window.location.href
    };
    console.log("Sending page data:", pageData);
    sendResponse(pageData);
  }
  
  if (request.type === 'incomingMessage') {
    console.log(`Showing notification from Role ${request.fromRole}`);
    
    // Create and show notification
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 15px;
      background: #4CAF50;
      color: white;
      border-radius: 5px;
      z-index: 10000;
      box-shadow: 0 2px 5px rgba(0,0,0,0.2);
    `;
    notification.textContent = `Message from Role ${request.fromRole}: ${request.content}`;
    document.body.appendChild(notification);

    // Remove notification after 5 seconds
    setTimeout(() => {
      notification.remove();
      console.log("Notification removed");
    }, 5000);
  }
  return true;
}); 