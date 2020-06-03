let blacklist = [];
const IS_FIREFOX = navigator.userAgent.includes("Firefox");

chrome.storage.local.get(["blacklist"], ({ blacklist: blacklistLocal }) => {
  if (blacklistLocal) blacklist = blacklistLocal;

  const websitesSafe = [];
  blacklist.forEach(({ hostname, enabled, timesBlocked }) => {
    const hostnameSafe = hostname.replace(/[^a-z0-9./?-]+/gi, "");
    websitesSafe.push(`
      <li>
        <label class="checkbox" for="${hostnameSafe}">
          <input type="checkbox" id="${hostnameSafe}" ${
      enabled ? "checked" : ""
    }>
          <span class="checkmark"></span> ${hostnameSafe}
        </label>
        <small><em>(${parseInt(timesBlocked, 10)}x)</em></small>
      </li>`);
  });

  // We only inject HTML which is safe to inject
  document.querySelector("ul.websites").innerHTML = websitesSafe.join("\n");

  blacklist.forEach(({ hostname }) => {
    document
      .querySelector(`[id="${hostname}"]`)
      .addEventListener("change", (event) => {
        const enabled = event.target.checked;
        chrome.storage.local.get(
          ["blacklist"],
          ({ blacklist: blacklistLocal2 }) => {
            console.log("enabled", enabled);
            console.log("blacklistLocal2", blacklistLocal2);
            const newBlacklist = [...blacklistLocal2].map((item) =>
              item.hostname === hostname ? { ...item, enabled } : item
            );
            console.log("blacklistLocal2 2", blacklistLocal2);
            console.log("newBlacklist", newBlacklist);
            chrome.storage.local.set({ blacklist: [...newBlacklist] });
          }
        );
      });
  });
});

chrome.storage.local.get(["scripts"], ({ scripts: scriptsLocal }) => {
  const scriptsSafe = [];
  const nonSaScripts = scriptsLocal.filter(
    (name) =>
      name.indexOf(".simpleanalytics.") === -1 &&
      name.indexOf(".simpleanalyticscdn.") === -1
  );
  nonSaScripts.forEach((name) => {
    const nameSafe = name.replace(/[^a-z0-9./?:-]+/gi, "");
    scriptsSafe.push(`
      <li>
        <label class="checkbox" for="${nameSafe}">
          <input type="checkbox" id="${nameSafe}" checked>
          <span class="checkmark"></span> ${nameSafe}
        </label>
      </li>`);
  });

  if (nonSaScripts.length > 0) {
    document.querySelector('[data-js="scripts"]').style.display = "block";

    // We only inject HTML which is safe to inject
    document.querySelector("ul.scripts").innerHTML = scriptsSafe.join("\n");
  }

  nonSaScripts.forEach((name) => {
    document
      .querySelector(`[id="${name}"]`)
      .addEventListener("change", (event) => {
        const enabled = event.target.checked;
        chrome.storage.local.get(["scripts"], ({ scripts: scriptsLocal2 }) => {
          const newScriptsLocal = enabled
            ? [...scriptsLocal2, name]
            : [...scriptsLocal2].filter((localName) => localName !== name);
          chrome.storage.local.set({ scripts: [...newScriptsLocal] });
        });
      });
  });
});

if (IS_FIREFOX) {
  document.querySelectorAll("[data-extension-text]").forEach((textElement) => {
    textElement.textContent = "add-on";
  });
}
