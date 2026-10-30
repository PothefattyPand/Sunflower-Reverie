"use client";

import { useState, useTransition } from "react";
import { AlertTriangle, Trash2, X } from "lucide-react";
import { deletePublicationAction } from "@/app/author/dashboard/actions";

interface DeleteConfirmModalProps {
  publicationId: string;
  publicationTitle: string;
}

export function DeleteConfirmModal({
  publicationId,
  publicationTitle,
}: DeleteConfirmModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleDelete = () => {
    setError(null);
    startTransition(async () => {
      const res = await deletePublicationAction(publicationId);
      if (res.error) {
        setError(res.error);
      } else {
        setIsOpen(false);
      }
    });
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-1 text-xs font-patrick font-semibold text-red-700/80 hover:text-red-700 p-1 hover:bg-red-50 rounded-md transition-colors"
        title="Delete publication"
      >
        <Trash2 className="w-3.5 h-3.5" />
        <span>Delete</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#3B3028]/40 backdrop-blur-xs">
          <div className="relative w-full max-w-md rounded-3xl border-2 border-[#EADBCE] bg-[#FFF9EC] p-6 sm:p-8 shadow-lg space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-[#EADBCE]">
              <div className="flex items-center gap-2 text-red-700 font-patrick text-base font-bold">
                <AlertTriangle className="w-4 h-4 text-red-600" />
                <span>Confirm Removal</span>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-full text-[#6B584C] hover:text-[#3B3028]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2">
              <h3 className="font-patrick text-xl font-bold text-[#3B3028]">
                Remove &ldquo;{publicationTitle}&rdquo;?
              </h3>
              <p className="text-xs sm:text-sm font-nunito text-[#6B584C] leading-relaxed">
                This piece will be permanently removed from your writing desk and from all public reading archives. This action cannot be reversed.
              </p>
            </div>

            {error && (
              <p className="text-xs text-red-700 font-nunito bg-red-50 p-2.5 rounded-lg border border-red-200">
                {error}
              </p>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                disabled={isPending}
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 rounded-full border border-[#EADBCE] text-xs font-patrick font-bold text-[#6B584C] hover:text-[#3B3028] transition-colors"
              >
                Keep Manuscript
              </button>
              <button
                type="button"
                disabled={isPending}
                onClick={handleDelete}
                className="px-5 py-2 rounded-full bg-red-700 hover:bg-red-800 text-white text-xs font-patrick font-bold transition-colors disabled:opacity-50"
              >
                {isPending ? "Removing..." : "Delete Permanently"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

