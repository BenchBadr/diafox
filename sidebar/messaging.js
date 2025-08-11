function sendMsg(content) {
    textarea.placeholder = 'Ask another question...';

    const msgDiv = document.createElement('div');
    msgDiv.className = 'msg-user';
    msgDiv.textContent = content;
    document.querySelector('.msgs').appendChild(msgDiv);
}


document.querySelector('.send-btn').onclick = function() {
    const content = textarea.value;
    const msgDiv = sendMsg(content);
    textarea.value = '';
};