import fetch from "node-fetch";
import { createRequire } from 'module';
import { error } from "console";
import * as dotenv from '../dev';
dotenv.config();

// Function to fetch a fun fact from the OpenAI API
export async function getFunFact(funFact) {
    
    const require = createRequire(import.meta.url);
    const config = require('../services/external_config.json');

    // Check if the config file is missing any required fields.
    if (typeof config.openai_url == 'undefined' && config.openai_url == null && config.openai_url.trim() == '') {
    throw new error("Missing OpenAI Url")   
    } else if (typeof config.openai_endpoint_chat_completions == 'undefined' && config.openai_endpoint_chat_completions == null && config.openai_endpoint_chat_completions.trim() == '') {
    throw new error("Missing OpenAI Endpoint")   
    } else if (typeof config.openai_api_key == 'undefined' && config.openai_api_key == null && config.openai_api_key.trim() == '') {
    throw new error("Missing OpenAI api_key")   
    } else {
        const base_url = config.openai_url; 
        const endpoint = config.openai_endpoint_chat_completions;
        const url = base_url+endpoint;
        const token = config.openai_api_key;
        }
    
        // Fetch fun fact from OpenAI API
        try {
        console.log("Server is fetching fun fact");
        
        const method = "POST";
        const headers = {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + token }
        const body = {
            "model": "gpt-4o-mini",
            "messages": [
            {
                "role": "developer",
                "content": "You are a knowledgeable and funny assistant."
            },
            {
                "role": "user",
                "content": `Provide a single fun fact about ${funFact}`
            }
            ],
            "temperature": 0.5
        }
        console.log(url,headers,body)
        async function getResponse(url, headers, body) {
            const response = await fetch(url, {
                method: method,
                headers: headers,
                body: JSON.stringify(body)
            });
            return response.json();
        }

        const response = await getResponse(url, headers, body);
        
        //Errors
        if (!response.status===200) {
            console.error("Error retrieving data", response.status);
            return "Host was not able to complete the request";
        }

        //Parse response
        console.log("Fun Fact Response:", response);
        return response;
        } catch (error) {
            console.error("SVC Error fetching fun fact:", error);
            return "SVC Failed to fetch fun fact";
        }
    }