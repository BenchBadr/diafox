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



# I. Check-list



## 1. Appearance

- [x] Toggle sidebar with `Cmd/Ctrl`+`Shift` + `E`
- [x] Skill auto-suggest
- [x] Tabs auto-suggest
- 1.1 Markdown
    - [x] Basic `markdown-it`
    - [x] LaTeX with MathJax
    - [x] CodeBlocks
        - [x] Rendering
        - [x] Toolbar with lang and copy btn
- [ ] Make stop button functionnal

## 2. Customization

- [x] Change accent color
- [x] Custom instructions
- [x] Create and save skills

## 3. Functionnalities

- [x] @mention tabs to add context
- [x] Get Youtube transcripts
- [ ] Chat with PDFs
- [ ] Model switcher
- [ ] Retrieve skill instructions on demand
- [ ] Load custom instructions in system prompt

## 4. Agentic capabilities

- [x] Create an expert for each tab
- [x] "Pro" mode when context is needed (inspired by Perplexity)
    - [x] Show logs of chat between main inference and experts
- [ ] Perform web searches on its own
- [ ] Operator to perform physical actions through tool calling

## 5. Distant future

- [ ] Use session token of AI chat services to retrieve answer
- [ ] Use local inferences with ollama


# II. Agentic capabilities


## 1. The "Thinking" mode

For each context that you attach (tabs), the tasks are splitted into multiple inferences which each inference being specialized into the tabs its given. 

Let's say... you attached three tabs. No matter how long is the context, the main inference will not read them but outsource to other agents as length of tab content can be increasingly long.

In other words, the model you're chatting with will chat with the tabs to receive the relevant informations, this could be compared as an aggressive form of chunking.

Inferences will only interact in the thinking step as the main inference identifies the needs and delegates in the thinking task.

This delegation itself is done with some tool-calling techniques.

```mermaid
graph TD;
    A["Main Inference"] <--> B["YouTube"]
    A <--> C["Wikipedia"]
    A <--> D["Docs"]
```

## 2. Interactions between inferences - *Self-brainstorming*

> This is an in-progress section

Maybe you attached a bunch of tabs but none of them are required to answer. If you ask the main inference "Hello, how are you?" there is no need to look up for informations.

The main inference is provided with the names of the tabs it has access to and their respective identifier (tab id according to `browser.tabs`). If tab 28 is a YouTube video called "Where is the tomb of Alexander the Great ? | Youtube" and the user asks something related to the tomb then main inference will send a message as following:
- #28 Informations about the tomb of Alexander Great

Because of the answer starting with #, this will not mark answering state as finished, rather toggle the thinking state (visually as well). The client, receiving this answer will not only toggle the thinking mode but also send the prompt agent associated to the tab (which will already know how to compose answer, with some particularities like YouTube having special instruction to try and quote to the maximum and reference timestamp).

Answer of the agent will be sent as "user" and main inference can ask other questions, to this agents or others.

As soon as the first message not starting with `#` is sent, thinking mode is exited and the AI starts answering. 

> One difficulty I may encounter is handling these answer specifics with `stream` enabled...

## 3. Update - it works

## 1. YouTube example

<img src="assets/youtube.png">

### A little excerpt of the "Thinking process"

<img src=assets/youtube2.png>

## 2. Think wisely!

<img src=assets/think.png>

When answer is obvious using tabs titles or the main inference does not feel like there is need to get deeper: it will not. Which means: it will not initiate the experts but the text of the tabs is stored in case another question comes as a follow-up and requires deeper knowledge.


# III. Pictures previews

What is it | Light mode | Dark Mode |
| - | - | - |
Appearance editor| <img src=assets/image.png> | <img src=assets/image2.png>
Tabs mentionned | <img src=assets/image3.png> |  <img src=assets/image4.png>
Tabs selector | <img src=assets/image5.png> | <img src=assets/image7.png>
Skill selector | <img src=assets/image6.png> |  <img src=assets/image8.png> 



# IV. Test it yourself!

## 1. Installation

```
git clone https://github.com/BenchBadr/diafox
```

Then, on your browser, head to `aboug:debugging`
- On the sidebar, there are two options
    - Setup
    - This Firefox (or This Zen on Zen Browser)

Click on it then click on `Load Temporary Addon`. Upload any file in the folder of DiaFox and voila, your extension will work.

You can then toggle it with `Cmd/Ctrl` + `Shift` + `E` and customize it by clicking on the icon in the extensions manager. 

By default it will use `GPT 4.1` through Pollinations as it is the best option provided for free and has a large context window. Rates are also very permissive, you can send up to 1 concurrent message with a 3 second interval. 

I hope you enjoy it! I am not publishing it as a Firefox addon for now as it may still have little bugs but it should be there as soon as I'd have enough feedback.

## 2. Troubleshooting

> This section is to be filled as I receive questions

## 3. Notice

Please keep in mind that this was developed in a very short time (4 days) so you may notice some bugs. If you do please submit them as Issues.

Also, you are free to open PRs if you want to add something!