(function() {

    console.log("Content script loaded!",window.location.href);

   fetch(window.location.href)
   .then(response => response.text())
   .then(html => {
     const parser = new DOMParser();
     const doc = parser.parseFromString(html, 'text/html');
     const bodyText = doc.body.textContent;
    
     if (bodyText.includes('https://jsonplaceholder.typicode.com/todos/1')) {
        //console.log(bodyText);
        let url = 'https://jsonplaceholder.typicode.com/todos/1'
        getData(url);
     }

   });
             
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
        } catch (error) {
          console.error(error.message);
        }
      }
  
  })();
  
  