browser.runtime.onMessage.addListener(async (message, sender) => {
  if (message.type === "getTabContent" && message.tab) {
    try {
        const tab = message.tab;



        // YouTube Logic
        if (tab.url.includes("youtube.com")) {
            const [{ result }] = await browser.scripting.executeScript({
                target: { tabId: tab.id },
                func: () => {
                    // Artifically open transcripts
                    document.querySelector("#primary-button .ytd-video-description-transcript-section-renderer .yt-spec-button-shape-next--outline .yt-spec-touch-feedback-shape__fill").click() 
                    return new Promise(resolve => {
                        setTimeout(() => {
                            const transCont = document.querySelector("#segments-container");
                            resolve(transCont ? transCont.innerText : "");
                        }, 2000);
                    });
                },
            });
            return { text: result };
        



        // PDF Handling : TODO
        } else if (tab.url.endsWith('.pdf')) {
            //  document.querySelector('.pdfViewer').textContent 
            return { text: null };


        // Regular scrape
        } else {
            const [{ result }] = await browser.scripting.executeScript({
                target: { tabId: tab.id },
                func: () => {
                    // Default logic for other sites
                    return document.documentElement.innerText;
                },
            });
            return { text: result };
        }
    } catch (err) {
      console.error("Error getting tab content:", err);
      return { text: null};
    }
  }
});



