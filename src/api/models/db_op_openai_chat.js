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
        let qry_result = connect.query(script);
        console.log(qry_result);
    } catch {
        console.error("Failed to Insert Chat History");
    }
    //Close Connection
//    await connect.end();
}
