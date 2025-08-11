/**
 * Highlight functionality for a contenteditable div
 * @param {HTMLElement} root - The contenteditable div
 * @param {string[]} queries - Array of queries to highlight
 */
export function highlight(div, queries) {
    if (!queries || queries.length === 0) return;

    const selection = window.getSelection();
    const range = selection.rangeCount ? selection.getRangeAt(0) : null;

    let start = 0;
    if (range) {
        const preSelectionRange = range.cloneRange();
        preSelectionRange.selectNodeContents(div);
        preSelectionRange.setEnd(range.startContainer, range.startOffset);
        start = preSelectionRange.toString().length;
    }

    let text = div.textContent;

    // Create combined regex for all queries
    const escapedQueries = queries.map(query => query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
    const combinedRegex = new RegExp(`(${escapedQueries.join('|')})`, 'gi');
    
    div.innerHTML = text.replace(combinedRegex, (match) => `<mark>${match}</mark>`);

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