# Vue Captcha Switcher

A Vue 3 component that allows you to easily switch between different CAPTCHA services such as Google reCAPTCHA, hCaptcha, and Cloudflare Turnstile.

## Table of Contents
- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
- [Props](#props)
- [Events](#events)
- [Contributing](#contributing)
- [License](#license)

## Features
- Supports Google reCAPTCHA v2, hCaptcha, and Cloudflare Turnstile.
- Simple integration with Vue 3.
- Dynamic CAPTCHA switching based on the selected service.
- Customizable options such as theme and size.

## Installation

You can install `vue-captcha-switcher` using npm or yarn.

### Using npm

```bash
npm install vue-captcha-switcher
```

### Using yarn

```bash
yarn add vue-captcha-switcher
```

## Usage
Here’s an example of how to use the VueCaptchaSwitcher component in your Vue 3 project.
```html
<template>
    <VueCaptchaSwitcher
            :captchaName="captchaName"
            :publicKey="publicKey"
            v-model="captchaResponse"
    />
</template>

<script setup>
    import { ref } from 'vue';
    import VueCaptchaSwitcher from 'vue-captcha-switcher';

    const captchaName = ref('recaptcha'); // Options: 'recaptcha', 'hcaptcha', 'turnstile'
    const publicKey = 'your-site-key';
    const captchaResponse = ref('');
</script>

```

## Switching Between CAPTCHA Providers
You can switch between Google reCAPTCHA, hCaptcha, and Cloudflare Turnstile by changing the `captchaName` prop. The possible values are:
- `recaptcha`
- `hcaptcha`
- `turnstile`

For example:
```html
<template>
  <VueCaptchaSwitcher
    :captchaName="'hcaptcha'"
    :publicKey="yourHcaptchaKey"
    v-model="captchaResponse"
  />
</template>
```
## Props
| Prop               | Type    | Required | Description                                                                                                                                                                            |
|--------------------|---------|----------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `captchaName`      | String  | Yes      | Name of the CAPTCHA service to use (`'recaptcha'`, `'hcaptcha'`, `'turnstile'`).                                                                                                       |
| `publicKey`        | String  | Yes      | Public site key for the respective CAPTCHA service.                                                                                                                                    |
| `captchaScriptIds` | Object  | No       | (Optional) Object to customize the script tag IDs for each CAPTCHA service. Defaults: `{ recaptcha: 'recaptcha-script', hcaptcha: 'hcaptcha-script', turnstile: 'turnstile-script' }`. |
| `captchaReset`     | Boolean | No       | (Optional) Boolean value to manually trigger a reset of the CAPTCHA. Defaults to `false`.                                                                                              |
| `loadingTimeout`   | Number  | No       | (Optional) Timeout in milliseconds to wait before the CAPTCHA fails to load. Defaults to `0` (no timeout).                                                                             |
| `theme`            | String  | No       | (Optional) Theme for the CAPTCHA (light or dark). Defaults to `light`.                                                                                                                 |
### Events
| Event          | Description                                                                         |
|----------------|-------------------------------------------------------------------------------------|
| `verify`       | Emitted when CAPTCHA verification is successful. Passes the CAPTCHA response token. |
| `expire`       | Emitted when the CAPTCHA expires and requires re-verification.                      |
| `fail`         | Emitted when CAPTCHA fails to load or there's an error during verification.         |
| `captchaReset` | Emitted when the CAPTCHA is reset using the `captchaReset` prop.                    |

## Contributing
Contributions are welcome! If you'd like to contribute to the project, follow these steps:

Fork the repository.
Create a new branch for your feature or bugfix.
- Make your changes and commit them with descriptive messages.
- Push your changes to your fork.
- Submit a pull request.
For major changes, please open an issue first to discuss what you would like to change.

### Setting Up the Project Locally
1. Clone the repository:
```bash
git clone https://github.com/saidurbhuiyan/vue-captcha-switcher.git
```
2. Install the dependencies:
```bash
npm install
```
3. Build the package:
```bash
npm run build
```
### License
This project is licensed under the MIT [License](https://github.com/saidurbhuiyan/vue-captcha-switcher?tab=MIT-1-ov-file). See the LICENSE file for more details.

