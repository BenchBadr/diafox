const systemPrompts = {
    main:`
You are DiaFox, a virtual sidebar assistant for Firefox. 
- Users can define slash commands called skills with custom instructions
- Users can provide custom instructions on how you answer.
- User can mention tab, if they do so the tab data will be provided to in the beginning of their message.
- You can then ask experts that will answer your question regarding this tab if you need an information.
- Tabs are to be considered added if and only iff they are before line ===. Ignore what user mentions see only what's before ===. 
    - If user asks something about a tab that is not added by mentionnin an unreferenced id, 
    - Point out that you can't access the tab
    - Do not attempt to fetch it


- Case 1 : No context needed : the question is straightforward, immediately and start answering.
- Case 2 : Tabs are included.
    - 2.1 : The user's question does not require to find any context -> start answering
    - 2.2 : User asks something that may be found or related to certain tabs
        - Call the designated tabs using tool call getCtx({id: tabId, query: query})
            - Query should be brief and concise as you are talking to experts
            - Is user asked a vague question, query should be only "Read"
            - tabId is found among provided tabs
        - Use this only with provided tabs, never try if no tabs provided 
        - You can perform multiple tool calls if context is not enough, do not do it more than twice for the same tab
        - Explain your thinking process as you go:
            - User wants to know... this information may be in tab ...
        - Conclude your thinking scheme and end thinking state
    `, 
    tabs:`
You are an expert in reading tabs. When receiving a brief query you need to find the relevant answer in one-shot.
No follow up question or comments, just quote answering the needs.
If you're asked to read tab content, return a summary of a couple takeaways
The text of the tab is just below this line:
===
    `,
    youtube:`
You are a YouTube reader expert. You will be provided with transcripts of a YouTube video.
You will receive brief queries and need to find pertinent and relevant informations from the transcripts to answer.
If you're asked to read tab content, return a summary of a couple takeaways
Return exactly a quote of the transcript with current timestamp.
Transcript below this line
===
    `
}


class Chat {
    constructor(instructions = 'tabs', additionalCtx = '', experts = {}) {
        this.instructions = instructions;

        // Tool definition - only for main inference otherwise no tools
        if (experts) {
            this.tools = [{
                type:"function",
                function: {
                    name: "getCtx",
                    description: "Send query to expert of associated tab ID",
                    parameters: {
                        type: "object",
                        properties: {
                            tabId: {
                                type: "string",
                                description: "The ID of the tab to retrieve context from."
                            },
                            query: {
                                type:"string",
                                description: "Brief query to the expert"
                            }
                        },
                        required: ["tabId","query"]
                    }
                }
            }]
        } else {
            this.tools = [];
        }

        // Define experts
        this.experts = experts;


        // Messages stack
        this.messages = [{role:"system",content:systemPrompts[instructions] + '\n' + additionalCtx}];
    }

    updateExperts = (experts) => {
        this.experts = experts;
    }

    async getCtx(id, query) {
        console.log('GETTING CTX',id, query, this.experts)
        const expert = this.experts[id]
        if (expert) {
            const result = await expert.chatLight(query);
            console.log('RESULT HERE', result, this.messages)
            return result
        }
        return null
    }

    async sendToolResponse(result) {

        this.messages.push({
            role: "tool",
            tool_call_id: id,
            name: "getCtx",
            content: typeof result === "string" ? result : JSON.stringify(result)
        });

        const response = await fetch(`https://text.pollinations.ai/openai`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: 'openai',
                messages: this.messages,
                tools: this.tools,
                private: true,
                seed: 42
            }),
        });
    }

    async handleToolCall(toolCall) {
        console.log('RECEIVE', toolCall)

        if (toolCall.name === "getCtx") {
            const { tabId, query } = JSON.parse(toolCall.arguments);

            // Call your expert system
            const result = await this.getCtx(tabId, query);

            console.log(result)

            // Send the result back as a "tool" message
            await sendToolResponse(result);
        }
    }

    async chatLight(query) {

        // Artificial delay of 4 seconds
        // await new Promise(resolve => setTimeout(resolve, 4000));
        const response = await fetch(`https://text.pollinations.ai/openai`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: 'openai',
                messages: [this.messages[0], {role:'user', content:query}], // No need to save chat messages
                private: true,
                seed: 42
            }),
        });
        const data = await response.json();
        return data.choices[0].message.content.split('**Sponsor**')[0];
    }


    async chat(query, onToken) {

        console.log('LOGS', query, this.instructions)

        this.messages.push({role:'user', content:query})
        const response = await fetch(`https://text.pollinations.ai/openai`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: 'openai',
                stream: this.instructions === 'main',
                messages: this.messages,
                tools:this.tools,
                private: true,
                seed:42
            }),
        });
        if (!response.ok) {
            throw new Error('Failed to fetch AI response');
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let result = '';

        const toolCallAcc = {arguments:'', name:''};

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            const chunk = decoder.decode(value);


            for (const line of chunk.split('\n')) {
                if (line.startsWith('data: ')) {
                    try {

                        // 1. Handle and decode streamed content
                        const data = JSON.parse(line.slice(6));

                        const content = data.choices?.[0]?.delta?.content;
                        const toolCalls = data.choices?.[0]?.delta?.tool_calls;
                        const finishReason = data.choices?.[0]?.finish_reason;


                        if (content) {
                            result += content;
                            if (onToken) onToken(content);
                        }

                        // 2.1 Handle tool_call stream instructions and accumulate
                        if (toolCalls) {
                            for (const toolCall of toolCalls) {

                                if (toolCall.function.name) {
                                    toolCallAcc.name = toolCallAcc.name + toolCall.function.name;
                                }

                                if (toolCall.function.arguments) {
                                    toolCallAcc.arguments = toolCallAcc.arguments + toolCall.function.arguments;
                                }
                            }
                        }

                        // 2.2 Finish tool_call stream and use tool_call with acc
                        if (finishReason === 'tool_calls') {
                            await this.handleToolCall(toolCallAcc);
                        }

                    } catch (e) {
                        // ignore malformed lines
                    }
                }
            }
        }

        const aiMessage = { role: 'system', content: result };
        this.messages = [...this.messages, aiMessage];
        return aiMessage.content;
    }
}

export default Chat;