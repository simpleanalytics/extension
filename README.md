<a href="https://simpleanalytics.com/?ref=github.com/simpleanalytics/extension">
  <img src="https://assets.simpleanalytics.com/images/logos/logo-github-readme.png" alt="Simple Analytics logo" align="right" height="62" />
</a>

# Extension

This extension is for Simple Analytics users who want to block their own visits on websites that use Simple Analytics. That way your own visits don't show up in the dashboard. Because it's an extension, we don't need to record IP addresses, which is more accurate and keeps working when you travel or when your IP changes.

The extension only has access to sites you explicitly choose. Click the icon on a site you want to stop tracking, then grant permission for that site once. Blocking works for the standard Simple Analytics script, custom domains, and [proxy setups](https://docs.simpleanalytics.com/proxy).

On the options page you'll find every site the extension is blocking, and you can disable/re-enable sites or individual scripts.

This extension does not connect to any servers.

## Build

```sh
npm run build:chrome   # drops dist/chrome.zip
npm run build:firefox  # drops dist/firefox.zip
```

## Release a new version (Chrome)

1. Bump `"version"` in [`manifest.json`](./manifest.json).
2. `npm run build:chrome`.
3. Upload `dist/chrome.zip` at the [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole/). Sign in with the **Simple Analytics Google account**.
4. Submit for review.

## Release a new version (Firefox)

1. Bump `"version"` in [`manifest.json`](./manifest.json) (same file, shared).
2. `npm run build:firefox`.
3. Upload `dist/firefox.zip` at the [Firefox Add-ons Developer Hub](https://addons.mozilla.org/en-US/developers/) using the Simple Analytics account.
