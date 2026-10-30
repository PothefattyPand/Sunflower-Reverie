"use client";

import { useTransition } from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { togglePublishStatusAction } from "@/app/author/dashboard/actions";

interface PublishToggleProps {
  publicationId: string;
  currentStatus: "draft" | "published";
}

export function PublishToggle({ publicationId, currentStatus }: PublishToggleProps) {
  const [isPending, startTransition] = useTransition();

  const handleToggle = () => {
    const nextStatus = currentStatus === "published" ? "draft" : "published";
    startTransition(async () => {
      await togglePublishStatusAction(publicationId, nextStatus);
    });
  };

  const isPublished = currentStatus === "published";

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={handleToggle}
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-patrick font-bold transition-colors ${
        isPublished
          ? "bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300"
          : "bg-emerald-100 hover:bg-emerald-200 text-emerald-900 border border-emerald-300"
      }`}
      title={isPublished ? "Unpublish to drafts" : "Publish live to sanctuary"}
    >
      {isPending ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
      ) : isPublished ? (
        <EyeOff className="w-3.5 h-3.5 text-amber-800" />
      ) : (
        <Eye className="w-3.5 h-3.5 text-emerald-800" />
      )}
      <span>{isPending ? "Updating..." : isPublished ? "Unpublish" : "Publish Live"}</span>
    </button>
  );
}

