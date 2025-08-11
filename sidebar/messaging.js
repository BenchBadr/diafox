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

const highlightAll = async (root) => {
    const skills = await getCookie('skills');
    const skillsNames = Object.keys(skills)
    const prefixedSkills = skillsNames.map(skill => '/' + skill);

    const allHighlights = [...prefixedSkills];

        
    highlight(root, allHighlights);
}



/**
 * Retrieves suggestions whether it's a tab mention or skill
 * 
 * @param {*} selection 
 */
const getSuggestions = (selection, activeIdx) => {
    suggestions.innerHTML = '';

    const range = selection.getRangeAt(0);
    const current = range.startContainer.textContent.slice(0, range.startOffset).split(' ');
    const command = current[current.length - 1];

    let suggesting = false;
    
    if (command.startsWith('/')) {
        suggesting = suggestSkills(command.slice(1), activeIdx);
    }
    
    return suggesting;
}


const suggestSkills = async (query, activeIdx) => {
    const skills = await getCookie('skills');
    const skillsNames = Object.keys(skills);

    let suggesting = 0;

    skillsNames.forEach((skill, index) => {
        if (skill === 'undefined') return;

        if (skill.startsWith(query)) {
            const span = document.createElement('span');
            span.classList.add('res-skill');
            if (index === activeIdx) {
                span.classList.add('active');
            }

            span.textContent = skill;
            suggestions.appendChild(span);

            suggesting++;
        }
    });

    return suggesting;
}


textarea.oninput = (event) => {
    const div = event.target;

    sanitizeHtml(div);

    highlightAll(div)


    // Update send button state based
    const promptValue = div.textContent || '';
    if (promptValue.trim().length) {
        sendBtn.classList.remove('empty');
    } else {
        sendBtn.classList.add('empty');
    }
};


let suggesting = 0;
let activeIdx = 0;

const logCaret = async () => {
    // renew / clear suggestions
    const selection = window.getSelection();
    if (selection.isCollapsed) {
        suggesting = await getSuggestions(selection, activeIdx);
    }

    if (suggesting) {
        const handleArrow = (e) => {
            if (e.key === 'ArrowUp') {
                e.preventDefault();
                activeIdx = (activeIdx + 1) % suggesting;
            }

            if (e.key === 'ArrowDown') {
                e.preventDefault();
                activeIdx = (activeIdx + 1) % suggesting;
            }
            console.log(activeIdx, suggesting)
        };
        textarea.addEventListener('keydown', handleArrow, { once: true });
    }
}


textarea.addEventListener('keyup', logCaret);
textarea.addEventListener('click', logCaret);
