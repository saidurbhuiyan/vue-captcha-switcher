<script lang="ts" setup>
import { onMounted, onBeforeUnmount, ref, PropType } from 'vue';
import { loadCaptchaScript } from '../loadCaptchaScript';

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
    type: String as PropType<'normal' | 'compact' | 'invisible'>,
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
  (e: 'error', error: Error): void;
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

// Lifecycle hook - runs after component is mounted
onMounted(() => {
  loadCaptchaScript(
    props.scriptId,
    'https://www.google.com/recaptcha/api.js?onload=onloadRecaptchaCallback&render=explicit',
    'onloadRecaptchaCallback',
    () => typeof window.grecaptcha?.render === 'function',
  )
    .then(renderRecaptcha)
    .catch((error: Error) => emit('error', error));
});

/**
 * Cleanup function to clear this widget (the shared script stays loaded).
 * reCAPTCHA v2 has no remove API, so we clear the container ourselves.
 */
function cleanup() {
  widgetId = null;

  // Remove this widget's challenge iframe ("c-<id>"), which reCAPTCHA appends to <body>
  const anchorName = recaptchaDiv.value?.querySelector<HTMLIFrameElement>('iframe[name^="a-"]')?.name;
  if (anchorName) {
    let challenge = document.querySelector(`iframe[name="c-${anchorName.slice(2)}"]`);
    while (challenge && challenge.parentElement !== document.body) challenge = challenge.parentElement;
    challenge?.remove();
  }

  // Clear the captcha container div
  if (recaptchaDiv.value) {
    recaptchaDiv.value.innerHTML = '';
  }
}

// Cleanup on component unmount
onBeforeUnmount(() => {
  cleanup();
});
</script>

<template>
  <div ref="recaptchaDiv"></div>
</template>
