import { notFound } from "next/navigation";
import { getModel } from "@/lib/db";
import SharedViewer from "./SharedViewer";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const model = await getModel(id);
  if (!model) return { title: "모델을 찾을 수 없습니다" };
  return {
    title: `${model.name} — 3D Platform`,
    description: `3D 모델 뷰어: ${model.name}`,
  };
}

export default async function SharedViewPage({ params }: Props) {
  const { id } = await params;
  const model = await getModel(id);
  if (!model) notFound();

  return (
    <div className="flex flex-col h-screen bg-zinc-950 text-white">
      <SharedViewer model={model} />
    </div>
  );
}
