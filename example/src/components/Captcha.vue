<template>
  <div class="max-w-sm mx-auto">
    
    <div class="mb-4">
    <select class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5" v-model="captchaName">
      <option value="recaptcha">Google reCAPTCHA</option>
      <option value="hcaptcha">hCaptcha</option>
      <option value="turnstile">Cloudflare Turnstile</option>
    </select>
    </div>

    <div class="mb-4 flex gap-2 items-center">
      <p>Captcha Theme: </p>
      <ul class="flex flex-wrap text-sm font-medium text-center text-gray-500 dark:text-gray-400">
    <li class="me-2">
        <a href="#" @click="theme = 'dark'" :class="(theme === 'dark' ? ' bg-gray-800 text-white' : ' bg-gray-50 hover:bg-gray-100 text-gray-600 border border-gray-300') + ' inline-block px-4 py-3 rounded-lg'">Dark</a>
    </li>
    <li class="me-2">
        <a href="#" @click="theme = 'light'" :class="(theme === 'light' ? ' bg-gray-800 text-white' : ' bg-gray-50 hover:bg-gray-100 text-gray-600 border border-gray-300') + ' inline-block px-4 py-3 rounded-lg'" >Light</a>
    </li>
    
</ul>
    </div>


    <div class="flex justify-center mb-4">
      <VueCaptchaSwitcher
          v-if="captchaName"
          :key="captchaName + '-' + theme"
          :captchaName="captchaName"
          :publicKey="getSiteKey(captchaName)"
          :theme="theme"
          v-model="captchaResponse"
          modelValue="onVerify"
          :captchaReset="captchaReset"
          @captchaReset="captchaReset = false"
        />
    </div>

    <div class="mb-4">
      <button type="button" class="bg-gray-800 hover:bg-gray-700 text-white font-bold py-1  cursor-pointer px-2 rounded" @click="captchaReset = true">Reset Captcha</button>
    </div>
    
<div class="min-w-sm my-2 bg-gray-100 border border-gray-300 text-gray-900 rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5">
  <h5 class="font-medium mb-2">Captcha Response: </h5>
<p class="text-sm text-gray-600 wrap-break-word">{{ captchaResponse }}</p>
</div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import VueCaptchaSwitcher from 'vue-captcha-switcher';

const captchaName = ref<'recaptcha' | 'hcaptcha' | 'turnstile'>('hcaptcha');
const captchaResponse = ref('');
const theme = ref<'light' | 'dark'>('dark');
const captchaReset = ref(false);

const getSiteKey = (name: string): string => {
  const keys = {
    recaptcha: import.meta.env.VITE_RECAPTCHA_PUBLIC_KEY,
    hcaptcha: import.meta.env.VITE_HCAPTCHA_PUBLIC_KEY,
    turnstile: import.meta.env.VITE_TURNSTILE_PUBLIC_KEY
  };
  return keys[name as keyof typeof keys];
};

watch(theme, () => {
 console.log('Theme changed to:', theme.value);
});

const onVerify = (token: string) => {
  console.log('Verified token:', token);
};
</script>
