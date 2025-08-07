import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import { TriangleAlert } from "lucide-react";

export default async function NotFound() {
  const lang = await getLocale();
  const t = await getTranslations({ locale: lang, namespace: "common" });

  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center text-center">
      <div className="bg-card text-card-foreground rounded-lg border p-8 shadow-sm">
        <TriangleAlert className="text-primary mx-auto h-16 w-16" />
        <h1 className="mt-6 text-5xl font-bold">404</h1>
        <p className="text-muted-foreground mt-4 text-2xl">
          {t("navigation.page_not_found")}
        </p>
        <Link href={`/${lang}`}>
          <button className="bg-primary text-primary-foreground mt-8 rounded-md px-6 py-2">
            {t("navigation.go_to_homepage")}
          </button>
        </Link>
      </div>
    </div>
  );
}
