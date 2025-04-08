export async function validateInsertChatHistory(req, res, next) {
    const requiredFields = [
        'vendor_Id',
        'vendor',
        'model',
        'finish_reason',
        'prompt_tokens',
        'completion_tokens',
        'total_tokens',
        'claim_check'
    ];

    const missingFields = requiredFields.filter(field => !req.body[field]);
    if (missingFields.length > 0) {
        return res.status(400).json({ error: `Missing required fields: ${missingFields.join(', ')}` });
    }

    next(); // Proceed to the route handler
}