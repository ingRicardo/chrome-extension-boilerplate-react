(async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const originalUrl = urlParams.get('url');
  
    if (!originalUrl) {
      console.error("Original URL not provided.");
      return; // Exit if the URL is missing
    }
  
    try {
      const response = await fetch(originalUrl); // Fetch the original resource
      if (!response.ok) {
        console.error(`Failed to fetch original resource: ${response.status} ${response.statusText}`);
        return; // Exit on fetch error
      }
  
      const contentType = response.headers.get('Content-Type');
  
      if (contentType && contentType.includes('application/json')) {
        // *** MODIFICATION HAPPENS HERE ***
        // Create a NEW JSON response
        const modifiedJsonResponse = {
          "status": "success",
          "message": "Response overridden by extension!",
          "data": [
            { "id": 101, "name": "Modified Item A", "value": 110 },
            { "id": 102, "name": "Modified Item B", "value": 120 }
          ]
        };
  
        // Convert the modified JSON object to a string
        const modifiedJsonString = JSON.stringify(modifiedJsonResponse);
  
        // Create a new Response object with the modified JSON
        const modifiedResponse = new Response(modifiedJsonString, {
          status: 200, // OK status
          headers: { 'Content-Type': 'application/json' } // Set the correct content type
        });
  
        // Return the modified response
        return modifiedResponse;
      } else {
        // Handle other content types (important to prevent errors)
        console.warn(`Content type not handled: ${contentType}. Returning original.`);
        return response; // Return the original response if it's not JSON
      }
    } catch (error) {
      console.error("Error fetching and modifying response:", error);
      // Handle errors (e.g., show a message to the user, return a default response)
      return new Response(JSON.stringify({ error: "Failed to modify response" }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  })();
  