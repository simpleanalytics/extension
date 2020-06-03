# Simple Analytics extension

This extension useful for customers of Simple Analytics or non customers who want to block their visits to a specific website where Simple Analytics is installed. This way your stats will not included in the dashboard of that website. We do this via an extension so we don't need to record IP addresses. This makes it also more accurate and more visible when traveling or when IPs do change.

This extension basically blocks requests on website where you give permission to. When you click on the icon you as asked to allow the extension to load the data from the current website. This is needed to block the visits. You need to do once this per website.

When a visits is blocked it shows up as a counter on the icon. The counter does reset when you close your tab. For more stats of blocked visits you can go to the permissions page of this extension.

On the options page you will find all websites being blocked and you can change what the extension should block.

This extension does not connect to any servers.

## Build extension

Run `npm run build:chrome` or `npm run build:firefox` to build the extension. It drops a zip in the `/dist`-folder.
