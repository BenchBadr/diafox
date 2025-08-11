/**
 * Handle toggle wide mode for textarea
 * Normal : <textarea> <toolbox>
 * wide: textarea \n toolbox (block each)
 */

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
    document.querySelector('.msgs').appendChild(msgDiv);
}

document.querySelector('.send-btn').onclick = function() {
    const content = textarea.innerHTML || '';
    if (content.trim()) {
        sendMsg(content);
        textarea.innerHTML = '';
        // Reset the empty state after clearing content
        sendBtn.classList.add('empty');

        firstMsg = false;

        const ctxContainer = document.querySelector('.ctx-cards');
        if (ctxContainer) {
            ctxContainer.innerHTML = '';
        }
    }
};


