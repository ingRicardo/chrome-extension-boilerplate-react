(function() {

    console.log("Content script loaded!",window.location.href);
  
    const originalFetch = window.fetch;
      window.fetch = async (...args) => {
      const response = await originalFetch(...args);
          response.text().then(text => {
              if (text.includes("model")) { // Modify based on JSON structure
                  const modifiedText = text.replace("fgfgfgfg", "newValue");
                  console.log(" Modified Response:", modifiedText);
                     
              }
          });
          return response;
      };
      window.fetch(window.location.href)

             
             
  
  
  
  
  })();
  
  