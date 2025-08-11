
/** Get {favicon, title, url} based on tab ID
 * 
 * @param {string} tabId 
 * @returns {json}
 */
async function getTabInfo(tabId) {
  const tab = await browser.tabs.get(Number(tabId));
  return {
    faviconUrl: tab.favIconUrl || null,
    title: tab.title || '',
    url: tab.url.split('://')[1] || ''
  };
}


/**
 * Add context card
 */
const addCtxCard = async (id) => {
    const containerCtx = document.querySelector('.ctx-cards');

    const data = await getTabInfo(id);

    const card = document.createElement('div');

    const img = document.createElement('img');
    img.src = data.faviconUrl;

    img.classList.add('ctx-favicon');
    card.appendChild(img);

    const wrapText = document.createElement('div');


    const span = document.createElement('span');
    span.textContent = data.title;
    wrapText.append(span);

    const a = document.createElement('a');
    a.textContent = data.url;
    wrapText.append(a);

    card.append(wrapText);

    card.classList.add('ctx-card');
    containerCtx.prepend(card);
}



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


        // Take care of ctxCards only for queries that are actually in the text
        // destroy to avoid @5 to match becauseof @59
        // already reversed big numbers first so it works
        const containerCtx = document.querySelector('.ctx-cards');
        let toDestroy = div.textContent;
        containerCtx.innerHTML = '';
        for (const query of queries) {
            if (query.startsWith('@')) {
            const regex = new RegExp(query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
            const match = regex.exec(toDestroy);
            if (match) {
                addCtxCard(query.slice(1));
                toDestroy = toDestroy.slice(0, match.index) + toDestroy.slice(match.index + match[0].length);
            }
            }
        }
    }

    setCaretPosition(div, start);
}