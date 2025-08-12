import { markdown } from "./markdown.js";


const sendAnswer = async (ctxIds) => {
    return new Promise(async (resolve, reject) => {
        const msgs = document.querySelector('.msgs');

        try {
            const newDiv = document.createElement('div');
            newDiv.className = 'markdown-body';

            newDiv.innerHTML = markdown(`
~~~python
print("Hello world")
if test:
  idk
then
   something cool happens
~~~

And

~~~
basic text "hello" basic text "hello" basic text "hello" basic text "hello" basic text "hello" basic text "hello"
~~~

Finally \`python\` and $5x$
                `);
            msgs.appendChild(newDiv);
            msgs.style.paddingBottom = 
                (parseInt(getComputedStyle(msgs).paddingBottom || 0, 10) - newDiv.offsetHeight) + "px";

            postProc();
        } catch (err) {
            reject(err);
        }
    });
}

export default sendAnswer;


// Returns the inner text of the tab's body, or null if not found.
// const retrieveTab = async (tabId) => {
//     try {
//         const tabs = await browser.tabs.query({});
//         const tab = tabs.find(t => t.id === tabId);
//         if (!tab) return null;
//         const results = await browser.tabs.executeScript(tabId, {
//             code: "document.body.innerText"
//         });
//         return results && results[0] ? results[0] : null;
//     } catch (err) {
//         return null;
//     }
// };


const postProc = () => {

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



    // Rneder latex expressions
    MathJax.typesetPromise()
        .then(() => resolve())
        .catch(err => {
            console.error(err);
            reject(err);
    });
}
