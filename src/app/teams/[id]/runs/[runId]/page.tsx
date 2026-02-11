import { notFound } from "next/navigation";
import { DecisionChain } from "@/components/pipeline/decision-chain";
import { getPipelineRunDetail } from "@/lib/store/memory";

interface RunDetailPageProps {
  params: Promise<{
    id: string;
    runId: string;
  }>;
}

export default async function RunDetailPage({ params }: RunDetailPageProps) {
  const { runId } = await params;
  const detail = getPipelineRunDetail(runId);

  if (!detail) {
    notFound();
  }

  return <DecisionChain run={detail.run} outputs={detail.outputs} />;
}
