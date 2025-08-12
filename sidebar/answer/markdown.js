
const md = window.markdownit({
    highlight: function (code, lang) {
        const langAlt = lang && Prism.languages[lang] ? lang : 'text';


        return `<div class='codeblock-bar'>Code • ${langAlt}</div>` + 
        `<pre class="language-${langAlt}"><code class="language-${langAlt}">` +
        Prism.highlight(code, Prism.languages[langAlt], langAlt) +
        `</code></pre>`;
    }
}).use(markdownitMathjax);;

function markdown(text) {
    return md.render(text);
}

export { markdown };

MathJax.typesetPromise();
