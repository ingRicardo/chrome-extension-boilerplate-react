

let jsonval=null

fetch("https://jsonplaceholder.typicode.com/todos/1")
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
            console.log("fetch text mod -->",text); // Process chunk
            jsonval=text;
            var res= encoder.encode(text);
            //jsonval= res;
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


const targets = {urls: ['https://jsonplaceholder.typicode.com/','https://jsonplaceholder.typicode.com/todos/1'], types: ['xmlhttprequest']};


chrome.webRequest.onBeforeRequest.addListener(
   function myListener(details) {

    //const targetUrl = "https://jsonplaceholder.typicode.com/";
    //if (details.url.includes(targetUrl)) {
      console.log("details ==> ", details);
    //  console.log("Request URL ::::::::::::::::::::::::: " + details.url);
      try {
        const response = jsonval; // fetch(details.url);
        let data =  JSON.parse(response); //response.json();
        console.log("onBeforeRequest Response JSON:", data);
        // Modify the JSON data here
        data.message = "JSON data overridden by the extension!";
        data.newField = "This is added by the extension.";
       // delete data.oldField;

        // Convert the modified data back to a JSON string
        const modifiedBody = JSON.stringify(data);
        const encoder = new TextEncoder();
        const encodedBody = encoder.encode(modifiedBody);

        // Create a new ReadableStream with the modified body
        const readableStream = new ReadableStream({
          start(controller) {
            controller.enqueue(encodedBody);
            controller.close();
          },
        });
        console.log("onBeforeRequest Modified JSON: ", modifiedBody);
        console.log("onBeforeRequest readableStream: ", readableStream);
        return {};
        // Return a response with the modified body
      /*  return {
          responseHeaders: details.responseHeaders,
          body: readableStream,
        };*/
      } catch (error) {
        console.error("Error overriding JSON:", error);
      }
   // }




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
  //      console.log("onCompleted Intercepting request:", details.url);

        const response = await fetch(details.url);
        let responseBody = await response.json();

        // --- Your JSON modification logic here ---
        // Example: Add a new field
        responseBody.modifiedByExtension = true;

        // Example: Modify an existing field
      /*  if (responseBody[0].model) {
          responseBody[0].model = "Modified Value by Extension";
          responseBody[0].make = "MERCEDES BENZ";
        }
        */
    //    console.log("onCompleted Modified JSON:", responseBody);
      //  chrome.tabs.create({ url: 'data:application/json,' + encodeURIComponent( JSON.stringify(responseBody, null, 2)  ) });

      } catch (error) {
        console.error("Error processing JSON:", error);
      }
      count++;
    
    //  console.log("async call :" + count);
    }

    // IMPORTANT: Remove the listener when done
    chrome.webRequest.onCompleted.removeListener(myListener);
  },
  { urls: ["<all_urls>"] },
  ["responseHeaders"]
);


