import axios from 'axios';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';
import api_config from '../config/api_config.json' with {type:"json"};

//PATH ES6 Support
const __filename  = fileURLToPath(import.meta.url);
const __dirname   = path.dirname(__filename);

// Construct the path to .env file
const envPath = path.resolve(__dirname, '../config/.env.api.development');
dotenv.config({ path: envPath });

export class ChatController {
    constructor() {
        this.api_key = process.env.SECRET_OPENAI_TOKEN;
        this.api_url = api_config.openai_endpoint_chat_completions;
        this.is_mock = api_config.openai_endpoint_chat_completions_is_mock;
    }

    async getChatCompletion(developer_role, user_role, user_context, acceptance_criteria) {
        console.log("Starting Chat Completion");
        
        //Return mocked response if setting in api_config is enabled
        if (this.is_mock==1){
            return JSON.stringify({"mock": "mocked response"});
        }

        //Make call to OpenAI
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.api_key}`
        };

        const data = {
            model: 'gpt-4o-mini',
            messages: [
                { role: 'developer', content: `You are a ${developer_role}.` },
                { role: 'user', content: `As a ${user_role}, ${user_context}` },
                { role: 'user', content: `Acceptance Criteria: ${acceptance_criteria}` },
            ],
            max_completion_tokens: 100,
            temperature: 0.5
        };
        //console.log("Payload to OpenAI is: ", data);

        try {
            const response = await axios.post(this.api_url, data, { headers });
            if (response.status !== 200) {
                throw new Error(`Connected system responded with: ${response.status}`);
            }
            return response.data.choices[0].message.content;
        } catch (error) {
            console.error('Error fetching chat completion:', error);
            throw error;
        }
    }
}


