// Extend the Window interface
interface Window {
    hcaptcha?: any;
    grecaptcha?: any;
    turnstile?: any;
    onloadRecaptchaCallback?: () => void;
    onloadHcaptchaCallback?: () => void;
    onloadTurnstileCallback?: () => void;
    turnstileReady?: () => void;
}
