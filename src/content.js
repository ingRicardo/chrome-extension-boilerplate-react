(function() {
  console.log("Content script loaded"+ window.location.href);

  const originalXHR = window.XMLHttpRequest;
  window.XMLHttpRequest = function() {
    const xhr = new originalXHR();
    const originalSend = xhr.send;
    xhr.send = function(...args) {
      console.log("XHR send called with arguments:", args); // Log the arguments for debugging
      const onload = this.onload;

      this.onload = function() {
        if (this.responseURL.includes('https://conisoft.org/cakes/loadvehicles.php') && this.getResponseHeader('Content-Type')?.includes('application/json')) {
          try {
            const originalResponse = JSON.parse(this.responseText);
            const modifiedResponse = modifyMyJson(originalResponse);
            Object.defineProperty(this, 'response', { writable: true, value: JSON.stringify(modifiedResponse) });
            Object.defineProperty(this, 'responseText', { writable: true, value: JSON.stringify(modifiedResponse) });
          } catch (error) {
            console.error("Error modifying JSON in XHR:", error);
          }
        }
        if (onload) {
          onload.apply(this, arguments);
        }
      };
      originalSend.apply(this, args);
    };
    console.log("XHR created:", xhr); // Log the XHR object for debugging

    return xhr;
  };


  function modifyMyJson(json) {
    // Example modification: Adding a new property
    json.modifiedByExtension = true;
    json[0].make = "Modified by declarativeNetRequest!";
    console.log("Modifying JSON:", json);
    return json;
  }

const xhr = new XMLHttpRequest();
xhr.overrideMimeType("text/plain");
xhr.open('GET', window.location.href);
xhr.send();


})();
