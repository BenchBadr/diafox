function markdownitMathjax(md) {
  function math_inline(state, silent) {
    const pos = state.pos;
    if (state.src[pos] !== "$") return false;
    const match = state.src.slice(pos).match(/^\$(.+?)\$/);
    if (!match) return false;
    if (!silent) {
      const token = state.push("math_inline", "", 0);
      token.content = match[1];
    }
    state.pos += match[0].length;
    return true;
  }

  function math_block(state, startLine, endLine, silent) {
    const pos = state.bMarks[startLine] + state.tShift[startLine];
    const max = state.eMarks[startLine];
    if (state.src.slice(pos, pos + 2) !== "$$") return false;

    let nextLine = startLine + 1;
    while (nextLine < endLine) {
      const linePos = state.bMarks[nextLine] + state.tShift[nextLine];
      if (state.src.slice(linePos, linePos + 2) === "$$") break;
      nextLine++;
    }
    if (nextLine === endLine) return false;
    if (silent) return true;

    const content = state.getLines(startLine + 1, nextLine, state.tShift[startLine], true);
    const token = state.push("math_block", "", 0);
    token.block = true;
    token.content = content.trim();
    token.map = [startLine, nextLine + 1];
    state.line = nextLine + 1;
    return true;
  }

  md.inline.ruler.after("escape", "math_inline", math_inline);
  md.block.ruler.after("blockquote", "math_block", math_block);

  md.renderer.rules.math_inline = (tokens, idx) => `\\(${tokens[idx].content}\\)`;
  md.renderer.rules.math_block = (tokens, idx) => `\\[${tokens[idx].content}\\]`;
}

