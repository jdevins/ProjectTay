import path from 'path';
import fetch from 'node-fetch';
import dotenv from 'dotenv';
import { performance } from 'perf_hooks';
import { convert_milliseconds } from '../shared/time_utils.js';
import { createDynamicJSON } from '../shared/JSON_helper.js';

//PATH Helpers
const __dirname = import.meta.dirname;

// Construct the path to your .env file
const envvar = path.resolve(__dirname, './config/.env.web.development');
dotenv.config({ path: envvar });


//Check the status of services
async function checkOnlineStatus() {
    try {
        let startclock = performance.now();
        const url = 'https://7123af47-a366-4c7a-8c6c-198958ecf46a.mock.pstmn.io\\https://google.com';
        const canGoOutside = await fetch(url);
        {
            if (canGoOutside.status === 200) {
              const endclock = performance.now();
              const milliseconds = endclock - startclock;
              const performance_minutes = parseFloat(convert_milliseconds(milliseconds,"minutes"));
              const performance_seconds = parseFloat(convert_milliseconds(milliseconds,"seconds"));
              
              //Set JSON Properties
              const properties = {
                type: "Server reaches internet",
                status: canGoOutside.status,
                elapsedminutes: performance_minutes,
                elapsedseconds: performance_seconds
              }
              const response = createDynamicJSON(properties, []);
              return response;
            } else {
                const response = JSON.stringify({ Internet: 'Not Connected' });
                return response;
            }
        }
    } catch (error) {
        return ('Not hitting internet');
    }
}

/* async function canGoOutside() {
  try{
    return await fetch('https://google.com')
   
  } catch(error) {
    return (canGoOutside.status);
  }
}
await canGoOutside();
 */

export default checkOnlineStatus;

