//Function to retry with exponential backoff.

export async function retryWithBackoff(fn, maxAttempts = 5, delay = 100) {
    let attempt = 0;
  
    function execute() {
      return fn()
        .then(result => result)
        .catch(error => {
          if (attempt >= maxAttempts) {
            throw new Error(`Max retries reached: ${error.message}`);
          }
          attempt++;
          const backoffTime = Math.min(delay * Math.pow(2, attempt), 3000); // Exponential backoff (capped at 3 sec)
          console.log(`Retrying in ${backoffTime}ms (Attempt ${attempt})...`);
          
          return new Promise(resolve => setTimeout(resolve, backoffTime)).then(execute);
        });
    }
  
    return execute();
  }
  