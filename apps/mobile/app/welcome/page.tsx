import { getLocale } from "next-intl/server";
import { Welcome } from "./Welcome";

export default async function WelcomePage() {
  const locale = await getLocale();
  return <Welcome initialLocale={locale === "tg" ? "tg" : "ru"} />;
}
