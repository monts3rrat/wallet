// public\background.js

chrome.runtime.onInstalled.addListener(() => {
  console.log('ETH Wallet extension installed');
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'GET_STORAGE') {
    chrome.storage.local.get(request.keys, (result) => {
      if (chrome.runtime.lastError) {
        sendResponse({ error: chrome.runtime.lastError.message });
      } else {
        sendResponse(result);
      }
    });
    return true;
  }

  if (request.type === 'SET_STORAGE') {
    chrome.storage.local.set(request.data, () => {
      if (chrome.runtime.lastError) {
        sendResponse({ error: chrome.runtime.lastError.message });
      } else {
        sendResponse({ success: true });
      }
    });
    return true;
  }

  if (request.type === 'FETCH_REQUEST') {
    fetch(request.url, {
      method: request.method || 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...request.headers
      },
      body: request.body ? JSON.stringify(request.body) : undefined
    })
    .then(response => response.json())
    .then(data => sendResponse({ success: true, data }))
    .catch(error => sendResponse({ success: false, error: error.message }));
    
    return true;
  }
});

// Обработка ошибок
chrome.runtime.onStartup.addListener(() => {
  console.log('ETH Wallet extension started');
});
