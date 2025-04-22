(function() {

  window.onload = function (event) {
 
      fetch(window.location.href).then(response => {
        console.log(window.location.href);
          const reader = response.body.getReader();
          const decoder = new TextDecoder();
          const encoder = new TextEncoder();
          const stream = new ReadableStream({
              start(controller) {
                  function read() {
                      reader.read().then(({ done, value }) => {
                          if (done) {
                              controller.close();
                              return;
                          }
                          // Modify the response data here
                          let text = decoder.decode(value, { stream: true });
                          text = text.replace(/"fgfgfgfg"/i, 'bar');
                          console.log("text mod -->"+text); // Process chunk
                          var res= encoder.encode(text);
               
                          controller.enqueue(res);
                          return  read();
                      });
                  }
                 return read();
              }
          });
          return new Response(stream, { headers: response.headers });
          
      })

  };

 
})();
