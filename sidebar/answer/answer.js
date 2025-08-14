import { markdown } from "./markdown.js";
import Chat from "./inference.js";

const experts = {}
const tabsData = new Set();

// Creating main inference
const mainInf = new Chat(
    'main',
    '', // No additional ctx for sys prompt as tab data provided with each msg
    {}

);

const sendAnswer = async (ctxIds, prompt) => {
    const msgs = document.querySelector('.msgs');
    const newDiv = document.createElement('div');
    newDiv.className = 'markdown-body';
    msgs.appendChild(newDiv);
    const taskDiv = document.createElement('div');
    newDiv.appendChild(taskDiv);

    const ansDiv = document.createElement('div');
    newDiv.appendChild(ansDiv);
    

    // Creating agents
    for (const ctxId of ctxIds) {
        const tabData = await retrieveTab(ctxId, taskDiv);
        if (!tabData) {
            continue;
        }
        tabsData.add(`- ID(${tabData.id}) - [${tabData.title}](tabData.url)`);
        experts[tabData.id] = new Chat(
            tabData.url.includes('youtube.com') ? 'youtube ': 'tabs',
            tabData.text // additional ctx added to system prompt - here: tab text / transcript
        )
    }

    // Update experts for main inference
    mainInf.updateExperts(experts);




    let streamedAnswer = '';
    await mainInf.chat(Array.from(tabsData).join('\n') + '\n === \n' + prompt, (chunk) => {
        streamedAnswer += chunk;
        ansDiv.innerHTML = markdown(streamedAnswer);
    });

    await postProc(newDiv, msgs);
}

export default sendAnswer;

/** Create task - basically construct div associated with the task
 * - Returns this same div to allow it to be changed after
 * 
 */
const createTask = (url, newDiv, icon = 'ads_click') => {
    const divTask = document.createElement('div');
    divTask.className = 'task-container';

    const assist = document.createElement('div');
    assist.style.setProperty('--icon',icon);
    assist.className = 'assist';

    const desc = document.createElement('div');
    desc.className = 'loading-text';
    desc.textContent = url;

    divTask.appendChild(assist);
    divTask.appendChild(desc);

    newDiv.appendChild(divTask);

    return divTask
}


/** Retrieves tab text content, handling done in background.js
 * 
 * @param {Number} tabIdAlt 
 */
const retrieveTab = async (tabIdAlt, newDiv) => {

    const tabId = Number(tabIdAlt);
    const tab = await browser.tabs.get(tabId);

    const divTask = createTask(tab.url, newDiv);

    const response = await browser.runtime.sendMessage({
        type: "getTabContent",
        tab:tab
    });
  if (response && response.text) {
    const text = response.text;

    // Succeed!
    divTask.classList.add('done')

    return {title: tab.title, url:tab.url, text:text, id:tabIdAlt};
  } else {
    // Failed!
    divTask.classList.add('done')
    divTask.classList.add('fail')
  }

  return null;
}



/** Does all the post-processing
 * 
 * @param {*} newDiv 
 * @param {*} msgs 
 */
const postProc = async (newDiv, msgs) => {

    // For scrolling fix
    msgs.style.paddingBottom = 
        (parseInt(getComputedStyle(msgs).paddingBottom || 0, 10) - newDiv.offsetHeight) + "px";

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
