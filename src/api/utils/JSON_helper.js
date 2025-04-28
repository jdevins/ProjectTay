export function createDynamicJSON(properties, arrayData=[]) {
    var dynamicJSON = {};

    // Add dynamic properties
    for (const key in properties) {
        if (properties.hasOwnProperty(key)) {
            dynamicJSON[key] = properties[key];
        }
    }
   // Add dynamic array
   if (!arrayData){ 
    dynamicJSON.items = [];
    for (const item of arrayData) {
        dynamicJSON.items.push(item);
        }
    }
    return dynamicJSON;
}