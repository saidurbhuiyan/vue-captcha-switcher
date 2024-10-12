<script lang="ts" setup>
// Import necessary functions from Vue
import {onMounted, PropType, ref} from 'vue';

// Create a reference for the reCAPTCHA div
const recaptchaDiv = ref<HTMLDivElement | null>(null);

// Define props for  reCaptcha component using PropType
const props = defineProps({
  sitekey: {
    type: String as PropType<string>, // Site key for  reCaptcha
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
    default: " recaptcha-script", // Default ID for the script tag
  },
  loadingTimeout: {
    type: Number as PropType<number>, // Optional loading timeout in milliseconds
    default: 0, // Default loading timeout
  },
});

// Define events emitted by the component
const emit = defineEmits<{
  (e: 'verify', response: string): void; // Event for captcha verification
  (e: 'error'): void; // Event for captcha error
  (e: 'expire'): void; // Event for captcha expiration
  (e: 'fail'): void; // Event for captcha failure
}>();

// Expose methods to reset or execute the captcha
defineExpose({
  execute() {
    window.grecaptcha.execute();
  },
  reset() {
    window.grecaptcha.reset();
  },
});

// Function to render reCAPTCHA
function renderRecaptcha() {
  window.onloadRecaptchaCallback = () => {
    if (window.grecaptcha) {
      window.grecaptcha.render(recaptchaDiv.value, {
        sitekey: props.sitekey,
        theme: props.theme,
        size: props.size,
        callback: (response: string) => emit('verify', response),
        'expired-callback': () => emit('expire'),
        'error-callback': () => emit('fail'),
      });
    }
  };
}

// Lifecycle hook to run when the component is mounted
onMounted(() => {
  if (!document.getElementById(props.scriptId)) {
    const scriptTag = document.createElement('script');
    scriptTag.id = props.scriptId;
    scriptTag.src = `https://www.google.com/recaptcha/api.js?onload=onloadRecaptchaCallback&render=explicit`;
    scriptTag.async = true;
    scriptTag.defer = true;
    document.head.appendChild(scriptTag);

    scriptTag.onload = renderRecaptcha; // Call render function when the script is loaded
  }

  renderRecaptcha(); // Render the captcha
});
</script>

<template>
  <div ref="recaptchaDiv"></div>
</template>
