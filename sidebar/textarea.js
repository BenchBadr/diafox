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
    hiddenDiv.textContent = textarea.value;
    document.body.appendChild(hiddenDiv);
    
    const textWidth = hiddenDiv.clientWidth;
    const fontSize = parseFloat(window.getComputedStyle(textarea).fontSize);
    document.body.removeChild(hiddenDiv);
    
    const shouldBeWide = 
      textWidth > textareaWidth - 2.5 * fontSize || 
      textarea.value.includes('\n') ||
      textareaWidth < 200;
      
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


// Auto add / remove empty class to send btn
// (kind of a disabled effect)
textarea.oninput = (event) => {
    const promptValue = event.target.value;
    if (promptValue.length) {
        sendBtn.classList.remove('empty');
    } else {
        sendBtn.classList.add('empty');
    }
};


// Shift + Enter = line break
// Enter = send
textarea.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        sendBtn.click();
    }
});