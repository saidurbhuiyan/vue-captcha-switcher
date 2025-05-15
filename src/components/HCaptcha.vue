<script lang="ts" setup>
import { onMounted, onBeforeUnmount, ref, PropType } from 'vue';

// Reference to the hCaptcha container div
const hcaptchaDiv = ref<HTMLDivElement | null>(null);

// Widget ID returned by hcaptcha after render
let widgetId: string | null = null;

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
    default: 'hcaptcha-script',
  },
});

// Define emitted events
const emit = defineEmits<{
  (e: 'verify', response: string): void;
  (e: 'error'): void;
  (e: 'expire'): void;
  (e: 'fail'): void;
}>();

// Expose execute and reset methods for parent access
defineExpose({
  execute() {
    if (window.hcaptcha && widgetId !== null) {
      window.hcaptcha.execute(widgetId);
    }
  },
  reset() {
    if (window.hcaptcha && widgetId !== null) {
      window.hcaptcha.reset(widgetId);
    }
  },
  cleanup,
});

/**
 * Renders the hCaptcha widget inside the container div
 */
function renderHcaptcha() {
  if (window.hcaptcha && hcaptchaDiv.value) {
    widgetId = window.hcaptcha.render(hcaptchaDiv.value, {
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
 * Registers global callback invoked by hCaptcha script on load
 */
function registerRenderHcaptchaCallback() {
  window.onloadHcaptchaCallback = renderHcaptcha;
}

// Lifecycle hook - runs when component is mounted
onMounted(() => {
  // Add hCaptcha script if not already loaded
  if (!document.getElementById(props.scriptId)) {
    const scriptTag = document.createElement('script');
    scriptTag.id = props.scriptId;
    scriptTag.src = 'https://js.hcaptcha.com/1/api.js?onload=onloadHcaptchaCallback&render=explicit';
    scriptTag.async = true;
    scriptTag.defer = true;
    scriptTag.onerror = () => emit('error');
    document.head.appendChild(scriptTag);

    scriptTag.onload = registerRenderHcaptchaCallback;
    
  } else {
    // Script loaded, render immediately
    renderHcaptcha();
  }
  
});

/**
 * Cleanup function to remove script and clear container div
 */
function cleanup() {
  // Remove hCaptcha script tag from document
  const script = document.getElementById(props.scriptId);
  script?.remove();

  // Clear container div content
  if (hcaptchaDiv.value) {
    hcaptchaDiv.value.innerHTML = '';
  }

  // Cleanup global variables
  delete window.onloadHcaptchaCallback;
  delete window.hcaptcha;
}

// Cleanup on component unmount
onBeforeUnmount(() => {
  cleanup();
});
</script>

<template>
  <div ref="hcaptchaDiv"></div>
</template>
