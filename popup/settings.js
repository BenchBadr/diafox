
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