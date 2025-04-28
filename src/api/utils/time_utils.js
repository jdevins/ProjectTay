//Recieves milliseconds and returns a string with the time in minutes and seconds
export function convert_milliseconds(milliseconds, return_option) {
  const minutes = Math.floor(milliseconds / 60000);
  const seconds = ((milliseconds % 60000) / 1000).toFixed(3);
  
  switch (return_option) { 
    case "seconds": 
      return seconds;
    case "minutes":
      return minutes;
    default:
      return `${minutes}m ${seconds}s`;
  }
}
