/**
 * Highlight functionality for a contenteditable div
 * @param {HTMLElement} root - The contenteditable div
 * @param {string} query - The query to highlight (optional)
 */
export function highlight(div, query) {
  if (!query) return;

  const selection = window.getSelection();
  const range = selection.rangeCount ? selection.getRangeAt(0) : null;

  let start = 0;
  if (range) {
    const preSelectionRange = range.cloneRange();
    preSelectionRange.selectNodeContents(div);
    preSelectionRange.setEnd(range.startContainer, range.startOffset);
    start = preSelectionRange.toString().length;
  }


  const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(escapedQuery, 'gi');


  const text = div.textContent;
  div.innerHTML = text.replace(regex, (match) => `<mark>${match}</mark>`);


  function setCaretPosition(el, chars) {
    if (chars >= 0) {
      let nodeStack = [el], node, foundStart = false, stop = false;
      let charCount = 0, nextCharCount;

      while (!stop && (node = nodeStack.pop())) {
        if (node.nodeType === 3) { // text node
          nextCharCount = charCount + node.length;
          if (!foundStart && chars <= nextCharCount) {
            const range = document.createRange();
            const sel = window.getSelection();
            range.setStart(node, chars - charCount);
            range.collapse(true);
            sel.removeAllRanges();
            sel.addRange(range);
            stop = true;
          }
          charCount = nextCharCount;
        } else {
          let i = node.childNodes.length;
          while (i--) {
            nodeStack.push(node.childNodes[i]);
          }
        }
      }
    }
  }

  setCaretPosition(div, start);
}
