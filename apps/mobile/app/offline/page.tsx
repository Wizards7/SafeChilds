import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Icon } from "../../components/Icon";

// Served by the service worker when a route was never cached and the phone is offline.
export default async function OfflinePage() {
  const t = await getTranslations("pwa");
  return (
    <main className="no-nav" style={{ justifyContent: "center" }}>
      <div className="card card-neutral" style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <div className="head"><Icon name="wifi-off" />{t("offlinePage.title")}</div>
        <p className="small">{t("offlinePage.body")}</p>
      </div>
      <Link className="btn btn-primary" href="/">{t("offlinePage.home")}</Link>
    </main>
  );
}
