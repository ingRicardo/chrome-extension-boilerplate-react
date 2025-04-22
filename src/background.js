// background.js
chrome.runtime.onInstalled.addListener(() => {
 /* chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: [], // No rules to remove in this case
    addRules: [{
      "id": 1,
      "priority": 1,
      "action": {
        "type": "modifyHeaders",
        "responseHeaders": [
          {
            "name": "Access-Control-Allow-Origin",
            "value": "*"
          }
        ]
      },
      "condition": {
        "urlFilter": "https://conisoft.org/cakes/loadvehicles.php",
        "resourceTypes": ["xmlhttprequest", "fetch"]
      }
    }],
    rulesetId: "ruleset"
  });*/
});