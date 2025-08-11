import { highlight } from './highlight.js';


function sanitizeHtml(div) {
    const allowedTags = ['BR', 'MARK'];
    Array.from(div.childNodes).forEach(node => {
        if (node.nodeType === Node.ELEMENT_NODE && !allowedTags.includes(node.tagName)) {
            const textNode = document.createTextNode(node.textContent);
            div.replaceChild(textNode, node);
        }
    });
}

const highlightSkills = async (root) => {
    const skills = await getCookie('skills');
    const skillsNames = Object.keys(skills)

    for (const skill of skillsNames) {
        if (skill === 'undefined') {
            continue;
        }
        
        highlight(root, '/' + skill);
    }
}

const getSuggestions = (selection) => {
    const range = selection.getRangeAt(0);
    console.log(range.startContainer);
}



textarea.oninput = (event) => {
    const div = event.target;

    sanitizeHtml(div);

    highlightSkills(div)

    // highlight(div, 'test')

    const selection = window.getSelection();
    if (selection.isCollapsed) {
        getSuggestions(selection);
    }

    // Update send button state based
    const promptValue = div.textContent || '';
    if (promptValue.trim().length) {
        sendBtn.classList.remove('empty');
    } else {
        sendBtn.classList.add('empty');
    }
};
