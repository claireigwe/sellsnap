import sgMail from '@sendgrid/mail';

const apiKey = process.env.SENDGRID_API_KEY;
if (apiKey) {
  sgMail.setApiKey(apiKey);
}

const FROM_EMAIL = 'somiigwe@gmail.com';

export async function sendOrderNotificationEmail(
  sellerEmail: string,
  buyerEmail: string | null,
  productName: string,
  amountNaira: number
) {
  if (!apiKey) {
    console.log('Mock email: Order notification to', sellerEmail, 'for', productName);
    return;
  }

  try {
    await sgMail.send({
      from: FROM_EMAIL,
      to: sellerEmail,
      subject: `New Order: ${productName}`,
      html: `
        <div style="font-family: sans-serif; padding: 24px; max-width: 600px;">
          <h1 style="color: #006C59;">You have a new order!</h1>
          <p>You just received a payment of <strong>₦${amountNaira.toLocaleString('en-NG')}</strong> for <strong>${productName}</strong>.</p>
          <p>Buyer Email: ${buyerEmail || 'Anonymous'}</p>
          <p>Check your dashboard for more details.</p>
        </div>
      `,
    });
  } catch (error) {
    console.error('Failed to send order notification email:', error);
  }
}

export async function sendPasswordResetEmail(email: string, resetToken: string) {
  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth?mode=reset&token=${resetToken}`;

  if (!apiKey) {
    console.log('Mock email: Password reset to', email, 'with URL:', resetUrl);
    return;
  }

  try {
    await sgMail.send({
      from: FROM_EMAIL,
      to: email,
      subject: 'Reset your SellSnap password',
      html: `
        <div style="font-family: sans-serif; padding: 24px; max-width: 600px;">
          <h1 style="color: #006C59;">Reset your password</h1>
          <p>Click the button below to reset your password:</p>
          <a href="${resetUrl}" style="display: inline-block; background: #006C59; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin: 16px 0;">Reset Password</a>
          <p style="color: #666; font-size: 14px;">This link expires in 1 hour.</p>
        </div>
      `,
    });
  } catch (error) {
    console.error('Failed to send password reset email:', error);
  }
}

export async function sendVerificationEmail(email: string, token: string) {
  const verifyUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/verify-email?token=${token}`;

  if (!apiKey) {
    console.log('Mock email: Verification to', email, 'with URL:', verifyUrl);
    return;
  }

  try {
    await Promise.race([
      sgMail.send({
        from: FROM_EMAIL,
        to: email,
        subject: 'Verify your email address — SellSnap',
        html: `
          <div style="font-family: sans-serif; padding: 24px; max-width: 600px;">
            <h1 style="color: #006C59;">Welcome to SellSnap!</h1>
            <p>Click the button below to verify your email address and get started:</p>
            <a href="${verifyUrl}" style="display: inline-block; background: #006C59; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin: 16px 0;">Verify Email</a>
            <p style="color: #666; font-size: 14px;">This link expires in 24 hours.</p>
            <p style="color: #666; font-size: 14px;">If you didn't create an account, you can ignore this email.</p>
          </div>
        `,
      }),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Email timeout')), 10000)),
    ]);
  } catch (error) {
    console.error('Failed to send verification email:', error);
  }
}