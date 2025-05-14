<script lang="ts" setup>
// Import necessary functions from Vue
import { onMounted, ref, watch } from "vue";
import TurnstileCaptcha from "./TurnstileCaptcha.vue";
import RecaptchaV2 from "./RecaptchaV2.vue";
import HCaptcha from "./HCaptcha.vue";

// Define props for the CaptchaSwitcher component with TypeScript
interface CaptchaSwitcherProps {
  modelValue: string; // Captcha response value
  captchaName: string; // Name of the selected captcha service
  publicKey: string; // Public key for the captcha service
  captchaScriptIds?: {
    recaptcha?: string; // Optional script ID for reCAPTCHA
    hcaptcha?: string; // Optional script ID for hCaptcha
    turnstile?: string; // Optional script ID for Turnstile
  };
  captchaReset?: boolean; // Optional flag to reset the captcha
  theme?: string; // Optional theme (light or dark)
  size?: string; // Optional size of the captcha (normal or compact)
}

// Use defineProps with the CaptchaSwitcherProps interface
const props = defineProps<CaptchaSwitcherProps>();

// Define events emitted by the component
const emit = defineEmits<{
  (e: 'update:modelValue', response: string): void; // Event for updating the captcha response
  (e: 'captchaReset'): void; // Event for captcha reset
}>();

// Reference to the currently rendered captcha component
const captcha = ref<InstanceType<typeof HCaptcha | typeof RecaptchaV2 | typeof TurnstileCaptcha> | null>(null);

// Callback function when captcha verification is successful
const onVerify = (response: string) => {
  emit('update:modelValue', response); // Emit the response value
};

// Watch for changes in captchaReset prop to trigger reset
watch(() => props.captchaReset, (newValue) => {
  if (newValue && captcha.value) {
    captcha.value.reset(); // Reset the captcha
    emit('captchaReset'); // Emit the reset event
  }
});

// Function to remove scripts for inactive captcha services
const removeCaptchaScript = (currentCaptchaName: string) => {
  Object.keys(props.captchaScriptIds || {}).forEach((captchaKey) => {
    if (captchaKey !== currentCaptchaName) {
      const scriptId = props.captchaScriptIds![captchaKey as keyof typeof props.captchaScriptIds]; // Get the script ID
      const scriptTag = document.getElementById(scriptId); // Find the script tag
      if (scriptTag) {
        scriptTag.remove(); // Remove the script tag
      }
    }
  });
};

// Lifecycle hook to run when the component is mounted
onMounted(() => {
  removeCaptchaScript(props.captchaName); // Remove inactive captcha scripts
});
</script>

<template>
  <HCaptcha
      v-if="captchaName === 'hcaptcha'"
      :sitekey="publicKey"
      :theme="theme"
      :size="size"
      :scriptId="captchaScriptIds?.hcaptcha"
      @verify="onVerify"
      ref="captcha"
  />
  <RecaptchaV2
      v-if="captchaName === 'recaptcha'"
      :sitekey="publicKey"
      :theme="theme"
      :size="size"
      :scriptId="captchaScriptIds?.recaptcha"
      @verify="onVerify"
      ref="captcha"
  />
  <TurnstileCaptcha
      v-if="captchaName === 'turnstile'"
      :sitekey="publicKey"
      :theme="theme"
      :size="size"
      :scriptId="captchaScriptIds?.turnstile"
      @verify="onVerify"
      ref="captcha"
  />
</template>
