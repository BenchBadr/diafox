import { markdown } from "./markdown.js";


const sendAnswer = async (ctxIds) => {
        const msgs = document.querySelector('.msgs');
        const newDiv = document.createElement('div');
        newDiv.className = 'markdown-body';

         await browser.runtime.sendMessage({ action: "inject", tabId: Number(ctxIds[0]) });

        newDiv.innerHTML = markdown(`
# Well...
            `);
        msgs.appendChild(newDiv);
        msgs.style.paddingBottom = 
            (parseInt(getComputedStyle(msgs).paddingBottom || 0, 10) - newDiv.offsetHeight) + "px";

        await postProc();
}

export default sendAnswer;



const postProc = async () => {

    // Create events for all the copy btns
    document.querySelectorAll('.cb-copy').forEach(el => {
        el.addEventListener('click', function () {
            const code = el.parentElement.parentElement.querySelector('pre > code').textContent;
            if (code) {
                navigator.clipboard.writeText(code);
            }
            el.classList.add('active');
            setTimeout(() => {
                el.classList.remove('active');
            }, 1500);
        });
    });

    document.querySelectorAll('.ctx-card').forEach(el => {
        el.addEventListener('click', async function () {
            await browser.tabs.update(Number(el.getAttribute('data-id')), { active: true });
        });
    });



    // Rneder latex expressions
    MathJax.typesetPromise()
}
