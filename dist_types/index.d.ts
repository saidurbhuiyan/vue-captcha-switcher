import { DefineComponent } from 'vue';

export interface CaptchaSwitcherProps {
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
    'onUpdate:modelValue'?: (response: string) => void;
    onVerify?: (response: string) => void;
    onExpire?: () => void;
    onFail?: () => void;
    onError?: (error: Error) => void;
    onCaptchaReset?: () => void;
}

declare const CaptchaSwitcher: DefineComponent<CaptchaSwitcherProps>;
export default CaptchaSwitcher;
