
const accentsDiv = document.querySelector('.accents');

const accentColors = [
    'white',
    'green',
    'blue',
    'purple',
    'gold',
    'pink',
    'red',
    'orange'
];


/**
 * Ths function loads all possible colors using the array `accentColors`
 * Displays them and add their respective click event and highlight current accent
 * 
 * @returns {void}
 */
async function makeAccents() {
    const accent = await getCookie('accent');

    accentColors.forEach(color => {
        const span = document.createElement('span');

        if (!accent && color === 'white' || color === accent) {
            span.className = `accent active`
        } else {
            span.className = `accent`;
        }
        span.style.backgroundColor = `var(--accent-${color})`;
        span.style.color = `var(--accent-${color})`;

        span.addEventListener('click', () => {
            setCookie('accent', color);
            

            document.querySelectorAll('.accent').forEach(el => {
                el.classList.remove('active');
            });

            root.setProperty('--accent', `var(--accent-${color})`);
            

            span.classList.add('active');
        });

        accentsDiv.appendChild(span);
    });
}



/**
 * This function handle input change of instructions textarea
 * On each change update associated local storage
 * 
 * @returns {void}
 */
const handleChange = (event) => {
    setCookie('instructions', event.target.value);
}



/**
 * Initialize instructions, if exists loads it into the textarea
 * To allow the user to edit it
 * 
 * @returns {void}
 */
async function initInstructions()  {
    const instructions = await getCookie('instructions');
    if (instructions) {
        document.querySelector("#instructions").value = instructions;
    }
}


// create accents colors circles
makeAccents();

// initialize instructions textarea
initInstructions();

// add click event properly as onclick is forbidden
document.querySelector("#instructions").addEventListener('input', handleChange);


/* 

==============
SKILL HANDLING
==============

*/



/**
 * Skill element that works like an accordion to edit
 *  - A label with the skill title and a checkbox (to toggle).
 *  - A delete button to remove the skill.
 *  - An input for editing the skill name.
 *  - A textarea for editing the skill instructions.
 *
 * @param {string} [title] - If not provided or 'undefined', defaults to 'New skill'.
 * @param {string} [instructions] - The instructions for the skill. If not provided, textarea is empty.
 * @returns {HTMLDivElement} The constructed skill element.
 */
const createSkill = (title, instructions) => {
    const skillDiv = document.createElement('div');
    skillDiv.className = 'skills';

    // Label with checkbox
    const label = document.createElement('label');
    const labelText = document.createElement('span');
    labelText.className = 'label-text';
    labelText.textContent = title && title !== 'undefined' ? title : 'New skill';
    label.appendChild(labelText);

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    label.appendChild(checkbox);

    const deleteBtn = document.createElement('a');
    deleteBtn.classList.add('delete');
    deleteBtn.addEventListener('click', async (e) => {
        e.stopPropagation();
        skillDiv.remove(); 
        deleteSkill(title);
    });
    label.append(deleteBtn);

    // Skill content
    const skillContent = document.createElement('div');
    skillContent.className = 'skill-content';

    // Name
    const nameA = document.createElement('a');
    nameA.textContent = 'Name';
    skillContent.appendChild(nameA);

    const nameInput = document.createElement('input');
    nameInput.type = 'text';
    nameInput.dataset.originalTitle = title;
    nameInput.addEventListener('input', (event) => handleSkillChange(event, title));
    nameInput.value = title && title !== 'undefined' ? '/' + title : '/';
    skillContent.appendChild(nameInput);

    // Instructions
    const instrA = document.createElement('a');
    instrA.textContent = 'Instructions';
    skillContent.appendChild(instrA);

    const textarea = document.createElement('textarea');
    textarea.placeholder = 'No more than three paragraphs and more narrative than informational.';
    textarea.value = instructions ? instructions : '';
    textarea.addEventListener('input', async (event) => handleInstructionArea(event));
    skillContent.appendChild(textarea);

    // Assemble
    skillDiv.appendChild(label);
    skillDiv.appendChild(skillContent);

    return skillDiv;
}


/**
 * Handles changes to the skill name input field.
 * - Sanitizes and formats the new skill title. (alphanumeric + dashes)
 * - Handle and block duplicate saving
 * - Update storage
 * - Update UI
 *
 * @async
 * @param {Event} event - input event
 * @returns {Promise<void>}
 */
const handleSkillChange = async (event) => {
    let newTitle = event.target.value;
    if (newTitle.startsWith('/')){
        newTitle = newTitle.slice(1);
    }

    newTitle = newTitle.replaceAll(' ', '-');
    newTitle = newTitle.replace(/[^a-zA-Z0-9-]/g, '').toLowerCase();

    const title = event.target.dataset.originalTitle;

    event.target.style.borderColor = 'var(--text-op)';
    if (newTitle !== title && await isInSkills(newTitle)) {
        event.target.style.borderColor = 'red';
        return;
    } else {

        await deleteSkill(title);

        // Update skill container name
        const skillCont = event.target.parentElement.parentElement;
        const labelText = skillCont.querySelector('.label-text');
        if (labelText) {
            labelText.textContent = newTitle || 'New title';
        }

        const instructions = skillCont.querySelector('textarea').value;

        await updateSkills(newTitle, instructions);
        event.target.dataset.originalTitle = newTitle; 
    }

    event.target.value = '/' + newTitle;
}

const handleInstructionArea = async (event) => {
    // Get active title
    const skillCont = event.target.parentElement.parentElement;
    const title = skillCont.querySelector('input[type=text]').value;
    if (title === '/') {
        await updateSkills(undefined, event.target.value);
    } else {
        await updateSkills(title.slice(1), event.target.value);
    }
}

const loadSkills = async () => {
    const skills = await getCookie('skills');

    const container = document.querySelector('#skill-container');

    skills ? Object.entries(skills).forEach(([title, instructions]) => {
        container.prepend(createSkill(title, instructions))
    }) : null
}



const updateSkills = async (title, instructions) => {
    let skills = await getCookie('skills');
    if (!skills) {
        skills = {};
    }
    skills[title] = instructions;
    setCookie('skills', skills);
}

const isInSkills = async (title) => {
    const skills = await getCookie('skills');
    if (!skills) return false;
    return Object.prototype.hasOwnProperty.call(skills, title);
};

const deleteSkill = async (title) => {
    let skills = await getCookie('skills');
    if (!skills) return;
    delete skills[title];
    setCookie('skills', skills); 
};

const canDraft = async () => {
    const skills = await getCookie('skills');
    if (!skills) {
        return true;
    }

    if (Object.keys(skills).includes("undefined")) {
        return false;
    }

    return true;
}

const newSkill = async () => {
    const container = document.querySelector('#skill-container');
    if (await canDraft()){
        updateSkills();
        container.prepend(createSkill());
    }
}


// Initialize skills
loadSkills();

// onClick = newSkill
document.querySelector('.create-skill').addEventListener('click', newSkill);