"use client";

import AnalyzePage from "@/app/analyze/page";
import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

export default function AnalyzeModePage() {
  const params = useParams<{ mode?: string }>();
  const router = useRouter();

  useEffect(() => {
    const mode = (params?.mode || "").toString();
    if (mode !== "chart" && mode !== "upload") {
      router.replace("/analyze");
    }
  }, [params, router]);

  return <AnalyzePage />;
}


