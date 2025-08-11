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
      textarea.innerHTML && textarea.innerHTML.includes('<br>')
      
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
// Enter = send
textarea.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        sendBtn.click();
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


/*
=================

FLOATING MENUS

=================

*/

