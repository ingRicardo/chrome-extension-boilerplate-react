console.log('This is the background page.');
console.log('Put the background scripts here.');


// background.js

// Store override rules.  Use an object with unique IDs for easier management.
let overrides = {};

// Function to add a new override rule
function addOverride(request, sendResponse) {
    const { urlPattern, overridePayload } = request;
    const id = crypto.randomUUID(); // Generate a unique ID
    overrides[id] = {
        id,
        urlPattern,
        payload: overridePayload,
        isActive: true, // New rules are active by default
    };
    saveOverridesToStorage(); // Save to storage
    console.log('Override added:', overrides[id]);
    sendResponse({ success: true });
    // Apply the override immediately.
    applyOverrides();
}

// Function to get all override rules
function getOverrides(request, sendResponse) {
    sendResponse({ success: true, overrides: overrides });
}

// Function to delete an override rule
function deleteOverride(request, sendResponse) {
    const { id } = request;
    if (overrides[id]) {
        delete overrides[id];
        saveOverridesToStorage();
        sendResponse({ success: true });
        console.log('Override deleted:', id);
        applyOverrides();
    } else {
        sendResponse({ success: false, error: 'Override not found' });
    }
}

// Function to toggle the active state of an override
function toggleOverride(request, sendResponse) {
    const { id } = request;
    if (overrides[id]) {
        overrides[id].isActive = !overrides[id].isActive;
        console.log("isActive " + overrides[id].isActive);
        saveOverridesToStorage();
        sendResponse({ success: true });
        console.log('Override toggled:', overrides[id]);
        applyOverrides();
    } else {
        sendResponse({ success: false, error: 'Override not found' });
    }
}

function updateOverride(request, sendResponse) {
    const { id, urlPattern, overridePayload } = request;
    if (overrides[id] && overrides[id].isActive) {
        overrides[id].urlPattern = urlPattern;
        overrides[id].payload = overridePayload;
        saveOverridesToStorage();
        sendResponse({ success: true });
        console.log('Override updated:', overrides[id]);
        applyOverrides();
    } else {
        sendResponse({ success: false, error: 'Override not found.' });
    }
}

// Function to load overrides from storage
function loadOverridesFromStorage() {
    chrome.storage.local.get({ overrides: {} }, (result) => {
        overrides = result.overrides;
        console.log('Overrides loaded:', overrides);
        applyOverrides(); //apply when loaded
    });
}

// Function to save overrides to storage
function saveOverridesToStorage() {
    chrome.storage.local.set({ overrides: overrides }, () => {
        console.log('Overrides saved:', overrides);
    });
}

// Function to apply the overrides using chrome.webRequest.onBeforeRequest
function applyOverrides() {
    // Remove any existing webRequest listeners before adding new ones.
    chrome.webRequest.onBeforeRequest.removeListener(handleRequest);

    // Clear all filters first
    const filter = { urls: ["<all_urls>"] };
    chrome.webRequest.onBeforeRequest.removeListener(handleRequest, filter);

    // If there are no overrides, we don't need to do anything.
    if (Object.keys(overrides).length === 0) {
        return;
    }

    // Create an array of active URLs for filtering.
    const activeUrls = Object.values(overrides)
        .filter(override => override.isActive)
        .map(override => override.urlPattern);

    if (activeUrls.length === 0) {
        return; // No active overrides, so don't add a listener.
    }
    // Use chrome.webRequest.onBeforeRequest to intercept requests.
    chrome.webRequest.onBeforeRequest.addListener(
        handleRequest,
        { urls: activeUrls }, // Use the array of URLs from active overrides
        ['blocking']
    );
}

function handleRequest(details) {
    const url = details.url;

    // Find the first matching active override.
    const matchingOverride = Object.values(overrides).find(override => {
        if (!override.isActive) return false; // Skip if not active.

        // Basic string matching
        if (override.urlPattern === url) {
            return true;
        }
        //check for regex
        if (override.urlPattern.startsWith('REGEX:')) {
            try {
                const regexPattern = override.urlPattern.substring(6); // Remove "REGEX:"
                const regex = new RegExp(regexPattern);
                return regex.test(url);
            } catch (e) {
                console.error('Invalid regex:', regexPattern, e);
                return false; // Don't override on invalid regex.
            }
        }

        //check for wildcard
        if (override.urlPattern.includes('*')) {
            const pattern = override.urlPattern.replace(/\*/g, '.*');
            const regex = new RegExp(`^${pattern}$`);
            return regex.test(url);
        }

        return false;
    });

    if (matchingOverride) {
        console.log('Request intercepted:', url);
        console.log('Override used:', matchingOverride);
        return {
            cancel: true, // Cancel the original request.
            redirectUrl: `data:application/json;charset=UTF-8,${encodeURIComponent(
                matchingOverride.payload
            )}`,
        };
    }
    return {}; //  Return an empty object to allow the request to proceed normally.
}

// Listen for messages from the DevTools panel.
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (sender.id === chrome.runtime.id) {
        //  Make sure the message is from our extension.
        switch (request.action) {
            case 'addOverride':
                addOverride(request, sendResponse);
                break;
            case 'getOverrides':
                getOverrides(request, sendResponse);
                break;
            case 'deleteOverride':
                deleteOverride(request, sendResponse);
                break;
            case 'toggleOverride':
                toggleOverride(request, sendResponse);
                break;
            case 'updateOverride':
                updateOverride(request, sendResponse);
                break;
            default:
                sendResponse({ success: false, error: 'Unknown action' });
        }
        return true; //  Indicate that the response will be sent asynchronously.
    }
    return false;
});

// Load overrides from storage when the background script starts.
loadOverridesFromStorage();

