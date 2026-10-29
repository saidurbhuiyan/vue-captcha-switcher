<script lang="ts" setup>
import { onMounted, onBeforeUnmount, ref, PropType } from 'vue';
import { loadCaptchaScript } from '../loadCaptchaScript';

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
    type: String as PropType<'normal' | 'compact' | 'invisible'>,
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
  (e: 'error', error: Error): void;
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

// Lifecycle hook - runs when component is mounted
onMounted(() => {
  // recaptchacompat=off stops hCaptcha from overriding window.grecaptcha
  loadCaptchaScript(
    props.scriptId,
    'https://js.hcaptcha.com/1/api.js?onload=onloadHcaptchaCallback&render=explicit&recaptchacompat=off',
    'onloadHcaptchaCallback',
    () => typeof window.hcaptcha?.render === 'function',
  )
    .then(renderHcaptcha)
    .catch((error: Error) => emit('error', error));
});

/**
 * Cleanup function to remove this widget (the shared script stays loaded)
 */
function cleanup() {
  if (window.hcaptcha && widgetId !== null) {
    window.hcaptcha.remove(widgetId);
    widgetId = null;
  }

  // Clear container div content
  if (hcaptchaDiv.value) {
    hcaptchaDiv.value.innerHTML = '';
  }
}

// Cleanup on component unmount
onBeforeUnmount(() => {
  cleanup();
});
</script>

<template>
  <div ref="hcaptchaDiv"></div>
</template>
