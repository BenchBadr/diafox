import { markdown } from "./markdown.js";

const sendAnswer = (answerText) => {
    const msgs = document.querySelector('.msgs');
    const newDiv = document.createElement('div');
    newDiv.className = 'markdown-body';
    newDiv.innerHTML = markdown(answerText);
    msgs.appendChild(newDiv);

    // Tell MathJax to process the newly added content
    MathJax.typesetPromise()
      .catch(console.error);
}

export default sendAnswer;
