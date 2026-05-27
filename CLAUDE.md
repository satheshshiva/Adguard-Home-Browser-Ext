# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Browser extension (Chrome MV3 + Firefox MV2) to control AdGuard Home DNS protection from the browser toolbar. Vue 3 + Vuetify 3 + TypeScript, bundled with webpack 5.

## Commands

```bash
npm run start-chrome      # webpack --mode=development --watch, outputs to dist/chrome
npm run start-firefox     # webpack --mode=development --watch, outputs to dist/firefox
npm run build             # production build for BOTH browsers + zip packages at repo root
npm run eslint            # ESLint 9 flat config, lints **/*.{ts,vue}
npm run prettier-check    # check formatting
npm run prettier-format   # apply formatting
make build                # clean + install + npm run build
make firefox / make chrome  # rm -rf the browser dist dir, then start that watch build
```

There is no test suite. Verification of UI changes is manual: load `dist/chrome` via `chrome://extensions` (Developer mode → Load unpacked) and `dist/firefox/manifest.json` via `about:debugging` → Load Temporary Add-on. Reload after every rebuild.

## Architecture

### Three webpack entry points, two webpack configs

`src/webpack/webpack.chrome.ts` and `webpack.firefox.ts` both delegate to `WebpackConfigFactory.createConfig(browser)`. The only per-browser difference is which `manifest.<browser>.json` gets copied into `dist/<browser>/manifest.json` and which zip filename is produced. Output dirs are `dist/chrome/` and `dist/firefox/`.

Each build produces three independent bundles:
- **`popup.ts`** → toolbar popup UI (Vue app mounted on `popup.html#main`)
- **`options.ts`** → options page UI (Vue app + vue-router mounted on `options.html#main`)
- **`background.ts`** → service worker (Chrome MV3) / background page (Firefox MV2). Pure TypeScript, NO Vue. Handles badge updates, periodic status checks via `chrome.alarms`, and `chrome.runtime` message bus.

### The Initializer pattern

Every module entry point follows the same shape: import an `Initializer`, call `.init()` on `DOMContentLoaded`. See `src/module/popup/popup.ts`, `src/module/option/options.ts`, `src/module/background/background.ts`. The actual setup (createApp, createRouter, register services) lives in `src/module/<area>/init/<Area>Initializer.ts`. When adding cross-cutting setup, add a new Initializer class implementing `src/module/general/Initializer.ts` and chain it from the area initializer.

### Services are static-class singletons

`src/service/*.ts` are classes with only static methods (`StorageService.getDefaultDisableTime()`, `BadgeService.setBadgeText()`, etc.). No DI, no instances. Just import and call. The popup/options Vue components use `useTranslation()` from `src/hooks/translation.ts` to pull I18N keys + the `translate` function into setup return.

### AdGuard Home connection settings = array of instances

`StorageService` persists an **array** of AdGuard instances (`AdGuardSettingsStorage[]`) under one storage key. The options UI's `OptionTabComponent.vue` lets users add/remove up to 4 instances. `AdGuardApiService` methods fan out across all instances and aggregate. When touching status/enable/disable logic, remember every operation is multi-instance.

### Vuetify 3 setup is explicit

`src/plugins/vuetify.ts` registers **all** components and directives via `import * as components from 'vuetify/components'` + `import * as directives from 'vuetify/directives'`. Vuetify 3 dropped Vuetify 2's global auto-registration, so components MUST be passed to `createVuetify()`. This makes the bundle larger (~1.2 MiB popup); the planned optimization is to install `webpack-plugin-vuetify` for auto tree-shaking and drop the wildcard imports.

Icons use `vuetify/iconsets/mdi-svg` with path strings imported from `@mdi/js`. Always pass paths via the `icon` prop: `<v-icon :icon="mdiCog">`. The Vuetify 2 slot-content pattern (`<v-icon>{{ mdiCog }}</v-icon>`) does NOT work in v3 and will render the raw path as text.

### Vue is the runtime-only build

`WebpackConfigFactory.ts` aliases `vue$` to `vue/dist/vue.runtime.esm-bundler.js` — no runtime template compiler. All templates live in `.vue` files compiled at build time by `vue-loader`. Do NOT introduce runtime template strings (`new Vue({ template: '...' })`-style) — Chrome MV3's CSP (`script-src 'self'`) forbids `unsafe-eval` so the compiler-included build would silently fail anyway.

The three Vue feature flags (`__VUE_OPTIONS_API__`, `__VUE_PROD_DEVTOOLS__`, `__VUE_PROD_HYDRATION_MISMATCH_DETAILS__`) are injected via webpack's `DefinePlugin` in `WebpackConfigFactory.ts`. They're required by the esm-bundler build for tree-shaking.

### vue-router uses hash history

`OptionsInitializer.ts` uses `createWebHashHistory()` — browser extensions can't use HTML5 history mode reliably because `options.html` is served from a `chrome-extension://` URL. Keep new routes hash-based.

### vue-debounce is registered as a directive

`OptionsInitializer.ts` calls `app.directive('debounce', vueDebounce({ lock: true }))`. Used in `OptionTabComponent.vue` as `v-debounce:500ms="connectionCheck"` on text fields. Only registered on the options app — not available in the popup.

### I18N is `chrome.i18n`

`src/service/i18NService.ts` wraps `chrome.i18n.getMessage()`. Strings live in `_locales/en/messages.json` (the only locale today). I18N keys are enums (`I18NPopupKeys`, `I18NOptionKeys`) — add new keys to the enum AND `messages.json` together.

### Manifest differences

- **Chrome (`manifest.chrome.json`)**: MV3, service worker background, custom CSP `script-src 'self'; object-src 'self';`.
- **Firefox (`manifest.firefox.json`)**: MV2, background page, no custom CSP. Uses `options_ui` instead of MV3's `options_page`.

When adding browser APIs, check both. The background script uses `chrome.*` APIs throughout — Firefox provides a compatibility shim, so this works without conditional code.

## ESLint flat config

`eslint.config.js` is the source of truth. There is no `.eslintrc.*` or `.eslintignore` — both were removed during the Vue 3 migration. The config uses `eslint-plugin-vue` flat-recommended + `@typescript-eslint` + `eslint-config-prettier`. `eslint-config-airbnb-typescript` was dropped because it isn't flat-config compatible.

## Things to know before changing deps

TypeScript is pinned to 5.x (not 6) because `@typescript-eslint` 8 doesn't certify TS 6 yet. The package.json carries `vue-loader` 17, `vue-router` 4, `vuetify` 3, `vue` 3 — do not mix Vue 2 packages back in. `@vue/composition-api`, `vue-template-compiler`, and `eslint-config-airbnb-typescript` were intentionally removed.
