export const email_template = ({otp,otp_ttl,userName})=>{
    return `<!DOCTYPE html>
<html lang="en" dir="ltr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verification Code</title>
</head>
<body style="margin:0; padding:0; background-color:#f4f6f8; font-family:Helvetica, Arial, sans-serif;">

  <!-- Preheader (text shown in the inbox preview) -->
  <div style="display:none; max-height:0; overflow:hidden; opacity:0;">
    Your verification code is ${otp}. It expires in 3 minutes.
  </div>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f6f8; padding:24px 12px;">
    <tr>
      <td align="center">

        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px; background-color:#ffffff; border-radius:12px; overflow:hidden; box-shadow:0 2px 8px rgba(0,0,0,0.06);">

          <!-- Logo -->
          <tr>
            <td align="center" style="background-color:#1a7347; padding:24px;">
              <!-- <img src="{{LOGO_URL}}" alt="{{APP_NAME}}" height="40" style="display:block;"> -->
              <span style="color:#ffffff; font-size:22px; font-weight:bold;">Saraha App</span>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding:32px 28px; text-align:center; color:#333333;">
              <h1 style="margin:0 0 12px; font-size:20px; color:#111111;">Verification Code</h1>
              <p style="margin:0 0 24px; font-size:15px; line-height:1.7; color:#555555;">
                Hi ${userName},<br>
                Use the code below to complete your verification:
              </p>

              <!-- OTP code -->
              <div style="display:inline-block; background-color:#f0f4ff; border:2px dashed #1a73e8; border-radius:10px; padding:14px 28px;">
                <span style="font-size:34px; font-weight:bold; letter-spacing:10px; color:#1a73e8; font-family:'Courier New', monospace;">${otp}</span>
              </div>

              <p style="margin:24px 0 0; font-size:14px; color:#777777;">
                This code is valid for <strong>3 minutes</strong> only.
              </p>
            </td>
          </tr>

          <!-- Security notice -->
          <tr>
            <td style="padding:0 28px 28px;">
              <div style="background-color:#fff8e1; border-left:4px solid #f9a825; border-radius:6px; padding:12px 14px; font-size:13px; line-height:1.7; color:#6d5400; text-align:left;">
                ⚠️ Never share this code with anyone, even if they claim to be from Saraha App. We will never ask for it by phone or message.
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="background-color:#fafafa; padding:18px 24px; font-size:12px; line-height:1.7; color:#999999; border-top:1px solid #eeeeee;">
              If you didn't request this code, you can safely ignore this email.<br>
              © 2026 Saraha App. All rights reserved.
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>

</body>
</html>`
}