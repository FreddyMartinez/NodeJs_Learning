declare module 'nodemailer-stub' {
  import { TransportOptions } from "nodemailer";

  type Mail = {
    to: string | Array<string>;
    content: string;
  }

  interface InteractsWithMail {
    lastMail: () => Mail;
    newMail: (mail: unknown) => InteractsWithMail;
    flushMails: () => void;
    sentMailsCount: () => number;
  }

  type ErrorTransport = {
    send: (mail: unknown, callback: () => void) => void;
  }

  const errorTransport: ErrorTransport;
  const interactsWithMail: InteractsWithMail;
  const stubTransport: TransportOptions;

  export {
    errorTransport,
    interactsWithMail,
    stubTransport
  };
}
