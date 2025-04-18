

chrome.webRequest.onBeforeRequest.addListener(
  function (details) {
    // Optional: Filter requests based on URL or other criteria
    //   if (details.url.includes("https://api.github.com/users/hadley/orgs")) {
    //  console.log("Intercepting request:", details.url);
    //    }
    return {}; // Continue the request
  },
  { urls: ["<all_urls>"] },
  ["requestBody"] // If you need to modify request body, include this
);

chrome.webRequest.onHeadersReceived.addListener(
  function (details) {
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

var count = 0;
chrome.webRequest.onCompleted.addListener(
  async function myListener(details) {
    const contentTypeHeader = details.responseHeaders?.find(header => header.name.toLowerCase() === 'content-type');
    if (contentTypeHeader && contentTypeHeader.value.toLowerCase().includes('application/json')) {
      try {
        console.log("Intercepting request:", details.url);

        fetch(details.url)
          .then((response) => response.json())
          .then((data) => {
            console.log("Original JSON:", data);
          })
          .catch(console.error);

        const response = await fetch(details.url);
        let responseBody = await response.json();

        // --- Your JSON modification logic here ---
        // Example: Add a new field
        responseBody.modifiedByExtension = true;

        // Example: Modify an existing field
        if (responseBody[0].model) {
          responseBody[0].model = "Modified Value by Extension";
          responseBody[0].make = "MERCEDES BENZ";
        }

        console.log("Modified JSON:", responseBody);
        

      } catch (error) {
        console.error("Error processing JSON:", error);
      }
      count++;
   
      console.log("async call :" + count);
    }

    // IMPORTANT: Remove the listener when done
    chrome.webRequest.onCompleted.removeListener(myListener);
  },
  { urls: ["<all_urls>"] },
  ["responseHeaders"]
);
