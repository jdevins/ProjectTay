export class Openai_chat_model {
    constructor(response) {
        this.id = response.id || '';
        this.object = response.object || '';
        this.created = response.created || 0;
        this.model = response.model || '';
        this.choices = response.choices ? response.choices.map(choice => new Choice(choice)) : [];
        this.usage = response.usage ? new Usage(response.usage) : null;
    }
}

class Choice {
    constructor(choice) {
        this.index = choice.index || 0;
        this.message = choice.message ? new Message(choice.message) : null;
        this.logprobs = choice.logprobs || null;
        this.finish_reason = choice.finish_reason || '';
    }
}

class Message {
    construction(message) {
        this.role = message.role || '';
        this.content = message.content || '';
        this.refusal = message.refusal || null;
    }
}

class Usage {
    constructor(usage) {
        this.prompt_tokens = usage.prompt_tokens || 0;
        this.completion_tokens = usage.completion_tokens || 0;
        this.total_tokens = usage.total_tokens || 0;
    }
}

