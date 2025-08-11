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
        const regex = new RegExp(`^\\/(${skill})\\b`, 'i');
        if (regex.test(root.textContent)) {
            highlight(root, '/' + skill);
        }
    }
}



textarea.oninput = (event) => {
    const div = event.target;

    sanitizeHtml(div);

    highlightSkills(div)

    // highlight(div, 'test');

    // Update send button state based
    const promptValue = div.textContent || '';
    if (promptValue.trim().length) {
        sendBtn.classList.remove('empty');
    } else {
        sendBtn.classList.add('empty');
    }
};
