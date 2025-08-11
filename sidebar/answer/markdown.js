
const md = window.markdownit({
  highlight: function (code, lang) {
    if (lang && Prism.languages[lang]) {
      // Highlight code with Prism and wrap in <pre><code>
      return `<pre class="language-${lang}"><code class="language-${lang}">` +
        Prism.highlight(code, Prism.languages[lang], lang) +
        `</code></pre>`;
    } else {
      // Use plain escaped code if no language specified
      return `<pre><code>` + md.utils.escapeHtml(code) + `</code></pre>`;
    }
  }
}).use(markdownitMathjax);;

function markdown(text) {
    return md.render(text);
}

export { markdown };

MathJax.typesetPromise();
