<script lang="ts" setup>
// Import necessary functions from Vue
import {onMounted, PropType, ref} from 'vue';

// Create a reference for the Turnstile div
const turnstileDiv = ref<HTMLDivElement | null>(null);
let turnstile: any = null; // Declare a variable for Turnstile instance

// Define props for  Turnstile component using PropType
const props = defineProps({
  sitekey: {
    type: String as PropType<string>, // Site key for  Turnstile
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
    default: " turnstile-script", // Default ID for the script tag
  },
  loadingTimeout: {
    type: Number as PropType<number>, // Optional loading timeout in milliseconds
    default: 0, // Default loading timeout
  },
});

// Define events emitted by the component
const emit = defineEmits<{
  (e: 'verify', response: string): void; // Event for captcha verification
  (e: 'error', error: Error): void; // Event for captcha error
  (e: 'expire'): void; // Event for captcha expiration
  (e: 'fail'): void; // Event for captcha failure
}>();

// Expose methods to reset or execute the captcha
defineExpose({
  execute() {
    window.turnstile.execute(turnstile);
  },
  reset() {
    window.turnstile.reset(turnstile);
  },
});

// Function to render Turnstile
function renderTurnstile() {
  window.onloadTurnstileCallback = () => {
    if (window.turnstile) {
      turnstile = window.turnstile.render(turnstileDiv.value, {
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
    new Promise<void>((resolve, reject) => {
      let loadingCountdown: NodeJS.Timeout; // Declare loading countdown variable
      let responded = false;

      window.turnstileReady = () => {
        if (responded) return;
        responded = true;
        clearTimeout(loadingCountdown);
        resolve(); // Resolve promise on success
      };

      const loadingFailed = (reason: string) => () => {
        if (responded) return;
        responded = true;
        clearTimeout(loadingCountdown);
        const scriptTag = document.getElementById(props.scriptId);
        if (scriptTag) scriptTag.remove(); // Remove the script tag
        reject(reason); // Reject promise on failure
      };

      // Set loading timeout if specified
      if (props.loadingTimeout > 0) {
        loadingCountdown = setTimeout(loadingFailed('timeout'), props.loadingTimeout);
      }

      const doc = window.document;
      const scriptTag = doc.createElement('script');
      scriptTag.id = props.scriptId;
      scriptTag.onerror = loadingFailed('error');
      scriptTag.onabort = loadingFailed('aborted');
      scriptTag.async = true;
      scriptTag.defer = true;
      scriptTag.src = `https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit&onload=onloadTurnstileCallback`;
      doc.head.appendChild(scriptTag); // Append the script tag to the document head
    })
        .then(() => renderTurnstile()) // Render captcha on success
        .catch((error) => emit('error', error)); // Emit error on failure
  }

  renderTurnstile(); // Render the captcha
});
</script>

<template>
  <div ref="turnstileDiv"></div>
</template>
