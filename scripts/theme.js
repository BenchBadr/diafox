const root = document.documentElement.style;


function setCookie(name, value, days = 365) {
  let data = {};
  data[name] = value;
  return browser.storage.local.set(data);
}

function getCookie(name) {
  return browser.storage.local.get(name)
    .then(result => {
      const value = result[name];
      return value;
    })
    .catch(error => {
      console.error("Error reading setting:", error);
      return null;
    });
}

async function applyFirefoxTheme(theme) {
  if (theme.properties.color_scheme === 'dark') {
    root.setProperty("--bg", "var(--dark)");
    root.setProperty("--text", "var(--light)");
    root.setProperty("--high-bg", "var(--high-dark)");
    root.setProperty("--accent-white", "#fafafa");
  }

  const accent = await getCookie('accent');

  if (accent) {

    root.setProperty('--accent', `var(--accent-${accent})`);
  }
  
}

browser.theme.getCurrent().then(applyFirefoxTheme);

browser.theme.onUpdated.addListener((update) => {
  applyFirefoxTheme(update.theme);
});


// automatically setto false on first msg sent
let firstMsg = true;

