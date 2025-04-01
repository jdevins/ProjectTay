export class Openai_chat_model {
    constructor(response) {
        this.id = response.id || '';
        this.object = response.object || '';
        this.created = response.created || 0;
        this.model = response.model || '';
        this.choices = response.choices ? response.choices.map(choice => new Openai_chat_model.Choice(choice)) : [];
        this.usage = response.usage ? new Openai_chat_model.Usage(response.usage) : null;
    }
}

    Openai_chat_model.Choice = class {
        constructor(choice) {
            this.index = choice.index || 0;
            this.message = choice.message ? new Openai_chat_model.Message(choice.message) : null;
            this.logprobs = choice.logprobs || null;
            this.finish_reason = choice.finish_reason || '';
        }
    }

    Openai_chat_model.Message = class {
        constructor(message) {
            this.role = message.role || '';
            this.content = this.parseContent(message.content) || '';
            this.refusal = message.refusal || null;
        }
    
        parseContent(content) {
            
                let split = content.split("\n");
                console.log("RESPONSE",split);
                return split;
            

        }
    }
    Openai_chat_model.Usage = class {
        constructor(usage) {
            this.prompt_tokens = usage.prompt_tokens || 0;
            this.completion_tokens = usage.completion_tokens || 0;
            this.total_tokens = usage.total_tokens || 0;
        }
    }

export default Openai_chat_model;