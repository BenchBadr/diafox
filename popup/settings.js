
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

    console.log('ACCENT',accent)

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


