let blacklist = []

chrome.storage.local.get(['blacklist'], ({ blacklist: blacklistLocal }) => {
  if (blacklistLocal) blacklist = blacklistLocal

  const websites = []
  blacklist.forEach(({ hostname, enabled, timesBlocked }) => {
    websites.push(`
      <li>
        <label class="checkbox" for="${hostname}">
          <input type="checkbox" id="${hostname}" ${enabled ? 'checked' : ''}>
          <span class="checkmark"></span> ${hostname}
        </label>
        <small><em>(${timesBlocked}x)</em></small>
      </li>`)
  })
  document.querySelector('ul.websites').innerHTML = websites.join('\n')

  blacklist.forEach(({ hostname }) => {
    document.querySelector(`[id="${hostname}"]`).addEventListener('change', (event) => {
      const enabled = event.target.checked
      const item = blacklist
      chrome.storage.local.get(['blacklist'], ({ blacklist: blacklistLocal2 }) => {
        console.log('enabled', enabled)
        console.log('blacklistLocal2', blacklistLocal2)
        const newBlacklist = [...blacklistLocal2].map(item => (item.hostname === hostname) ? { ...item, enabled } : item)
        console.log('blacklistLocal2 2', blacklistLocal2)
        console.log('newBlacklist', newBlacklist)
        // blacklist = [ ...newBlacklist ]
        chrome.storage.local.set({ blacklist: [...newBlacklist] })
      })
    })
  })
})

chrome.storage.local.get(['scripts'], ({ scripts: scriptsLocal }) => {
  const scripts2 = []
  const nonSaScripts = scriptsLocal.filter(name => name.indexOf('.simpleanalytics.') === -1 && name.indexOf('.simpleanalyticscdn.') === -1)
  nonSaScripts.forEach(name => {
    scripts2.push(`
      <li>
        <label class="checkbox" for="${name}">
          <input type="checkbox" id="${name}" checked>
          <span class="checkmark"></span> ${name}
        </label>
      </li>`)
  })

  console.log(nonSaScripts)
  if (nonSaScripts.length > 0) {
    document.querySelector('[data-js="scripts"]').style.display = 'block'
    document.querySelector('ul.scripts').innerHTML = scripts2.join('\n')
  }

  nonSaScripts.forEach((name) => {
    document.querySelector(`[id="${name}"]`).addEventListener('change', (event) => {
      const enabled = event.target.checked
      chrome.storage.local.get(['scripts'], ({ scripts: scriptsLocal2 }) => {
        const newScriptsLocal = enabled ? [...scriptsLocal2, name] : [...scriptsLocal2].filter(localName => localName !== name)
        chrome.storage.local.set({ scripts: [...newScriptsLocal] })
      })
    })
  })
})
