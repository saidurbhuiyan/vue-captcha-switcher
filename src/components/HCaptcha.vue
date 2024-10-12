<script lang="ts" setup>
// Import necessary functions and types from Vue
import { onMounted, ref, PropType } from 'vue';

// Create a reference for the HCaptcha div
const hcaptchaDiv = ref<HTMLDivElement | null>(null);

// Define props for HCaptcha component using PropType
const props = defineProps({
  sitekey: {
    type: String as PropType<string>, // Site key for hCaptcha
    required: true, // Site key is required
  },
  size: {
    type: String as PropType<string>, // Optional size of the captcha
    default: "normal", // Default value for size
  },
  theme: {
    type: String as PropType<string>, // Optional theme (light or dark)
    default: "light", // Default value for theme
  },
  scriptId: {
    type: String as PropType<string>, // Optional ID for the script tag
    default: "hcaptcha-script", // Default ID for the script tag
  },
  loadingTimeout: {
    type: Number as PropType<number>, // Optional loading timeout in milliseconds
    default: 0, // Default loading timeout
  },
});

// Define events emitted by the component using TypeScript
const emit = defineEmits<{
  (e: 'verify', response: string): void; // Event emitted when verification is successful
  (e: 'error'): void; // Event emitted on captcha error
  (e: 'expire'): void; // Event emitted when the captcha expires
  (e: 'fail'): void; // Event emitted on captcha failure
}>();

// Expose methods to reset or execute the captcha for parent component access
defineExpose({
  execute() {
    window.hcaptcha.execute(); // Trigger hCaptcha execution
  },
  reset() {
    window.hcaptcha.reset(); // Reset the hCaptcha
  },
});

// Function to render hCaptcha when the script is loaded
function renderHcaptcha() {
  // Callback function to run when hCaptcha is ready
  window.onloadHcaptchaCallback = () => {
    if (window.hcaptcha) {
      window.hcaptcha.render(hcaptchaDiv.value, {
        sitekey: props.sitekey,
        theme: props.theme,
        size: props.size,
        callback: (response: string) => emit('verify', response), // Emit verify event with response
        'expired-callback': () => emit('expire'), // Emit expire event
        'error-callback': () => emit('fail'), // Emit fail event
      });
    }
  };
}

// Lifecycle hook to run when the component is mounted
onMounted(() => {
  // Check if the script is already loaded to avoid duplicates
  if (!document.getElementById(props.scriptId)) {
    const scriptTag = document.createElement('script');
    scriptTag.id = props.scriptId; // Set the script ID
    scriptTag.src = `https://js.hcaptcha.com/1/api.js?onload=onloadHcaptchaCallback&render=explicit`;
    scriptTag.async = true; // Load script asynchronously
    scriptTag.defer = true; // Defer execution until the page has loaded
    document.head.appendChild(scriptTag); // Append script tag to the document head

    scriptTag.onload = renderHcaptcha; // Call render function when the script is loaded
  } else {
    // If the script is already loaded, render the captcha directly
    renderHcaptcha(); // Render the captcha
  }
});
</script>

<template>
  <div ref="hcaptchaDiv"></div> <!-- Div where hCaptcha will be rendered -->
</template>
