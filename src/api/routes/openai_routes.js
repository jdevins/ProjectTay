import express from 'express';
import { ChatController } from '../controllers/openai_chat_controller.js';

const router = express.Router();
const chatController = new ChatController();

router.post('/chat', async (req, res) => {
    const { developerRole, userRole, context, acceptanceCriteria } = req.body;
    console.log("Request Body is: ", req.body);

    if (!developerRole || !userRole || !context || !acceptanceCriteria) {
        return res.status(400).json({ error: 'Missing required fields' });
    }
    
    try {
        const completion = await chatController.getChatCompletion(developerRole, userRole, context, acceptanceCriteria);
        res.json({ completion });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch chat completion' });
    }
});

export default router;