import { highlight } from './highlight.js';


const suggestions = document.querySelector('.suggestions');

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



/**
 * Retrieves suggestions whether it's a tab mention or skill
 * 
 * @param {*} selection 
 */
const getSuggestions = (selection) => {
    suggestions.innerHTML = '';
    
    const range = selection.getRangeAt(0);
    const current = range.startContainer.textContent.slice(0, range.startOffset).split(' ');
    const command = current[current.length - 1];

    console.log('commands',command)
    
    if (command.startsWith('/')) {
        suggestSkills(command.slice(1));
    }
}


const suggestSkills = async (query) => {
    const skills = await getCookie('skills');
    const skillsNames = Object.keys(skills)

    skillsNames.forEach(skill => {
        if (skill === 'undefined') return;
        console.log('QS',query,skill)
        if (skill.startsWith(query)) {
            const span = document.createElement('span');
            span.classList.add('res-skill')
            span.textContent = skill;
            suggestions.appendChild(span);
        }
    });
}


textarea.oninput = (event) => {
    const div = event.target;

    sanitizeHtml(div);

    highlightSkills(div)

    // highlight(div, 'test')


    // Update send button state based
    const promptValue = div.textContent || '';
    if (promptValue.trim().length) {
        sendBtn.classList.remove('empty');
    } else {
        sendBtn.classList.add('empty');
    }
};


const logCaret = () => {
    console.log('caret moved')

    // renew / clear suggestions
    const selection = window.getSelection();
    if (selection.isCollapsed) {
        getSuggestions(selection);
    }
}


textarea.addEventListener('keyup', logCaret);
textarea.addEventListener('click', logCaret);
