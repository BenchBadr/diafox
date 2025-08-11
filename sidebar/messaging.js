import { highlight } from './highlight.js';


const suggestions = document.querySelector('.suggestions');


/* Global variables */
let suggesting = 0;
let activeIdx = 0;

// to check later on whether to rerender or not suggestions list
let isNavigatingSuggestions = false;

// Store reference to the arrow handler for proper cleanup
let currentArrowHandler = null;


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

    // reversed so it matches bigger then smaller
    // preventing from breaking big matches with subsets
    const activeTabs = await browser.tabs.query({}).then(tabs => tabs.map(t => '@' + t.id).reverse());

    console.log(activeTabs, 'active tabs')
    const allHighlights = [...prefixedSkills, ...activeTabs];

        
    highlight(root, allHighlights);
}



/**
 * Retrieves suggestions whether it's a tab mention or skill
 * 
 * @param {*} selection 
 */
const getSuggestions = async (selection) => {
    suggestions.innerHTML = '';
    activeIdx = 0;

    const range = selection.getRangeAt(0);
    const current = range.startContainer.textContent.slice(0, range.startOffset).split(' ');
    const command = current[current.length - 1];

    let suggestingList = [];
    
    if (command.startsWith('/')) {
        suggestingList = await suggestSkills(command.slice(1));
    } else if (command.startsWith('@')) {
        suggestingList = suggestTabs(command.slice(1));
    }
    
    return suggestingList;
}

/**
 * Updates the active element
 * - Thiis is essentially meant to prevent complete 
 * - Rerender of suggestions on navigating
 * 
 */
const updateActiveSuggestion = () => {
    const suggestionElements = suggestions.querySelectorAll('.res-skill, .tab-results');
    suggestionElements.forEach((element, index) => {
        if (index === activeIdx) {
            element.classList.add('active');
            // Auto-scroll to the active suggestion
            element.scrollIntoView({ block: 'nearest' });
        } else {
            element.classList.remove('active');
        }
    });
}


const suggestSkills = async (query) => {
    const skills = await getCookie('skills');
    const skillsNames = Object.keys(skills);

    const suggestingList = [];

    skillsNames.forEach((skill) => {
        if (skill === 'undefined') return;

        if (skill.startsWith(query)) {
            const span = document.createElement('span');
            span.classList.add('res-skill');
            if (suggestingList.length === activeIdx) {
                span.classList.add('active');
            }

            span.textContent = skill;
            
            const currentIndex = suggestingList.length;
            span.onmousedown = (e) => {
                e.preventDefault();
                e.stopPropagation();
                activeIdx = currentIndex;
                insertSuggestion();
            };

            suggestions.appendChild(span);
            suggestingList.push('/' + skill);
        }
    });

    return suggestingList;
}

/**
 * Suggest tabs among the open ones
 * 
 */
const suggestTabs = async (query) => {
    const suggestingList = [];
    const tabs = await browser.tabs.query({});

    tabs.forEach((tab) => {
        if (tab.title.toLowerCase().includes(query.toLowerCase())) {
            const span = document.createElement('span');
            span.classList.add('tab-results');


            if (suggestingList.length === activeIdx) {
                span.classList.add('active');
            }

            const a = document.createElement('a');
            a.textContent = tab.title;
            span.appendChild(a);


            const icon = document.createElement('img');
            icon.src = tab.favIconUrl;
            span.prepend(icon);

            const currentIndex = suggestingList.length;
            span.onmousedown = (e) => {
                e.preventDefault();
                e.stopPropagation();
                activeIdx = currentIndex;
                insertSuggestion();
            };

            suggestions.appendChild(span);
            suggestingList.push('@' + tab.id);
        }
    });

    return suggestingList;
}

/**
 * Inserts the currently active suggestion into the textarea at the caret position.
 * - Ads a spce after the insertion
 */
const insertSuggestion = () => {
    if (!suggesting || !suggesting.length) return;

    const selection = window.getSelection();
    if (!selection.rangeCount) return;

    const range = selection.getRangeAt(0);
    const textNode = range.startContainer;
    const offset = range.startOffset;

    const text = textNode.textContent;
    const beforeCaret = text.slice(0, offset);
    const afterCaret = ' ' + text.slice(offset);
    const lastSpaceIdx = beforeCaret.lastIndexOf(' ');
    const commandStart = lastSpaceIdx === -1 ? 0 : lastSpaceIdx + 1;

    const inserted = suggesting[activeIdx];
    const newText =
        beforeCaret.slice(0, commandStart) +
        inserted +
        afterCaret;

    textNode.textContent = newText;
    const newOffset = commandStart + inserted.length + 1;

    const newRange = document.createRange();
    newRange.setStart(textNode, newOffset);
    newRange.collapse(true);
    selection.removeAllRanges();
    selection.addRange(newRange);

    // Clear suggestions
    suggesting = 0;
    isNavigatingSuggestions = false;
    activeIdx = 0;
    suggestions.innerHTML = '';

    // Remove arrow handler when suggestion is inserted
    if (currentArrowHandler) {
        textarea.removeEventListener('keydown', currentArrowHandler);
        currentArrowHandler = null;
    }

    // re-highlight
    highlightAll(textarea);
};


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


const logCaret = async (click) => {
    // clear active states
    if (click) {
        suggesting = [];
        isNavigatingSuggestions = false;
    }

    // Remove existing arrow handler if any
    if (currentArrowHandler) {
        textarea.removeEventListener('keydown', currentArrowHandler);
        currentArrowHandler = null;
    }

    // rerender suggestions
    if (!isNavigatingSuggestions) {
        const selection = window.getSelection();
        if (selection.isCollapsed) {
            suggesting = await getSuggestions(selection);
        }
    } else {
        updateActiveSuggestion();
    }

    if (suggesting.length) {
        const handleArrow = (e) => {
            if (e.key === 'ArrowUp') {
                e.preventDefault();
                isNavigatingSuggestions = true;
                activeIdx = (activeIdx - 1 + suggesting.length) % suggesting.length;
                updateActiveSuggestion();
            } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                isNavigatingSuggestions = true;
                activeIdx = (activeIdx + 1) % suggesting.length;
                updateActiveSuggestion();
            } else if (e.key === 'Enter') {
                e.preventDefault();
                insertSuggestion();
            } 
        };
        
        // Store reference to the handler for proper cleanup
        currentArrowHandler = handleArrow;
        textarea.addEventListener('keydown', handleArrow);
    }
}


textarea.addEventListener('keyup', () => logCaret());
textarea.addEventListener('click', () => logCaret(true));


