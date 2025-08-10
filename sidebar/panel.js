const root = document.documentElement.style;

async function listTabs() {
  const tabs = await browser.tabs.query({}); // all tabs in all windows
  const ul = document.getElementById("tabs");

  tabs.forEach(tab => {
    const li = document.createElement("li");
    li.textContent = `${tab.title} — ${tab.url}`;
    ul.appendChild(li);
  });
}

listTabs();

function applyFirefoxTheme(theme) {
    console.log(browser.theme.getCurrent())
  if (theme.properties.color_scheme === 'dark') {
    root.setProperty("--bg", "var(--dark)");
    root.setProperty("--text", "var(--light)");
    root.setProperty("--high-bg", "var(--high-dark)");
  }
  
}

browser.theme.getCurrent().then(applyFirefoxTheme);

browser.theme.onUpdated.addListener((update) => {
  applyFirefoxTheme(update.theme);
});

