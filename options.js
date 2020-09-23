let blocklist = [];

const IS_FIREFOX = navigator.userAgent.includes("Firefox");
const DEBUG = false;

const debug = (...messages) => {
  if (DEBUG) console.info("[DEBUG]", ...messages);
};

chrome.storage.local.get(["blocklist"], ({ blocklist: blocklistLocal }) => {
  if (blocklistLocal) blocklist = [...blocklistLocal];

  debug("blocklist", blocklist);

  const websitesSafe = [];
  blocklist.forEach(({ basename, enabled, scripts }) => {
    const hostnameSafe = basename.replace(/[^a-z0-9./?-]+/gi, "");
    websitesSafe.push(`
      <li>
        <label class="checkbox" for="${hostnameSafe}">
          <input type="checkbox" id="${hostnameSafe}" ${
      enabled ? "checked" : ""
    } data-website="${basename}">
          <span class="checkmark"></span> ${basename}
        </label>
        ${scripts.length === 0 ? "<small><em>(no scripts)</em></small>" : ""}
      </li>`);

    for (const script of scripts) {
      const scriptSafe = script.url.replace(/[^a-z0-9./?-]+/gi, "");
      const scriptName = script.url.replace(/^https?:\/\//, "");
      websitesSafe.push(`
        <li style="margin-left: 1.6rem;">
          <label class="checkbox" for="${scriptSafe}">
            <input type="checkbox" id="${scriptSafe}" ${
        script.enabled ? "checked" : ""
      } data-website="${basename}" data-script="${script.url}">
            <span class="checkmark"></span> ${scriptName}
            <small><em>(${parseInt(script.timesBlocked, 10)}x)</em></small>
          </label>
        </li>`);
    }
  });

  // We only inject HTML which is safe to inject
  document.querySelector("ul.websites").innerHTML = websitesSafe.join("\n");
  document.querySelector("ul.websites").style.display = "inherit";

  const checkboxes = document.querySelectorAll(
    `ul.websites input[type="checkbox"]`
  );

  [...checkboxes].forEach((checkbox) => {
    checkbox.addEventListener("change", ({ target }) => {
      const website = target.getAttribute("data-website");
      const script = target.getAttribute("data-script");
      const { checked } = target;

      // Update sub checkboxes when main website is clicked
      const wholeWebsite = !script;
      if (wholeWebsite) {
        [...checkboxes].forEach((checkbox) => {
          if (
            checkbox.getAttribute("data-website") === website &&
            checkbox.getAttribute("data-script")
          ) {
            checkbox.checked = checked;
          }
        });
      }

      chrome.storage.local.get(
        ["blocklist"],
        ({ blocklist: blocklistLocal }) => {
          const newBlocklist = [...blocklistLocal];
          const site = newBlocklist.find(
            ({ basename }) => website === basename
          );
          if (wholeWebsite) site.enabled = checked;

          site.scripts = site.scripts.map((siteScript) => {
            if (wholeWebsite || siteScript.url === script)
              siteScript.enabled = checked;
            return siteScript;
          });

          debug("newBlocklist", newBlocklist);
          chrome.storage.local.set({ blocklist: [...newBlocklist] });
        }
      );
    });
  });
});

if (IS_FIREFOX) {
  document.querySelectorAll("[data-extension-text]").forEach((textElement) => {
    textElement.textContent = "add-on";
  });
}
