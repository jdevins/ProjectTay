import pg from 'pg';
import { connect } from  "../shared/db_helper.js";


export async function Get_Chat_History(){
    
    let script = 'SELECT * FROM chat_history';
    console.log ("Script Set");
    
    //Connect
    await connect();
    
    //Run Query
    try {
        console.log("executing query");
        let response = connect.query(script);
        console.log(response);
    } catch {
        console.error("Failed to Insert Chat History");
    }
    //Close Connection
    await db_client.end();
}
