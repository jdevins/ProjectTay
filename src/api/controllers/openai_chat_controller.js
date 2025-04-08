import axios from 'axios';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';
import api_config from '../config/api_config.json' with {type:"json"};
//import { request } from 'express';
import { openai_chat_model } from '../models/openai_chat_model.js';
import { mock_openai_response } from '../mock/openai_chat_completion_mock.js';



 //PATH ES6 Support
const __filename  = fileURLToPath(import.meta.url);
const __dirname   = path.dirname(__filename);

// Construct the path to .env file
const envPath = path.resolve(__dirname, '../config/.env.api.development');
dotenv.config({ path: envPath });
 
//dotenv.config();

export class openai_chat_controller {
    constructor() {
        this.api_key        = process.env.SECRET_OPENAI_TOKEN;
        this.api_url        = api_config.openai_endpoint_chat_completions;
        this.api_max_tokens = api_config.openai_endpoint_chat_completions_max_tokens;
        this.is_mock        = api_config.openai_endpoint_chat_completions_is_mock;
    }

    async get_chat_completion(developerRole, userRole, context, acceptanceCriteria) {
        
        //Request Headers
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.api_key}`
        };

        //Request Body
        const data = {
            model: 'gpt-4o-mini',
            messages: [
                { role: 'developer', content: `You are a ${developerRole}.` },
                { role: 'user', content: `As a ${userRole}, ${context}` },
                { role: 'user', content: `Acceptance Criteria: ${acceptanceCriteria}`},
            ],
            max_completion_tokens: this.api_max_tokens,
            temperature: 0.5
        };
        //Return mocked response or call API
        try {
            var response = '';
            if (this.is_mock==1){
                var response = mock_openai_response;
            } else { 
                var response = await axios.post(this.api_url, data, { headers });
                console.log("Live response from OpenAI returned");
                if (response.status !== 200) {
                   throw new Error(`Connected, system responded with: ${response.status}`);
                }
            }
            const chat_model = new openai_chat_model(response);
            return chat_model.choices[0].message.content; 
        } catch (error) {
            console.error('Error fetching chat completion:', error);
            throw error;
        }
    //}
}

/*     async get_chat_history() {
        //Connect to Database
        const client = await connect();  
        const script = 'SELECT * FROM chat_history';
        
        //Run Query
        try {
            let qry_result = await client.query(script);
            console.log(qry_result.rows);
            return qry_result.rows;
        } catch (error) {
            console.error("Failed to Query Chat History", error);
            throw new error;
        } finally {
            //Close Connection
            await client.end();
        }
    } */

    async insert_chat_history() {
    console.log("Inserting Chat History");
    const response = 'Placeholder for insert chat history';
    return response;
    }

} //End of Class
