import React from 'react';
// import ReCAPTCHA from "react-google-recaptcha";

// const RECAPTCHA_SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

export default function CaptchaVerification({ onVerify }) {
  // const handleVerify = (token) => {
  //   if (token) {
  //     onVerify(token);
  //   }
  // };

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <p className="mb-4 text-center">Please complete the CAPTCHA to continue</p>
      {/* <ReCAPTCHA
        sitekey={RECAPTCHA_SITE_KEY}
        onChange={handleVerify}
      /> */}
    </div>
  );
}