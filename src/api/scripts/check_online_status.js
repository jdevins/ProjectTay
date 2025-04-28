import axios from 'axios';
import path from 'path';
import { fileURLToPath } from 'url';
import { performance } from 'perf_hooks';
import { convert_milliseconds } from '../utils/time_utils.js';
//import { createDynamicJSON } from '../shared/JSON_helper.js';
import dotenv from 'dotenv';

 //PATH ES6 Support
 const __filename  = fileURLToPath(import.meta.url);
 const __dirname   = path.dirname(__filename);
 
 // Construct the path to .env file
 const envPath = path.resolve(__dirname, '../config/.env.api.development');
 dotenv.config({ path: envPath });

//Check the status of services
export async function check_online_status() {
    try {
      var start_clock = performance.now();
      var key = process.env.SECRET_POSTMAN_APIKEY;
      var mockserver = 'https://7123af47-a366-4c7a-8c6c-198958ecf46a.mock.pstmn.io';
      var url = 'https://google.com';

      const response = await axios.get({
        method: 'get',
        url: mockserver+'\https://google.com',
        headers: {
          'x-api-key': key
        }
    });
  
      var end_clock = performance.now();
      var milliseconds = end_clock - start_clock;
      var perf_seconds = parseFloat(convert_milliseconds(milliseconds,"seconds"));

      if (response.ok) {  
        var data = {
          type: "Pass: Server reached internet",
          status: response.status,
          elapsed_seconds: perf_seconds
        }
        //const response = createDynamicJSON(properties);
        return data;
      } else {
          const status = response.status
          const properties = {
          type: "Failed: Server could not reach internet",
          status: status,
          elapsed_seconds: 'NA',
        }
        return properties;
        
        }
   
  } catch (error) {
    console.log('Error:', error.message);
    throw error;
    //error = 'Server encountered error trying to reach internet';  
    //return error;
    }
}

