import { printLine } from './modules/print';
import { initFetchInterceptor } from './modules/fetch';
import { sendCacheSharedStateMessage } from './modules/utils';
//content
console.log('Content script works!');
console.log('Must reload extension for modifications to take effect.');

printLine("Using the 'printLine' function from the Print Module");

console.log('Content script works!');

const initAjaxRequestInterceptor = () => {
let isDebugMode;
try {
  isDebugMode = window && window.localStorage && localStorage.isDebugMode;
} catch (e) {}

initFetchInterceptor(isDebugMode);


if (window.top === window.self) {
    console.log(" window.top   ------> "+ window.top);
    window.addEventListener("beforeunload", () => {
      sendCacheSharedStateMessage();
    });
  }

}

initAjaxRequestInterceptor();