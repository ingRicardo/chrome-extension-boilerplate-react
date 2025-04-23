
let jsonval=null

fetch("https://conisoft.org/cakes/loadvehicles.php")
  // Retrieve its body as ReadableStream
  .then((response) => response.body)
  .then((body) => {
    const reader = body.getReader();
    const decoder = new TextDecoder();
    const encoder = new TextEncoder();
    return new ReadableStream({
      start(controller) {
        return pump();

        function pump() {
          return reader.read().then(({ done, value }) => {
            // When no more data needs to be consumed, close the stream
            if (done) {
              controller.close();
              return;
            }
            // Modify the response data here
            let text = decoder.decode(value, { stream: true });
            text = text.replace(/"fgfgfgfg"/i, '"bar"');
            console.log("text mod -->"+text); // Process chunk
          //  jsonval=text;
            var res= encoder.encode(text);
            jsonval= res;
            // Enqueue the next data chunk into our target stream
            controller.enqueue(res);
            return pump();
          });
        }
      },
    });
  })
  .then((stream) => new Response(stream))
  .then((response) => response.blob())
  .catch((err) => console.error(err));


const targets = {urls: ['https://conisoft.org/cakes/loadvehicles.php'], types: ['xmlhttprequest']};

chrome.webRequest.onHeadersReceived.addListener(
  function (details) {
  // Check if the response content type is JSON
  const contentTypeHeader = details.responseHeaders.find(header => header.name.toLowerCase() === 'content-type');
    if (contentTypeHeader && contentTypeHeader.value.toLowerCase().includes('application/json')) {
    // Store the response headers for later use
    //  chrome.storage.local.set({ [`responseHeaders-${details.requestId}`]: details.responseHeaders });

      console.log("Storing headers for requestId:", details.requestId, "Headers:", details.responseHeaders);
     // console.log(">=== " + chrome.storage.local.get([`responseHeaders-${details.requestId}`]));
      return { responseHeaders: details.responseHeaders }; // Let the headers pass through
    }
  },
  { urls: ["<all_urls>"] },
  ["responseHeaders"]
);


chrome.webRequest.onBeforeRequest.addListener(
   function myListener(details) {

        try {
          const decoder = new TextDecoder();
          console.log("details ==> ", details);
 
          if(details.response){
            console.log("response body ==> ", details.response.body);
          }
          if(details.requestBody){
            var postedString = decodeURIComponent(String.fromCharCode.apply(null,
              new Uint8Array(details.requestBody.raw[0].bytes)));
            console.log("Request Body:", postedString);
          }
          const responseBody = decoder.decode( jsonval);
          const jsonBody = JSON.parse(responseBody);

          // Modify the JSON body here
        //  console.log("Original JSON:", jsonBody);
          jsonBody.modified = true;
          jsonBody[0].make = "This value has been changed!";

          const encoder = new TextEncoder();
          const modifiedResponseBody = encoder.encode(JSON.stringify(jsonBody));


          console.log("Modified JSON:", modifiedResponseBody);
      //    return { response: modifiedResponseBody };
        } catch (error) {
          console.error("Error parsing or modifying JSON:", error);
          // Optionally, you might want to return the original response here
        //  return { response: details.response.body };
        }
        
        return {};

  },
  targets,
  ["blocking","requestBody"]
);

var count = 0;
chrome.webRequest.onCompleted.addListener(
  async function myListener(details) {
    const contentTypeHeader = details.responseHeaders?.find(header => header.name.toLowerCase() === 'content-type');
    if (contentTypeHeader && contentTypeHeader.value.toLowerCase().includes('application/json')) {
      try {
        console.log("Intercepting request:", details.url);

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
        chrome.tabs.create({ url: 'data:application/json,' + encodeURIComponent( JSON.stringify(responseBody, null, 2)  ) });

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

