
browser.runtime.onMessage.addListener(async (message, sender) => {
  if (message.type === "getTabContent" && message.tabId) {
    try {
      const [{ result }] = await browser.scripting.executeScript({
        target: { tabId: message.tabId },
        func: () => document.documentElement.innerText,
      });
      return { text: result };
    } catch (err) {
      console.error("Error getting tab content:", err);
      return { html: null, error: err.message };
    }
  }
});
