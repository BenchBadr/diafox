<p align="center">
<img src="icons/icon_big.png" width="100px" max-width='100%'>
<h1 align="center" style="border:none">DiaFox</h1>
</p>


# Introduction

You probably heard of [Arc Browser](https://arc.net) ? It was nice but today it is slowly dying and **The Browser Company** shifted their focus into their new browser, [Dia Browser](https://diabrowser.com), their AI-oriented browser. But we are all disappointed as it lacks all the features we loved in Arc (vertical sidebar, folders, workspaces...) and, not only there are privacy concerns and... sooner or later it will introduce a Pro subscription while still being in beta.

Besides the criticism, the UI of Dia is enjoyable and the AI tools can be useful if paired with a good usage of skills (slash commands). The new browser of [Perplextiy](https://pplx.ai), Comet is taking a similar approach with an AI right-sidebar that you can open and has all the context it needs from the current page. 

Lately, I've been used [Zen Browser](https://github.com/zen-browser/desktop) which already has a lot of features I loved from Arc and will soon introduce folders in a similar way to Arc, a private, free and fully open-source browser based on Firefox engine and I wish I could bring the `Cmd`+`E` sidebar as easily as in Dia. So I decided to make it myself.

AI features be in all browsers and DiaFox is meant to bring these beloved features to Firefox-based browsers using the amazing free and private API of [pollinations.ai](https://pollinations). 

Below a check-list of the development progress.


# Check-list



## 1. Appearance

- [x] Toggle sidebar with `Cmd/Ctrl`+`Shift` + `E`
- [x] Skill auto-suggest
- [x] Tabs auto-suggest
- 1.1 Markdown
    - [x] Basic `markdown-it`
    - [x] LaTeX with MathJax
    - [ ] CodeBlocks
        - [ ] Rendering
        - [ ] Toolbar with lang and copy btn

## 2. Customization

- [x] Change accent color
- [x] Custom instructions
- [x] Create and save skills

## 3. Functionnalities

- [x] @mention tabs to add context
- [ ] Chat with Youtube
- [ ] Chat with PDFs
- [ ] Model switcher
- [ ] Agentic capabilities (Tool-calling)


## 4. Distant future

- [ ] Use session token of AI chat services to retrieve answer
- [ ] Use local inferences with ollama

# Status

*In early development*