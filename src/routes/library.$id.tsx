import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DiseaseDetail } from "@/components/clinical/disease-detail";
import { DISEASE_BY_ID } from "@/lib/clinical/catalog";
import { useT } from "@/lib/i18n";

export const Route = createFileRoute("/library/$id")({ component: DiseasePage });

function DiseasePage() {
  const { id } = Route.useParams();
  const { t } = useT();
  const d = DISEASE_BY_ID[id];
  if (!d) {
    return (
      <main className="mx-auto max-w-xl px-4 py-16 text-center">
        <h1 className="font-display text-3xl font-bold">{t("notFound")}</h1>
        <Button asChild className="mt-6" variant="outline">
          <Link to="/library">{t("backConditions")}</Link>
        </Button>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <Button asChild variant="ghost">
        <Link to="/library">
          <ArrowLeft />
          {t("backConditions")}
        </Link>
      </Button>
      <div className="mt-4">
        <DiseaseDetail disease={d} />
      </div>
    </main>
  );
}
