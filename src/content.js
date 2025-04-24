(function() {
  let jsonval = "blank";
    console.log("Content script loaded!",window.location.href);
    if (window.location.href.includes("https://jsonplaceholder.typicode.com/")) {
      let url = 'https://jsonplaceholder.typicode.com/todos/1';       
      async function getData(findUrl) {
        const url = findUrl;
        try {
          const response1 = await fetch(url);
          if (!response1.ok) {
            throw new Error(`Response status: ${response1.status}`);
          }
          const json1 = await response1.json();
          json1.id = 69; // Modify the id property
          json1['title'] = 'Riky title'; // Modify the name property
          json1.completed = true; // Modify the completed property
          console.log(json1);
          jsonval = JSON.stringify(json1); // Convert to string


        } catch (error) {
          console.error(error.message);
        }
      }
      getData(url);
    }

  
  document.addEventListener('DOMContentLoaded', () => {
    const observer = new MutationObserver((mutationsList, observer) => {
      for (const mutation of mutationsList) {
        if (mutation.type === 'childList' || mutation.type === 'characterData') {
          // Your mutation handling logic
          const targetElement = document.getElementById('result'); // Replace with the actual ID of the element you want to modify
          if (targetElement && targetElement.textContent.includes('{}')) {
            
            targetElement.textContent = jsonval;
          }
        }
      }
    });
  
    // Make sure the target node exists before observing
    const targetNode = document.body; // Or your specific target element
    if (targetNode) {
      observer.observe(targetNode, { subtree: true, childList: true, characterData: true });
      console.log("Content script injected and observing DOM.");
    } else {
      console.error("Target node not found when trying to observe.");
    }
  });



  })();
  
