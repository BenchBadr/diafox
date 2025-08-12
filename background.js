browser.runtime.onMessage.addListener(async (message, sender) => {
  if (message.type === "getTabContent" && message.tabId) {
    try {
        const tab = await browser.tabs.get(message.tabId);

        // YouTube Logic
        if (tab.url.includes("youtube.com")) {
            const [{ result }] = await browser.scripting.executeScript({
                target: { tabId: message.tabId },
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
        
        // PDF Handling
        } else if (tab.url.endsWith('.pdf')) {
            //  document.querySelector('.pdfViewer').textContent 
            return { text: null };
        // Regular scrape
        } else {
            const [{ result }] = await browser.scripting.executeScript({
                target: { tabId: message.tabId },
                func: () => {
                    // Default logic for other sites
                    return document.documentElement.innerText;
                },
            });
            return { text: result };
        }
      return { text: result };
    } catch (err) {
      console.error("Error getting tab content:", err);
      return { html: null, error: err.message };
    }
  }
});



