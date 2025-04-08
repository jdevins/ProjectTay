import { connect } from  "../shared/db_helper.js";

export async function qry_get_chat_history(){
    const script = 'SELECT * FROM chat_history';
    
    //Connect
    const client = await connect();  

    //Run Query
    try {
        const qry_result = await client.query(script);
        return qry_result.rows;
    } catch (error) {
        throw new error;
    } finally {
        //Close Connection
        await client.end();
    }
}

export async function qry_insert_chat_history(chat_obj) {
    const script = 
        `INSERT INTO public.chat_history (
            vendor_Id,
            vendor,
            model,
            finish_reason,
            prompt_tokens,
            completion_tokens,
            total_tokens,
            claim_check
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`; 

    const values = [
        chat_obj.vendor_Id,
        chat_obj.vendor,
        chat_obj.model,
        chat_obj.finish_reason,
        chat_obj.prompt_tokens,
        chat_obj.completion_tokens,
        chat_obj.total_tokens,
        chat_obj.claim_check 
    ];
    //Connect
    const client = await connect();  

    //Run Query
    try {
        const  qry_result = await client.query(script, values);
        return qry_result.rows;
    } catch (error) {
        throw error;
    } finally {
        //Close Connection
        await client.end();
    }
}
