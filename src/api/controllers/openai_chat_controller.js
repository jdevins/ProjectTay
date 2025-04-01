import axios from 'axios';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';
import api_config from '../config/api_config.json' with {type:"json"};
//import { request } from 'express';
import { Openai_chat_model } from '../models/openai_chat_model.js';
import { mock_openai_response } from '../mock/openai_chat_completion_mock.js';
import { Get_Chat_History } from '../models/db_op_openai_chat.js'


//PATH ES6 Support
const __filename  = fileURLToPath(import.meta.url);
const __dirname   = path.dirname(__filename);

// Construct the path to .env file
const envPath = path.resolve(__dirname, '../config/.env.api.development');
dotenv.config({ path: envPath });

export class Openai_chat_controller {
    constructor() {
        this.api_key        = process.env.SECRET_OPENAI_TOKEN;
        this.api_url        = api_config.openai_endpoint_chat_completions;
        this.api_max_tokens = api_config.openai_endpoint_chat_completions_max_tokens;
        this.is_mock        = api_config.openai_endpoint_chat_completions_is_mock;
    }

    async get_chat_completion(developerRole, userRole, context, acceptanceCriteria) {

        //Return mocked response if setting in api_config is enabled
/*         if (this.is_mock==1){
            return (mock_openai_response);
        } else { */ 
        
        //Make call to OpenAI
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.api_key}`
        };

        const data = {
            model: 'gpt-4o-mini',
            messages: [
                { role: 'developer', content: `You are a ${developerRole}.` },
                { role: 'user', content: `As a ${userRole}, ${context}` },
                { role: 'user', content: `Acceptance Criteria: ${acceptanceCriteria}` },
            ],
            max_completion_tokens: this.api_max_tokens,
            temperature: 0.5
        };

        try {
            
            //Return mocked response if setting in api_config is enabled
            if (this.is_mock==1){
                return (mock_openai_response);
            } else { 
                const response = await axios.post(this.api_url, data, { headers });
                if (response.status !== 200) {
                throw new Error(`Connected, system responded with: ${response.status}`);
                }
            }
            const chat_model = new Openai_chat_model(response.data);
            const get_response = await Get_Chat_History(chat_model);
            console.log(get_response);
            return chat_model;
            
        } catch (error) {
            console.error('Error fetching chat completion:', error);
            throw error;
        }
    //}
}
}


