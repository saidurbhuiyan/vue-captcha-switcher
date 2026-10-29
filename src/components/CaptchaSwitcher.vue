<script lang="ts" setup>
import { ref, watch, computed } from "vue";
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
  (e: 'verify', response: string): void;
  (e: 'expire'): void;
  (e: 'fail'): void;
  (e: 'error', error: Error): void;
  (e: 'captchaReset'): void;
}>();

const captchaRef = ref<any>(null);

// Emit verify
const onVerify = (response: string) => {
  emit('update:modelValue', response);
  emit('verify', response);
};

// Clear the stale token when it expires or fails
const onExpire = () => {
  emit('update:modelValue', '');
  emit('expire');
};
const onFail = () => {
  emit('update:modelValue', '');
  emit('fail');
};

// Reset support
const reset = () => {
  captchaRef.value?.reset();
  emit('update:modelValue', '');
};
const execute = () => captchaRef.value?.execute();
defineExpose({ reset, execute });

watch(() => props.captchaReset, (val) => {
  if (val) {
    reset();
    emit('captchaReset');
  }
});

// Re-render the widget when any render option changes
const widgetKey = computed(() => `${props.captchaName}-${props.publicKey}-${props.theme}-${props.size}`);

// A token from the previous widget is no longer valid
watch(widgetKey, () => {
  if (props.modelValue) emit('update:modelValue', '');
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
    :key="widgetKey"
    :sitekey="publicKey"
    :theme="theme"
    :size="size"
    :script-id="captchaScriptIds?.[captchaName]"
    @verify="onVerify"
    @expire="onExpire"
    @fail="onFail"
    @error="emit('error', $event)"
    ref="captchaRef"
  />
</template>
