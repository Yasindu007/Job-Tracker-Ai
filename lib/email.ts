import nodemailer from 'nodemailer';

const transport = nodemailer.createTransport({
  host: process.env.EMAIL_SERVER_HOST,
  port: Number(process.env.EMAIL_SERVER_PORT),
  auth: {
    user: process.env.EMAIL_SERVER_USER,
    pass: process.env.EMAIL_SERVER_PASSWORD,
  },
});

export async function sendVerificationEmail(email: string, token: string) {
  const verificationLink = `${process.env.NEXTAUTH_URL}/auth/verify-email?token=${token}`;

  console.log(`Sending verification email to ${email} with link: ${verificationLink}`);

  // In a real application, you would send an email here.
  // For this example, we are just logging to the console.
  //   await transport.sendMail({
  //     from: process.env.EMAIL_FROM,
  //     to: email,
  //     subject: 'Verify your email address',
  //     html: `<p>Click <a href="${verificationLink}">here</a> to verify your email address.</p>`,
  //   });
}
