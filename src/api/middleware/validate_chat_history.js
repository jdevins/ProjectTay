import { body, validationResult } from 'express-validator';

export async function validateInsertChatHistory(req, res, next) {
    // Validate the request body using express-validator
    const validate = [
        body('vendor_Id').notEmpty().isString().trim().withMessage('AI Vendor provided ID (unique ID) required').run(req),
        body('vendor').notEmpty().isString().trim().withMessage('AI Vendor Name (String) is required').run(req),
        body('model').notEmpty().isString().trim().withMessage('AI Model Name (String) is required').run(req),
        body('finish_reason').notEmpty().isString().trim().withMessage('Finish Reason (String) is required').run(req),
        body('prompt_tokens').notEmpty().isString().withMessage('Prompt tokens are required').run(req),
        body('completion_tokens').notEmpty().isString().withMessage('Completion tokens are required').run(req),
    ];

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.msg });
    }

    next(); // Proceed to the route handler
}