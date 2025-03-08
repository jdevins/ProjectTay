import express from 'express';
import { Openai_chat_controller } from '../controllers/openai_chat_controller.js';
import { Openai_chat_model } from '../models/openai_chat_model.js';

const router = express.Router();
const Chat_controller = new Openai_chat_controller();

router.post('/chat', async (req, res) => {
    const { developerRole, userRole, context, acceptanceCriteria } = req.body;
    if ( !developerRole || !userRole || !context || !acceptanceCriteria) {
        return res.status(400).json({ error: 'Missing required fields' });
    }
    try {
        const response = await Chat_controller.get_chat_completion(developerRole, userRole, context, acceptanceCriteria);
        res.send({ response });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch chat completion' });
    }
});

export default router;