<script lang="ts" setup>
import { onMounted, onBeforeUnmount, ref, PropType } from 'vue';

// Reference to the reCAPTCHA container div
const recaptchaDiv = ref<HTMLDivElement | null>(null);

// Widget ID returned by grecaptcha after render
let widgetId: number | null = null;

// Define component props
const props = defineProps({
  sitekey: {
    type: String as PropType<string>,
    required: true,
  },
  size: {
    type: String as PropType<'normal' | 'compact'>,
    default: 'normal',
  },
  theme: {
    type: String as PropType<'light' | 'dark'>,
    default: 'light',
  },
  scriptId: {
    type: String as PropType<string>,
    default: 'recaptcha-script',
  },
});

// Define emitted events
const emit = defineEmits<{
  (e: 'verify', response: string): void;
  (e: 'error'): void;
  (e: 'expire'): void;
  (e: 'fail'): void;
}>();

// Expose execute and reset methods for external use
defineExpose({
  execute() {
    if (window.grecaptcha && widgetId !== null) {
      window.grecaptcha.execute(widgetId);
    }
  },
  reset() {
    if (window.grecaptcha && widgetId !== null) {
      window.grecaptcha.reset(widgetId);
    }
  },
  cleanup,
});

/**
 * Renders the Google reCAPTCHA widget inside the container div
 */
function renderRecaptcha() {
  if (window.grecaptcha && recaptchaDiv.value) {
    widgetId = window.grecaptcha.render(recaptchaDiv.value, {
      sitekey: props.sitekey,
      theme: props.theme,
      size: props.size,
      callback: (response: string) => emit('verify', response),
      'expired-callback': () => emit('expire'),
      'error-callback': () => emit('fail'),
    });
  }
}

/**
 * Registers global callback function invoked by Google reCAPTCHA script on load
 */
function registerRenderRecaptchaCallback() {
  window.onloadRecaptchaCallback = renderRecaptcha;
}

// Lifecycle hook - runs after component is mounted
onMounted(() => {
  // Avoid adding script if it already exists
  if (!document.getElementById(props.scriptId)) {
    const scriptTag = document.createElement('script');
    scriptTag.id = props.scriptId;
    scriptTag.src = 'https://www.google.com/recaptcha/api.js?onload=onloadRecaptchaCallback&render=explicit';
    scriptTag.async = true;
    scriptTag.defer = true;
    scriptTag.onerror = () => emit('error');
    document.head.appendChild(scriptTag);

    scriptTag.onload = registerRenderRecaptchaCallback;
    
  } else{
    renderRecaptcha();
  } 
});

/**
 * Cleanup function to remove script and clear captcha container
 */
function cleanup() {
  // Remove the reCAPTCHA script tag from document
  const script = document.getElementById(props.scriptId);
  script?.remove();

  // Clear the captcha container div
  if (recaptchaDiv.value) {
    recaptchaDiv.value.innerHTML = '';
  }

  // Clean up global callbacks
  delete window.onloadRecaptchaCallback;
  delete window.grecaptcha;
}

// Cleanup on component unmount
onBeforeUnmount(() => {
  cleanup();
});
</script>

<template>
  <div ref="recaptchaDiv"></div>
</template>
