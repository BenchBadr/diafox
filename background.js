browser.runtime.onMessage.addListener(async (msg, sender) => {
  if (msg.action === "inject" && msg.tabId) {
    try {
      await browser.scripting.executeScript({
        target: { tabId: msg.tabId },
        func: () => alert('Hello from extension!')
      });
      return { success: true };
    } catch (e) {
      return { success: false, error: e.message };
    }
  }
});