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

// Migration banner: after an update that dropped baked-in host access,
// show users the list of previously-blocked sites that now need permission.
(function renderMigrationBanner() {
  const banner = document.getElementById("migration-banner");
  const list = document.getElementById("migration-list");
  if (!banner || !list) return;

  chrome.storage.local.get(
    ["migrationNeeded", "blocklist"],
    ({ migrationNeeded, blocklist: blocklistLocal = [] }) => {
      const savedBasenames = (blocklistLocal || [])
        .filter((s) => s && s.basename)
        .map((s) => s.basename);
      if (!savedBasenames.length) return clearMigrationFlag();

      chrome.permissions.getAll((perms) => {
        const granted = new Set((perms && perms.origins) || []);
        const missing = savedBasenames.filter((b) => {
          return !granted.has(`*://*.${b}/*`) && !granted.has("<all_urls>");
        });

        if (!missing.length) return clearMigrationFlag();

        renderList(missing);
        banner.hidden = false;
      });
    }
  );

  function renderList(basenames) {
    list.innerHTML = "";
    basenames.forEach((basename) => {
      const safe = basename.replace(/[^a-z0-9.-]+/gi, "");
      const li = document.createElement("li");
      li.dataset.basename = basename;
      li.innerHTML = `
        <span class="site">${safe}</span>
        <button class="button" data-basename="${safe}">Re-enable</button>
      `;
      list.appendChild(li);
    });

    list.querySelectorAll("button.button").forEach((btn) => {
      btn.addEventListener("click", () => handleReEnable(btn));
    });
  }

  function handleReEnable(btn) {
    const basename = btn.getAttribute("data-basename");
    if (!basename) return;

    btn.disabled = true;
    btn.textContent = "Requesting…";

    chrome.permissions.request(
      { origins: [`*://*.${basename}/*`] },
      (granted) => {
        if (chrome.runtime.lastError) {
          btn.disabled = false;
          btn.textContent = "Re-enable";
          console.error(chrome.runtime.lastError.message);
          return;
        }

        if (!granted) {
          btn.disabled = false;
          btn.textContent = "Re-enable";
          return;
        }

        const li = btn.closest("li");
        if (li) {
          li.innerHTML = `
            <span class="site">${basename}</span>
            <span class="status">Re-enabled</span>
          `;
        }

        // If nothing is left to migrate, clear the flag and hide the banner.
        const remaining = list.querySelectorAll("button.button").length;
        if (remaining === 0) {
          clearMigrationFlag();
          banner.hidden = true;
        }
      }
    );
  }

  function clearMigrationFlag() {
    chrome.storage.local.remove("migrationNeeded");
  }
})();
