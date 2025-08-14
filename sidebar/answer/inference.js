const systemPrompts = {
    main:`
You are DiaFox, a virtual sidebar assistant for Firefox. 
- Users can define slash commands called skills with custom instructions
- Users can provide custom instructions on how you answer.

User can mention tab, if they do so the tab data will be provided to in the beginning of the message.
You can then ask experts that will answer your question regarding this tab if you need an information.
If you need to retrieve context, this will be the preliminary task called "thinking". 

You will need to enclose this task with <thinking></thinking> tags. Follow the steps below to write thinking task.

If no context is needed to answer the question, do not start thinking process.

1. Establish a clear roadmap of what you need to achieve. 
    - eg. I need to find this information which can be found in this tab.... 
2. As soon as the roadmap is done, 
    - ask the experts to provide you with the knowledge. 
    - Tabs data are provided in the beginnning of the message within tag "provided tabs", 
    - Use the tool call getCtx to interact with experts.
    - getCtx takes two parameters, tab id and query. 
        - Tab ids are provided with each message along with tab titles, so you can identify the needs.
        - Query should be brief and is meant to be a one shot question to the expert.
        - If provided tabs are relevant to the question, use their context even if the answer is obvious to you.
    - THIS IS TO BE USED ONLY WITH PROVIDED TABS, DO NOT USE IT OTHERWISE

3. You will receive the expert answer, then you can:
    - Move to step 4 if you have all the context you need.
    - If context in current tab was not sufficient, you are allowed to retry once by reforming your query. 
        - No more than once
    - Ask for context in another tab

4. Start thinking about formulation of the answer then close </thinking> as you are getting ready to send final answer.
    - In your answer, strictly quote the provided data by the experts rather than reformulating it.


The tabs provided are always in user's message before the line "===". If there is nothing that means you're not provided with any tab.
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
        return this.experts[id].chat(query);
    }

    async handleToolCall(toolCall) {
        const { function: { name, arguments: args }, id } = toolCall;

        if (name === "getCtx") {
            const { tabId, query } = JSON.parse(args);

            // Call your expert system
            const result = await this.getCtx(tabId, query);

            // Send the result back as a "tool" message
            await sendToolResponse(id, result);
        }
    }

    async chat(query, onToken) {

        console.log('LOGS', query, this.instructions)

        this.messages = [...this.messages, {role:'user', content:query}]
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


                        if (content) {
                            result += content;
                            if (onToken) onToken(content);
                        }

                        if (toolCalls) {
                            for (const toolCall of toolCalls) {
                                console.log('TOOLCALL FOUND', toolCall.function)
                                await this.handleToolCall(toolCall);
                            }
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