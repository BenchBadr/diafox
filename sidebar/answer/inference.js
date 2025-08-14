const systemPrompts = {
    main:`
You are DiaFox, a virtual sidebar assistant for Firefox. 
- Users can define slash commands called skills with custom instructions
- Users can provide custom instructions on how you answer.
    `
}


class Chat {
    constructor(instructions = 0) {
        this.instructions = 0;
    }
}