<p align="center"><img src="icon/icon_raw.png" width="150"/></p>
<h2 align="center"><b>AdGuard Home Control</b></h2>
<h4 align="center">Extension to control AdGuard Home DNS from your browser</h4>

## AdGuard Home Control
This extension controls the protection of [AdGuard Home](https://github.com/AdguardTeam/AdGuardHome) right from your browser.

<p align="center">
<a href="https://addons.mozilla.org/en-US/firefox/addon/adguard-home-browser-extension/"><img  src="docs/assets/firefox-ext.svg" width="150"/></a>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
<a href="https://chromewebstore.google.com/detail/adguard-home-control/flbpjbdbniigclhibiemmeopcnfimajj"><img  src="docs/assets/chrome_webstore_badge.png" width="150"/></a>
</p>

## Features:
✓ Disable protection for specific time  
✓ Supports multiple instances  
✓ Tested in Mozilla Firefox, Google Chrome, Microsoft Edge browsers

## Build
Follow these instructions to build and run the project.

1. Clone this repository.
1. You need to have the latest version of npm.
1. Install cross-env, `npm install -g cross-env`
1. Run `npm run start-firefox` or `make firefox` from the project folder
1. In firefox browser, go to `about:debugging` -> `Load Temporary Add-on`
1. Point to the `dist` -> `firefox` -> `mainifest.json`
1. This extension should now be visible in the  Extension in toolbar.
1. To make a distributable version, then run `make` command

## Screenshots
<div style="text-align:center">
   <img src="docs/screenshots/firefox/screenshot1.png" width="250" hspace="20"/>
   <img src="docs/screenshots/firefox/screenshot2.png" width="250" hspace="20"/>
   <img src="docs/screenshots/firefox/screenshot3.png" width="250" hspace="20"/>
</div>

## Contributing Guidelines
Read the contributing guidelines [here](CONTRIBUTING.md)

## Thanks
This project is inspired from the [PiHole browser extension](https://github.com/badsgahhl/pihole-browser-extension) project. 

## Disclaimer
This is not an official AdGuard Home application. AdGuard, AdGuard Home are registered trademarks of AdGuard Software Ltd. Use this product at your own risk. We are not responsible for any damages to your computer or AdGuard server that may be caused by using this product.