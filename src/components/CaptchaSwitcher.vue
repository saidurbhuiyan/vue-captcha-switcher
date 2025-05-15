<script lang="ts" setup>
import { onMounted, onBeforeUnmount, ref, watch, computed } from "vue";
import TurnstileCaptcha from "./TurnstileCaptcha.vue";
import RecaptchaV2 from "./RecaptchaV2.vue";
import HCaptcha from "./HCaptcha.vue";

// Props
interface CaptchaSwitcherProps {
  modelValue: string;
  captchaName: 'recaptcha' | 'hcaptcha' | 'turnstile';
  publicKey: string;
  captchaScriptIds?: {
    recaptcha?: string;
    hcaptcha?: string;
    turnstile?: string;
  };
  captchaReset?: boolean;
  theme?: string;
  size?: string;
}
const props = defineProps<CaptchaSwitcherProps>();

// Emits
const emit = defineEmits<{
  (e: 'update:modelValue', response: string): void;
  (e: 'captchaReset'): void;
}>();

const captchaRef = ref<any>(null);

// Emit verify
const onVerify = (response: string) => {
  emit('update:modelValue', response);
};

// Reset support
watch(() => props.captchaReset, (val) => {
  if (val && captchaRef.value?.reset) {
    captchaRef.value.reset();
    emit('captchaReset');
  }
});

// Cleanup old scripts
const removeOtherCaptchaScripts = (keep: string) => {
  const ids = props.captchaScriptIds || {};
  for (const [key, id] of Object.entries(ids)) {
    if (key !== keep && id) {
      const el = document.getElementById(id);
      if (el) el.remove();
    }
  }
};

// Also run on change
watch(() => props.captchaName, (newName) => {
  removeOtherCaptchaScripts(newName);
});

// Run initially
onMounted(() => {
  removeOtherCaptchaScripts(props.captchaName);
});

// Final cleanup on unmount
onBeforeUnmount(() => {
  removeOtherCaptchaScripts(''); // remove all
});

// Dynamic component mapping
const currentComponent = computed(() => {
  return {
    recaptcha: RecaptchaV2,
    hcaptcha: HCaptcha,
    turnstile: TurnstileCaptcha
  }[props.captchaName];
});
</script>

<template>
  <component
    :is="currentComponent"
    :sitekey="publicKey"
    :theme="theme"
    :size="size"
    :script-id="captchaScriptIds?.[captchaName]"
    @verify="onVerify"
    ref="captchaRef"
  />
</template>
