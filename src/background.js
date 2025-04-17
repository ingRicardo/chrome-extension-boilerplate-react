

chrome.webRequest.onBeforeRequest.addListener(
  function(details) {
    // Optional: Filter requests based on URL or other criteria
    // if (details.url.includes("your-specific-api-endpoint")) {
    //   console.log("Intercepting request:", details);
    // }
    return {}; // Continue the request
  },
  { urls: ["<all_urls>"] },
  ["requestBody"] // If you need to modify request body, include this
);

chrome.webRequest.onHeadersReceived.addListener(
  function(details) {
    // Check if the Content-Type indicates a JSON response
    const contentTypeHeader = details.responseHeaders.find(header => header.name.toLowerCase() === 'content-type');
    if (contentTypeHeader && contentTypeHeader.value.toLowerCase().includes('application/json')) {
      // Initiate the process of reading the response body
      return { responseHeaders: details.responseHeaders };
    }
    return {};
  },
  { urls: ["<all_urls>"] },
  ["responseHeaders"]
);

chrome.webRequest.onCompleted.addListener(
  async function(details) {
    const contentTypeHeader = details.responseHeaders?.find(header => header.name.toLowerCase() === 'content-type');
    if (contentTypeHeader && contentTypeHeader.value.toLowerCase().includes('application/json')) {
      try {
        const response = await fetch(details.url);
        let responseBody = await response.json();

        // --- Your JSON modification logic here ---
        console.log("Original JSON:", responseBody);

        // Example: Add a new field
        responseBody.modifiedByExtension = true;

        // Example: Modify an existing field
        if (responseBody.someKey) {
          responseBody.someKey = "Modified Value by Extension";
        }

        console.log("Modified JSON:", responseBody);
        const modifiedBody = JSON.stringify(responseBody);

        // Use declarativeNetRequest to redirect the original request to a data URL
        chrome.declarativeNetRequest.updateRules({
          removeRuleIds: [details.requestId], // Clean up previous rule if any
          addRules: [{
            id: details.requestId,
            priority: 1,
            action: {
              type: "modifyHeaders",
              responseHeaders: [
                { name: "Content-Type", value: "application/json" },
                { name: "Content-Length", value: String(modifiedBody.length) }
              ]
            },
            condition: {
              requestIds: [details.requestId]
            }
          },
          {
            id: details.requestId + 1, // Add a second rule for redirecting
            priority: 2,
            action: {
              type: "redirect",
              redirect: {
                url: 'data:application/json;charset=utf-8,' + encodeURIComponent(modifiedBody)
              }
            },
            condition: {
              requestIds: [details.requestId]
            }
          }]
        });

      } catch (error) {
        console.error("Error processing JSON:", error);
      }
    }
  },
  { urls: ["<all_urls>"] },
  ["responseHeaders"]
);