import { getAbsoluteUrl,
    getMatchedDelayRule,
    applyDelay,
    getMatchedRequestRule,
    getCustomRequestBody,
    jsonifyValidJSONString,
    notifyRequestRuleApplied,
    shouldServeResponseWithoutRequest,
    isJSON,
    notifyOnBeforeRequest,
    getFunctionFromCode,
    isContentTypeJSON,
    notifyResponseRuleApplied


} from "./utils";


  // Example usage within an async function
  async function getData(url) {
    let request;
    try {
      const result = await fetch(url);
      //console.log("Data:", result);

      request = result.clone();
      console.log("cloning.....", request);
    
      const urlc = getAbsoluteUrl(url);
      const method = request.method;
      console.log("get urlc ==> ", urlc);
      console.log("get method ====> ",method);
      console.log("request body => ", request.body);


      const matchedDelayRulePair = getMatchedDelayRule({
        url: url,
        method: 'GET',
        type: "fetch",
        initiator: location.origin, // initiator=origin. Should now contain port and protocol
      });

      if (matchedDelayRulePair) {
        await applyDelay(matchedDelayRulePair.delay);
      }

      const originalRequestBody = await request.text();
               
      console.log("originalRequestBody ==> "+ originalRequestBody);

  
 

    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }
  


export const initFetchInterceptor = (debug) => {


    console.log("initFetchInterceptor ", debug );

    let url = 'https://jsonplaceholder.typicode.com/todos/1';
    //window.location.href
    getData(url);
    
 




    /*
    const _fetch = fetch;
    fetch = async (...args) => {
        const [resource, initOptions = {}] = args;
        const getOriginalResponse = () => _fetch(...args);
        console.log("getOriginalResponse "+ getOriginalResponse);
        try {
             
            
            let request;
            console.log("resource "+ resource);
            if (resource instanceof Request) {
              request = resource.clone();
              console.log("cloning..");
            } else {
              request = new Request(resource.toString(), initOptions);
             // console.log("new request ", request);
           //   console.log("initOptions ", initOptions);
            }

          //  const url = getAbsoluteUrl(request.url);
            const url = getAbsoluteUrl('https://jsonplaceholder.typicode.com/todos/1');
            const method = request.method;
            
        //    console.log("request body => "+ request.body);
       //     console.log("get url ==> ", url);
       //     console.log("get method ====> ",method);

      
            const matchedDelayRulePair = getMatchedDelayRule({
              url: url,
              method: method,
              type: "fetch",
              initiator: location.origin, // initiator=origin. Should now contain port and protocol
            });
      
            if (matchedDelayRulePair) {
              await applyDelay(matchedDelayRulePair.delay);
            }

                  // Request body can be sent only for request methods other than GET and HEAD.
            const canRequestBodyBeSent = !["GET", "HEAD"].includes(method);
       //     console.log("canRequestBodyBeSent ", canRequestBodyBeSent);
            const requestRule =
                canRequestBodyBeSent &&
                getMatchedRequestRule({
                url: url,
                method: method,
                type: "fetch",
                initiator: location.origin, // initiator=origin. Should now contain port and protocol
                });
           //     console.log("requestRule ============> ", requestRule);
            if (!requestRule) {
                //console.log("request => "+ request.body);



                const originalRequestBody = await request.text();
               
           //     console.log("originalRequestBody ==> "+ originalRequestBody);

                const requestBody =
                    getCustomRequestBody(requestRule, {
                    method: request.method,
                    url,
                    body: originalRequestBody,
                    bodyAsJson: jsonifyValidJSONString(originalRequestBody, true),
                    }) || {};
        
                console.log("///////// requestBody ==> ", requestBody);

                request = new Request(request.url, {
                    method,
                    body: requestBody,
                    headers: request.headers,
                    referrer: request.referrer,
                    referrerPolicy: request.referrerPolicy,
                    mode: request.mode,
                    credentials: request.credentials,
                    cache: request.cache,
                    redirect: request.redirect,
                    integrity: request.integrity,
                });
        
             //   console.log("///////// new request ---> ",request);

                notifyRequestRuleApplied({
                    ruleDetails: requestRule,
                    requestDetails: {
                    url: url,
                    method: request.method,
                    type: "fetch",
                    timeStamp: Date.now(),
                    },
                });
                }

            let requestData;
            if (canRequestBodyBeSent) {
                requestData = jsonifyValidJSONString(await request.clone().text()); // cloning because the request will be used to make API call
            }

            const responseRule = getMatchedResponseRule({
                url,
                requestData,
                method,
              });
        
              let responseHeaders;
              let fetchedResponse;
        
              
              if (responseRule && shouldServeResponseWithoutRequest(responseRule)) {
                const contentType = isJSON(responseRule.pairs[0].response.value) ? "application/json" : "text/plain";
                responseHeaders = new Headers({ "content-type": contentType });
              } else {
                try {
                  const headersObject = {};
                  request?.headers?.forEach((value, key) => {
                    headersObject[key] = value;
                  });
                  await notifyOnBeforeRequest({
                    url,
                    method,
                    type: "xmlhttprequest",
                    initiator: location.origin,
                    requestHeaders: headersObject,
                  });
        
                  if (requestRule) {
                    // use modified request to fetch response
                    fetchedResponse = await _fetch(request);
                  } else {
                    fetchedResponse = await getOriginalResponse();

            //        console.log("  fetchedResponse ----------->   ", fetchedResponse);
                  }
        


                  if (!responseRule) {
                    return fetchedResponse;
                  }
        
                  responseHeaders = fetchedResponse?.headers;
                } catch (error) {
                  if (!responseRule) {
                    return Promise.reject(error);
                  }
                }
              }

    
            debug &&
              console.log("RQ", "Inside the fetch block for url", {
                url,
                resource,
                initOptions,
                fetchedResponse,
              });

            let customResponse;
            const responseModification = responseRule.pairs[0].response;

            if (responseModification.type === "code") {
                const requestHeaders =
                  request.headers &&
                  Array.from(request.headers).reduce((obj, [key, val]) => {
                    obj[key] = val;
                    return obj;
                  }, {});
        
                let evaluatorArgs = {
                  method,
                  url,
                  requestHeaders,
                  requestData,
                };

            if (fetchedResponse) {
                const fetchedResponseData = await fetchedResponse.text();
                const responseType = fetchedResponse.headers.get("content-type");
                const fetchedResponseDataAsJson = jsonifyValidJSONString(fetchedResponseData, true);
        
                evaluatorArgs = {
                    ...evaluatorArgs,
                    responseType,
                    response: fetchedResponseData,
                    responseJSON: fetchedResponseDataAsJson,
                };
            }
                
            customResponse = getFunctionFromCode(responseModification.value, "response")(evaluatorArgs);

            if (typeof customResponse === "undefined") {
            return fetchedResponse;
            }

            // evaluator might return us Object but response.value is string
            // So make the response consistent by converting to JSON String and then create the Response object
            if (isPromise(customResponse)) {
            customResponse = await customResponse;
            }

            if (typeof customResponse === "object" && isContentTypeJSON(evaluatorArgs?.responseType)) {
            customResponse = JSON.stringify(customResponse);
            }
        } else {
            customResponse = responseModification.value;
        }

        const requestDetails = {
            url,
            method,
            type: "fetch",
            timeStamp: Date.now(),
          };
    
          notifyResponseRuleApplied({
            ruleDetails: responseRule,
            requestDetails,
          });
    

        // For network failures, fetchedResponse is undefined but we still return customResponse with status=200
        const finalStatusCode = parseInt(responseModification.statusCode || fetchedResponse?.status) || 200;
        const requiresNullResponseBody = [204, 205, 304].includes(finalStatusCode);

        return new Response(requiresNullResponseBody ? null : new Blob([customResponse]), {
            status: finalStatusCode,
            statusText: responseModification.statusText || fetchedResponse?.statusText,
            headers: responseHeaders,
        });


        



        } catch (err) {
            debug && console.log("[RQ.fetch] Error in fetch", err);
            return await getOriginalResponse();
        } 
    }; */


};

