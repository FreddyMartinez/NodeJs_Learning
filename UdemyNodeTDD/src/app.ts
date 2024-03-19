import express from "express";
import { userRouter } from "./routes/userRouter";
import i18next from "i18next";
import NexFsBackend from "i18next-fs-backend";
import { LanguageDetector, handle } from "i18next-http-middleware";

i18next
  .use(NexFsBackend)
  .use(LanguageDetector)
  .init({
    fallbackLng: "en",
    lng: "en",
    ns: ["translation"],
    defaultNS: "translation",
    backend: {
      loadPath: "locales/{{lng}}/{{ns}}.json",
    },
    detection: {
      lookupHeader: "accept-language",
    },
  });

const app = express();
app.use(express.json());
app.use(handle(i18next));

app.use(userRouter);

export { app };
