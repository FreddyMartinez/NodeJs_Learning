import { createTransport } from "nodemailer";


export async function sendEmail(email: string, token: string) {
  const transport = createTransport({
    host: "localhost",
    port: 8081,
    tls: {
      rejectUnauthorized: false,
    },
  });
  await transport.sendMail({
    from: "Test App <info@test-app-com>",
    to: email,
    subject: "Account Activation",
    text: `Your activation token is ${token}`,
  });
}
