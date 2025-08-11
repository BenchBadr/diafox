const md = window.markdownit().use(markdownitMathjax);


function markdown(text) {
    return md.render(text);
}

export { markdown };

MathJax.typesetPromise();
