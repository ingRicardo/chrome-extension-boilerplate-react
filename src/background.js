chrome.runtime.onInstalled.addListener(() => {
    console.log('Service worker installed.');
  });
  
  chrome.webRequest.onBeforeRequest.addListener(
    (details) => {
      // Check if the request URL matches the target URL you want to modify
      const targetUrl = "https://conisoft.org/cakes/loadvehicles.php"; // Replace with the actual URL
      if (details.url.startsWith(targetUrl)) {
        console.log(`Intercepting request to: ${details.url}`);
        // Redirect the request to the modify_response.js script, passing the original URL
        return { redirectUrl: chrome.runtime.getURL("modify_response.js") + "?url=" + encodeURIComponent(details.url) };
      }
    },
    { urls: ["<all_urls>"] }, // Intercept all URLs (for testing, be more specific in production)
    ["blocking"] // Important:  This makes the listener synchronous, so we can modify the response
  );
  