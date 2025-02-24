export function createDynamicJSON(properties, arrayData) {
    const dynamicJSON = {};

    // Add dynamic properties
    for (const key in properties) {
        if (properties.hasOwnProperty(key)) {
            dynamicJSON[key] = properties[key];
        }
    }

    // Add dynamic array
    dynamicJSON.items = [];
    for (const item of arrayData) {
        dynamicJSON.items.push(item);
    }

    return dynamicJSON;
}