
import { SourceKey, SourceOperator, UrlSource } from "./types";
import { matchSourceUrl } from "./ruleMatcher";

 import config from "./config";

export const getAllSupportedWebURLs = () => {
    const webURLsSet = new Set([config.WEB_URL, ...config.OTHER_WEB_URLS]);
    return [...webURLsSet];
  };
  
  export const isBlacklistedURL = (url: string): boolean => {
    const blacklistedSources: UrlSource[] = [


        ...getAllSupportedWebURLs().map((webUrl) => ({
          key: SourceKey.URL,
          operator: SourceOperator.CONTAINS,
          value: webUrl,
          filters: [], // Add an empty filters array to satisfy the UrlSource type
        }))
     /* ...getAllSupportedWebURLs().map((webUrl) => ({
        key: SourceKey.URL,
        operator: SourceOperator.CONTAINS,
        value: webUrl,
      })),
      {
        key: SourceKey.URL,
        operator: SourceOperator.CONTAINS,
        value: "__rq", // you can use __rq in the url to blacklist it
      }, */
    ];
  
    return blacklistedSources.some((source) => matchSourceUrl(source, url));
  };


  export const getUrlObject = (url: string): URL | undefined => {
    // Url obj fails to construct when chrome:// or similar urls are passed
    try {
      const urlObj = new URL(url);
      return urlObj;
    } catch (error) {
      return undefined;
    }
  };