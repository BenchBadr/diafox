import { highlightAll } from "./messaging.js";
import sendAnswer from "./answer/answer.js";


const promptWrap = document.querySelector('.prompt-wrap');
const textarea = document.getElementById('prompt');
const sendBtn = promptWrap.querySelector('.send-btn');

document.addEventListener('DOMContentLoaded', () => {
  let textareaWidth = textarea.clientWidth;
  
  function checkForWrapping() {
    const hiddenDiv = document.createElement('div');
    hiddenDiv.style.position = 'absolute';
    hiddenDiv.style.visibility = 'hidden';
    hiddenDiv.style.whiteSpace = 'pre';
    hiddenDiv.style.font = window.getComputedStyle(textarea).font;
    hiddenDiv.textContent = textarea.textContent || '';
    document.body.appendChild(hiddenDiv);
    
    const textWidth = hiddenDiv.clientWidth;
    const fontSize = parseFloat(window.getComputedStyle(textarea).fontSize);
    document.body.removeChild(hiddenDiv);
    
    const shouldBeWide = 
      textareaWidth < 200 || textWidth > textareaWidth - 2.5 * fontSize || 
      (textarea.innerHTML && textarea.innerHTML.includes('<br>'))
      
    promptWrap.classList.toggle('wide', shouldBeWide);
  }
  
  new ResizeObserver(() => {
    if (!promptWrap.classList.contains('wide')) {
      textareaWidth = textarea.clientWidth;
    }
    checkForWrapping();
  }).observe(textarea);
  
  textarea.addEventListener('input', checkForWrapping);
  

  checkForWrapping();
});



// Shift + Enter = line break
// Enter = send (unless suggestions are active)
textarea.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
        // Check if suggestions are active - if so, let messaging.js handle it
        const suggestions = document.querySelector('.suggestions');
        const hasActiveSuggestion = suggestions && suggestions.querySelector('.active');
        
        if (!hasActiveSuggestion) {
            event.preventDefault();
            sendBtn.click();
        }
        // If there are active suggestions, don't prevent default - let messaging.js handle it
    }
});


// Mimic textarea
// Although it's div[contenteditable]
textarea.addEventListener('paste', (event) => {
    event.preventDefault();
    let text = (event.clipboardData || window.clipboardData).getData('text');
    text = text.replace(/\r\n?/g, '\n').replace(/\n/g, '<br>');
    document.execCommand('insertHTML', false, text);
});


function sendMsg(content) {
    textarea.setAttribute('data-placeholder', 'Ask another question...');

    const msgDiv = document.createElement('div');
    msgDiv.className = 'msg-user';
    msgDiv.innerHTML = content;

    const ctxClone = document.createElement('div');
    ctxClone.className = 'ctx-cards msgPrev';

    const ctxContainer = document.querySelector('.ctx-cards:not(.msgPrev)');

    ctxClone.innerHTML = ctxContainer.innerHTML;
    ctxClone.style.setProperty('--n', ctxContainer.children.length);
    Array.from(ctxClone.children).forEach((child, idx) => {
        child.style.setProperty('--idx', idx);
    });

    const msgs = document.querySelector('.msgs');


    msgs.appendChild(ctxClone)
    msgs.appendChild(msgDiv);


    // auto scroll to active msg
    const ctxCloneRect = ctxClone.getBoundingClientRect();
    const msgDivRect = msgDiv.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const paddingBottom = Math.max(
        0,
        viewportHeight - 32 - (ctxCloneRect.height + msgDivRect.height)
    );
    msgs.style.paddingBottom = `${paddingBottom}px`;
    msgs.scrollTo({
        top: msgs.scrollHeight,
        behavior: 'smooth'
    });


    sendBtn.classList.add('running');


    const ctxCardIds = Array.from(ctxClone.querySelectorAll('.ctx-card'))
        .map(card => card.getAttribute('data-id'));

    sendAnswer(ctxCardIds).finally(() => {
        sendBtn.classList.remove('running');
    });
}

document.querySelector('.send-btn').onclick = function() {
    const content = textarea.innerHTML || '';
    if (content.trim()) {
        sendMsg(content);
        textarea.innerHTML = '';
        // Reset the empty state after clearing content
        sendBtn.classList.add('empty');

        firstMsg = false;

        const ctxContainer = document.querySelector('.ctx-cards:not(.msgPrev)');
        if (ctxContainer) {
            ctxContainer.innerHTML = '';
        }
    }
};


/**
 * Textarea replaceAll(smt, '') + rerender
 * 
 */
export const textareaRemove = (query) => {
    textarea.textContent = textarea.textContent.replaceAll(query, '');
    highlightAll(textarea);
}
