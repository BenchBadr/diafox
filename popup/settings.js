
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

makeAccents();


const handleChange = (event) => {
    console.log('blblbl', event.target.value)
    setCookie('instructions', event.target.value);
}


async function initInstructions()  {
    const instructions = await getCookie('instructions');
    if (instructions) {
        document.querySelector("#instructions").value = instructions;
    }
}

initInstructions();

document.querySelector("#instructions").addEventListener('input', handleChange);


/* 

==============
SKILL HANDLING
==============

*/


const createSkill = (title, instructions) => {
    const skillDiv = document.createElement('div');
    skillDiv.className = 'skills';

    // Label with checkbox
    const label = document.createElement('label');
    label.textContent = title ? title : 'New skill';

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    label.appendChild(checkbox);

    const deleteBtn = document.createElement('a');
    deleteBtn.classList.add('delete');
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
    nameInput.placeholder = '/my-skill';
    nameInput.value = title || '';
    skillContent.appendChild(nameInput);

    // Instructions
    const instrA = document.createElement('a');
    instrA.textContent = 'Instructions';
    skillContent.appendChild(instrA);

    const textarea = document.createElement('textarea');
    textarea.placeholder = 'No more than three paragraphs and more narrative than informational.';
    textarea.value = instructions ? instructions : '';
    skillContent.appendChild(textarea);

    // Assemble
    skillDiv.appendChild(label);
    skillDiv.appendChild(skillContent);

    return skillDiv;
}


const loadSkills = async () => {


    const container = document.querySelector('#skill-container');

    container.appendChild(createSkill('test', 'hello'));
}

loadSkills();