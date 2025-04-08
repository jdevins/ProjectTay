import express from 'express';
import { openai_chat_controller } from '../controllers/openai_chat_controller.js';
import { qry_get_chat_history,qry_insert_chat_history } from '../models/openai_chat_db.js';
import { validateInsertChatHistory } from '../middleware/validate_chat_history.js';

const router          = express.Router();
const chat_controller = new openai_chat_controller();
var response          = '';

router.post('/chat', async (req, res) => {
    const { developerRole, userRole, context, acceptanceCriteria } = req.body;
    if ( !developerRole || !userRole || !context || !acceptanceCriteria) {
        return res.status(400).json({ error: 'Missing required fields' });
    }
    try {
        response = await chat_controller.get_chat_completion(developerRole, userRole, context, acceptanceCriteria);
        res.send({ response });
    } catch (error) {
        throw error;
        //res.status(500).json({ error: 'Server failed to fetch chat completion' });
    }

});

router.get('/chat/history', async (req, res) => {
    try {
        console.log("Trying Chat History");
        response = await qry_get_chat_history();
        res.status(200).json(response);
    } catch (error) {
        //res.status(500).json({ error: 'Error Fetching Chat History Record' });
        throw error;
    }
});

router.post('/chat/insert', validateInsertChatHistory, async (req, res) => {
    try {
        const response = await qry_insert_chat_history(req.body);
        res.status(200).json(req.body);
    } catch (error) {
        //res.status(500).json({ error: 'Error Inserting Chat History Record' });
        throw error;
    }
});

export default router;