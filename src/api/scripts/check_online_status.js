import fetch from 'node-fetch';
import { performance } from 'perf_hooks';
import { convert_milliseconds } from '../shared/time_utils.js';
import { createDynamicJSON } from '../shared/JSON_helper.js';


//Check the status of services
export async function check_online_status() {
    try {
        console.log("Online Status Check - Start");
        var start_clock = performance.now();
        var url = 'https://7123af47-a366-4c7a-8c6c-198958ecf46a.mock.pstmn.io\\https://google.com';
        var call_google = await fetch(url);
              var end_clock = performance.now();
              var milliseconds = end_clock - start_clock;
              var perf_seconds = parseFloat(convert_milliseconds(milliseconds,"seconds"));
        console.log("Online Status Check - Finish"); 
        if (call_google.ok) {  
              //Set JSON Response Properties
              const properties = {
                type: "Server reaches internet",
                status: call_google.status,
                elapsed_seconds: perf_seconds
              }
              const response = createDynamicJSON(properties);
              return response;
            } else {
              if (!call_google.ok){
                const status = call_google.status
                const properties = {
                  type: "Server reaches internet",
                  status: status,
                  //elapsed_seconds: perf_seconds
                }
                const response = createDynamicJSON(properties);
                return response;

              }
              
        }
    } catch (error) {
        return JSON.stringify({ error: 'Not hitting internet'});
    }
}

