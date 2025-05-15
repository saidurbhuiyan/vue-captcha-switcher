<script lang="ts" setup>
import { onMounted, onBeforeUnmount, ref, PropType } from 'vue';

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
    type: String as PropType<'normal' | 'compact'>,
    default: 'normal',
  },
  theme: {
    type: String as PropType<'light' | 'dark'>,
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

/**
 * Registers the global callback function that Turnstile calls once the script loads
 */
function registerRenderTurnstileCallback() {
  window.onloadTurnstileCallback = renderTurnstile;
}

// Lifecycle: on component mount
onMounted(() => {
  // Check if Turnstile script is already loaded
  if (!document.getElementById(props.scriptId)) {
    const scriptTag = document.createElement('script');
    scriptTag.id = props.scriptId;
    scriptTag.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?onload=onloadTurnstileCallback&render=explicit';
    scriptTag.async = true;
    scriptTag.defer = true;
    scriptTag.onerror = () => emit('error', new Error('Turnstile script failed to load.'));
    document.head.appendChild(scriptTag);

    scriptTag.onload = registerRenderTurnstileCallback;

  }else {
    renderTurnstile();
  }

});

/**
 * Cleanup function to remove script and clear the captcha container
 */
function cleanup() {
  // Remove the Turnstile script tag
  const script = document.getElementById(props.scriptId);
  script?.remove();

  // Clear the captcha container div
  if (turnstileDiv.value) {
    turnstileDiv.value.innerHTML = '';
  }

  // Remove global callbacks to avoid memory leaks
  delete window.onloadTurnstileCallback;
  delete window.turnstile;
}

// Lifecycle: on component unmount
onBeforeUnmount(() => {
  cleanup();
});
</script>

<template>
  <div ref="turnstileDiv"></div>
</template>
