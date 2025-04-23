(function() {

    console.log("Content script loaded!",window.location.href);
  
  
    const originalFetch = window.fetch;
      console.log("Original fetch function:", originalFetch);
      window.fetch = async (...args) => {
  
  
      console.log("Fetch called with arguments:", args);
  
      const response = await originalFetch(...args);
          console.log("originalFetch Original response:", response);
         // const clonedResponse = response.clone();
          response.text().then(text => {
              console.log("originalFetch Original Response:", text);
              if (text.includes("model")) { // Modify based on JSON structure
                  const modifiedText = text.replace("fgfgfgfg", "newValue");
                  console.log("originalFetch Modified Response:", modifiedText);
              }
          });
          return response;
      };
      window.fetch(window.location.href)
  
  
  
  
  
  })();
  
  