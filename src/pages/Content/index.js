import { printLine } from './modules/print';

console.log('Content script works!');
console.log('Must reload extension for modifications to take effect.');

printLine("Using the 'printLine' function from the Print Module");

// This keeps track of the origal js HTTP request functions
const originalFetch = window.fetch;
window.fetch = async (...args) => {
    printLine('fetch', args);
    const response = await originalFetch(...args);

    if (!response.body) {
        console.log("Response has no body.");
        return null;
    }

    const reader = response.body.getReader();
    const textDecoder = new TextDecoder();
    let accumulatedData = '';

    while (true) {
        const { done, value } = await reader.read();

        if (done) {
            break;
        }

        accumulatedData += textDecoder.decode(value);
    }

    try {
        const jsonData = JSON.parse(accumulatedData);

        // --- Your modification logic goes here ---
        jsonData.title = "NEW TITLE";
        jsonData.completed = true;
        const modifiedData = { ...jsonData };
        //const modifiedData = { ...jsonData, newField: "someValue" };
        // Or perhaps:
        // const filteredItems = jsonData.items.filter(item => item.price > 10);

        // If you need to return a new ReadableStream with the modified JSON:
        const modifiedJsonString = JSON.stringify(modifiedData);
        const modifiedStream = new ReadableStream({
            start(controller) {
                const textEncoder = new TextEncoder();
                const encodedData = textEncoder.encode(modifiedJsonString);
                controller.enqueue(encodedData);
                controller.close();
            },
        });

        return new Response(modifiedStream, {
            headers: response.headers,
            status: response.status,
            statusText: response.statusText,
        });

        // If you just need the modified JavaScript object:
        // return modifiedData;

    } catch (error) {
        console.error("Error parsing JSON:", error);
        return null;
    } finally {
        reader.releaseLock();
    }


};
