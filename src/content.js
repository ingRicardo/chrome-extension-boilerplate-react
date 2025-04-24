(function() {
  
  let response_promise = fetch('https://jsonplaceholder.typicode.com/todos/1');

  document.addEventListener("DOMContentLoaded", function() {
    response_promise.then(response => response.json().then(responseJson => {
 
      const observer = new MutationObserver((mutationsList, observer) => {
        for (const mutation of mutationsList) {
          if (mutation.type === 'childList' || mutation.type === 'characterData') {
            // Your mutation handling logic
            const targetElement = document.getElementById('result'); // Replace with the actual ID of the element you want to modify
            if (targetElement && targetElement.textContent.includes('{}')) {
           
              responseJson.id = 69; // Modify the id property
              responseJson['title'] = 'Riky title'; // Modify the name property
              responseJson.completed = true; // Modify the completed property
             
              const jsonString = JSON.stringify(responseJson);
              console.log(responseJson);
              targetElement.textContent = jsonString;

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
    }))
  }, false)


  })();
  
