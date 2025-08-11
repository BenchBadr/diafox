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
    }
};


function sanitizeHtml(div) {
    const allowedTags = ['BR'];
    Array.from(div.childNodes).forEach(node => {
        if (node.nodeType === Node.ELEMENT_NODE && !allowedTags.includes(node.tagName)) {
            const textNode = document.createTextNode(node.textContent);
            div.replaceChild(textNode, node);
        }
    });
}

function highlight(div, word) {
    sanitizeHtml(div);
    const text = div.textContent;
    if (!word) return;
    const regex = new RegExp(`(${word})`, 'gi');
    const highlightedHTML = text.replace(regex, '<mark>$1</mark>');
    div.innerHTML = highlightedHTML;
}



textarea.oninput = (event) => {
    const div = event.target;

    sanitizeHtml(div)

    // Update send button state based
    const promptValue = div.textContent || '';
    if (promptValue.trim().length) {
        sendBtn.classList.remove('empty');
    } else {
        sendBtn.classList.add('empty');
    }
};
