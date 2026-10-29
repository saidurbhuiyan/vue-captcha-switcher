<script lang="ts" setup>
import { onMounted, onBeforeUnmount, ref, PropType } from 'vue';
import { loadCaptchaScript } from '../loadCaptchaScript';

// Reference to the Turnstile container div
const turnstileDiv = ref<HTMLDivElement | null>(null);

// Widget ID returned by Turnstile after render
let widgetId: string | null = null;

// Props definition
const props = defineProps({
  sitekey: {
    type: String as PropType<string>,
    required: true,
  },
  size: {
    type: String as PropType<'normal' | 'compact' | 'flexible'>,
    default: 'normal',
  },
  theme: {
    type: String as PropType<'light' | 'dark' | 'auto'>,
    default: 'light',
  },
  scriptId: {
    type: String as PropType<string>,
    default: 'turnstile-script',
  },
});

// Define emitted events
const emit = defineEmits<{
  (e: 'verify', response: string): void;
  (e: 'error', error: Error): void;
  (e: 'expire'): void;
  (e: 'fail'): void;
}>();

// Expose execute and reset methods to parent components
defineExpose({
  execute() {
    if (window.turnstile && widgetId !== null) {
      window.turnstile.execute(widgetId);
    }
  },
  reset() {
    if (window.turnstile && widgetId !== null) {
      window.turnstile.reset(widgetId);
    }
  },
  cleanup,
});

/**
 * Renders the Turnstile captcha widget inside the container div
 */
function renderTurnstile() {
  if (window.turnstile && turnstileDiv.value) {
    widgetId = window.turnstile.render(turnstileDiv.value, {
      sitekey: props.sitekey,
      theme: props.theme,
      size: props.size,
      callback: (response: string) => emit('verify', response),
      'expired-callback': () => emit('expire'),
      'error-callback': () => emit('fail'),
    });
  }
}

// Lifecycle: on component mount
onMounted(() => {
  loadCaptchaScript(
    props.scriptId,
    'https://challenges.cloudflare.com/turnstile/v0/api.js?onload=onloadTurnstileCallback&render=explicit',
    'onloadTurnstileCallback',
    () => typeof window.turnstile?.render === 'function',
  )
    .then(renderTurnstile)
    .catch((error: Error) => emit('error', error));
});

/**
 * Cleanup function to remove this widget (the shared script stays loaded)
 */
function cleanup() {
  if (window.turnstile && widgetId !== null) {
    window.turnstile.remove(widgetId);
    widgetId = null;
  }

  // Clear the captcha container div
  if (turnstileDiv.value) {
    turnstileDiv.value.innerHTML = '';
  }
}

// Lifecycle: on component unmount
onBeforeUnmount(() => {
  cleanup();
});
</script>

<template>
  <div ref="turnstileDiv"></div>
</template>
