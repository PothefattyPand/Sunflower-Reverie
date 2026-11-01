"use client";

import { useState, useTransition, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Feather,
  Heading,
  Image as ImageIcon,
  ImagePlus,
  Italic,
  Bold,
  Quote,
  Sparkles,
  Upload,
  AlertCircle,
  RefreshCw,
  Trash2,
  X,
  Check,
  Sun,
  BookOpen,
} from "lucide-react";
import { savePublicationAction, uploadAssetAction } from "@/app/author/dashboard/actions";

interface PublicationData {
  id?: string;
  title: string;
  subtitle?: string | null;
  slug: string;
  category: string;
  writing_subtype?: string | null;
  excerpt: string;
  body: string;
  cover_image?: string | null;
  tags?: string[] | null;
  status: "draft" | "published";
  reading_time?: string | null;
  is_anonymous?: boolean;
}

export const VALID_CATEGORIES = ["blog", "poetry", "journal", "writing"] as const;
export type WritingCategory = (typeof VALID_CATEGORIES)[number];

export interface CategoryOption {
  value: WritingCategory;
  label: string;
  subtitle: string;
  archivePath: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const CATEGORY_OPTIONS: CategoryOption[] = [
  {
    value: "blog",
    label: "Blog",
    subtitle: "Thoughts Beneath the Sun",
    archivePath: "/blogs",
    icon: Sun,
  },
  {
    value: "poetry",
    label: "Poetry",
    subtitle: "Verses in Bloom",
    archivePath: "/poetry",
    icon: Feather,
  },
  {
    value: "journal",
    label: "Journal",
    subtitle: "Pages of Reflection",
    archivePath: "/journal",
    icon: BookOpen,
  },
  {
    value: "writing",
    label: "Writings",
    subtitle: "Letters & Other Words",
    archivePath: "/writings",
    icon: Sparkles,
  },
];

interface WritingEditorProps {
  mode: "create" | "edit";
  initialData?: PublicationData;
}

export function WritingEditor({ mode, initialData }: WritingEditorProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Validate and sanitize initial category so existing publications always retain their category
  const initialCategory: WritingCategory =
    initialData?.category && (VALID_CATEGORIES as readonly string[]).includes(initialData.category)
      ? (initialData.category as WritingCategory)
      : "blog";

  // Form fields state
  const [title, setTitle] = useState(initialData?.title || "");
  const [subtitle, setSubtitle] = useState(initialData?.subtitle || "");
  const [slug, setSlug] = useState(initialData?.slug || "");
  const [category, setCategory] = useState<WritingCategory>(initialCategory);
  const [writingSubtype, setWritingSubtype] = useState(initialData?.writing_subtype || "essay");
  const [excerpt, setExcerpt] = useState(initialData?.excerpt || "");
  const [body, setBody] = useState(initialData?.body || "");
  const [coverImage, setCoverImage] = useState(initialData?.cover_image || "");
  const [tags, setTags] = useState(initialData?.tags?.join(", ") || "");
  const [status, setStatus] = useState<"draft" | "published">(initialData?.status || "draft");
  const [isAnonymous, setIsAnonymous] = useState(Boolean(initialData?.is_anonymous));

  const bodyTextareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Inline image insertion modal state
  const [showInlineImageModal, setShowInlineImageModal] = useState(false);
  const [inlineImageUrl, setInlineImageUrl] = useState("");
  const [inlineImageAlt, setInlineImageAlt] = useState("");
  const [isInlineUploading, setIsInlineUploading] = useState(false);
  const [inlineUploadError, setInlineUploadError] = useState<string | null>(null);
  const cursorPosRef = useRef<{ start: number; end: number }>({ start: 0, end: 0 });
  const inlineFileInputRef = useRef<HTMLInputElement>(null);

  // Auto-generate slug from title if user hasn't explicitly customized it
  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (mode === "create" && (!slug || slug === title.toLowerCase().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-"))) {
      setSlug(
        val
          .toLowerCase()
          .replace(/[^\w\s-]/g, "")
          .replace(/\s+/g, "-")
          .slice(0, 60)
      );
    }
  };

  // Helper to insert markdown formatting at cursor position
  const insertFormatting = (prefix: string, suffix: string = "") => {
    const textarea = bodyTextareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = body.substring(start, end);
    const replacement = `${prefix}${selectedText || "text"}${suffix}`;

    const newBody = body.substring(0, start) + replacement + body.substring(end);
    setBody(newBody);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + replacement.length - suffix.length);
    }, 50);
  };

  // Open inline image insertion modal
  const handleOpenInlineImageModal = () => {
    if (bodyTextareaRef.current) {
      cursorPosRef.current = {
        start: bodyTextareaRef.current.selectionStart,
        end: bodyTextareaRef.current.selectionEnd,
      };
    } else {
      cursorPosRef.current = { start: body.length, end: body.length };
    }
    setInlineImageUrl("");
    setInlineImageAlt("");
    setInlineUploadError(null);
    setShowInlineImageModal(true);
  };

  // Upload inline image directly to author's Supabase Storage folder
  const handleInlineFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setInlineUploadError("Image exceeds 5MB size limit. Please choose a smaller image.");
      if (inlineFileInputRef.current) inlineFileInputRef.current.value = "";
      return;
    }

    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/avif", "image/gif"];
    if (!validTypes.includes(file.type)) {
      setInlineUploadError("Invalid image format. Allowed formats: JPG, PNG, WEBP, AVIF, GIF.");
      if (inlineFileInputRef.current) inlineFileInputRef.current.value = "";
      return;
    }

    setIsInlineUploading(true);
    setInlineUploadError(null);

    const formData = new FormData();
    formData.append("file", file);

    const res = await uploadAssetAction(formData);
    setIsInlineUploading(false);
    if (inlineFileInputRef.current) inlineFileInputRef.current.value = "";

    if (res.error) {
      setInlineUploadError(res.error);
    } else if (res.url) {
      setInlineImageUrl(res.url);
      if (!inlineImageAlt.trim()) {
        const cleanName = file.name
          .replace(/\.[^/.]+$/, "")
          .replace(/[-_]+/g, " ")
          .trim();
        setInlineImageAlt(cleanName);
      }
    }
  };

  // Insert inline image markdown at current cursor position
  const handleInsertInlineImage = () => {
    if (!inlineImageUrl.trim()) {
      setInlineUploadError("Please upload an image or provide an image URL first.");
      return;
    }

    const sanitizedAlt = (inlineImageAlt.trim() || "Manuscript Illustration")
      .replace(/[\[\]]/g, "");
    const url = inlineImageUrl.trim();
    const markdownImage = `\n\n![${sanitizedAlt}](${url})\n\n`;

    const start = cursorPosRef.current.start;
    const end = cursorPosRef.current.end;
    const newBody = body.substring(0, start) + markdownImage + body.substring(end);
    setBody(newBody);
    setShowInlineImageModal(false);

    setTimeout(() => {
      if (bodyTextareaRef.current) {
        bodyTextareaRef.current.focus();
        const newPos = start + markdownImage.length;
        bodyTextareaRef.current.setSelectionRange(newPos, newPos);
      }
    }, 50);
  };

  // Handle direct image file upload for cover artwork
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage("Cover artwork exceeds the 5MB size limit. Please choose a smaller image.");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/avif", "image/gif"];
    if (!validTypes.includes(file.type)) {
      setErrorMessage("Invalid image format. Allowed formats: JPG, PNG, WEBP, AVIF, GIF.");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    setIsUploading(true);
    setErrorMessage(null);

    const formData = new FormData();
    formData.append("file", file);

    const res = await uploadAssetAction(formData);
    setIsUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";

    if (res.error) {
      setErrorMessage(res.error);
    } else if (res.url) {
      setCoverImage(res.url);
    }
  };

  // Form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    startTransition(async () => {
      const formData = new FormData();
      if (initialData?.id) {
        formData.append("id", initialData.id);
      }
      formData.append("title", title);
      formData.append("subtitle", subtitle);
      formData.append("slug", slug);
      formData.append("category", category);
      if (category === "writing") {
        formData.append("writingSubtype", writingSubtype);
      }
      formData.append("excerpt", excerpt);
      formData.append("body", body);
      formData.append("coverImage", coverImage);
      formData.append("tags", tags);
      formData.append("status", status);
      formData.append("isAnonymous", String(isAnonymous));

      const res = await savePublicationAction(null, formData);
      if (res.error) {
        setErrorMessage(res.error);
      } else {
        router.push("/author/dashboard");
        router.refresh();
      }
    });
  };

  const isPoetry = category === "poetry";

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-[#EADBCE]">
        <Link
          href="/author/dashboard"
          className="inline-flex items-center gap-2 text-base font-patrick font-bold text-[#6B584C] hover:text-[#3B3028] transition-colors"
        >
          <ArrowLeft className="w-4 h-4 text-[#E8AF30]" />
          <span>Back to My Writing Desk</span>
        </Link>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Link
            href="/author/dashboard"
            className="px-5 py-2.5 rounded-full border border-[#EADBCE] text-sm font-patrick font-bold text-[#6B584C] hover:text-[#3B3028] transition-colors"
          >
            Cancel
          </Link>

          <button
            type="submit"
            disabled={isPending || isUploading}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-7 py-2.5 rounded-full bg-[#E8AF30] hover:bg-[#F4C542] text-[#3B3028] font-patrick text-base font-bold shadow-xs transition-all disabled:opacity-50 cursor-pointer"
          >
            <Feather className="w-4 h-4" />
            <span>
              {isPending
                ? "Preserving Words..."
                : mode === "create"
                ? status === "published"
                  ? "Publish to Sanctuary"
                  : "Save to My Drafts"
                : "Update Publication"}
            </span>
          </button>
        </div>
      </div>

      {errorMessage && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-sm font-nunito flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold">Notice from Writing Desk</p>
            <p className="leading-relaxed">{errorMessage}</p>
          </div>
        </div>
      )}

      {/* Editor Body Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Writing Canvas (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Title */}
          <div className="space-y-1.5">
            <label htmlFor="title" className="block text-xs font-patrick uppercase tracking-wider text-[#718B55]">
              Title of the Piece *
            </label>
            <input
              id="title"
              type="text"
              required
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="e.g., The Geometry of Morning Light"
              className="w-full px-4 py-3 rounded-2xl bg-[#FFF3D9]/60 border border-[#EADBCE] font-caveat text-3xl sm:text-4xl text-[#3B3028] placeholder-[#6B584C]/50 focus:outline-hidden focus:border-[#E8AF30] focus:ring-1 focus:ring-[#E8AF30] transition-colors"
            />
          </div>

          {/* Subtitle */}
          <div className="space-y-1.5">
            <label htmlFor="subtitle" className="block text-xs font-patrick uppercase tracking-wider text-[#718B55] font-bold">
              Subtitle / Epigraph (Optional)
            </label>
            <input
              id="subtitle"
              type="text"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              placeholder="e.g., Reflections on dawn shadows and the writing day"
              className="w-full px-4 py-2.5 rounded-xl bg-[#FFF3D9]/40 border border-[#EADBCE] font-kalam text-lg text-[#6B584C] placeholder-[#6B584C]/50 focus:outline-hidden focus:border-[#E8AF30] transition-colors"
            />
          </div>

          {/* Writing Category Selector (Prominent near top of editor, below title & subtitle) */}
          <div className="space-y-3 p-5 sm:p-6 rounded-2xl bg-[#FFF3D9]/60 border border-[#EADBCE]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
              <div>
                <label className="block text-xs font-patrick uppercase tracking-wider text-[#718B55] font-bold">
                  Writing Category *
                </label>
                <p className="text-xs font-nunito text-[#6B584C] mt-0.5">
                  Select which archive folio this piece belongs to:
                </p>
              </div>
              <span className="text-xs font-patrick font-bold text-[#E8AF30]">
                Preselected: {CATEGORY_OPTIONS.find((c) => c.value === category)?.label}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {CATEGORY_OPTIONS.map((opt) => {
                const isSelected = category === opt.value;
                const IconComponent = opt.icon;
                return (
                  <label
                    key={opt.value}
                    htmlFor={`category-${opt.value}`}
                    className={`relative flex flex-col justify-between p-3.5 sm:p-4 rounded-2xl border-2 transition-all cursor-pointer text-left select-none ${
                      isSelected
                        ? "border-[#E8AF30] bg-[#FFF3D9] shadow-xs ring-1 ring-[#E8AF30]"
                        : "border-[#EADBCE] bg-[#FFF9EC] hover:border-[#E8AF30]/60 hover:bg-[#FFF3D9]/30"
                    }`}
                  >
                    <input
                      type="radio"
                      id={`category-${opt.value}`}
                      name="category_selection"
                      value={opt.value}
                      checked={isSelected}
                      onChange={() => setCategory(opt.value)}
                      className="sr-only"
                    />

                    <div className="flex items-center justify-between w-full mb-2">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                          isSelected
                            ? "bg-[#E8AF30] text-[#3B3028]"
                            : "bg-[#FFF3D9] text-[#718B55]"
                        }`}
                      >
                        <IconComponent className="w-4 h-4" />
                      </div>

                      <div
                        className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${
                          isSelected
                            ? "border-[#E8AF30] bg-[#E8AF30]"
                            : "border-[#D0C2B4] bg-[#FFF9EC]"
                        }`}
                      >
                        {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </div>
                    </div>

                    <div>
                      <span className="font-patrick text-lg sm:text-xl font-bold text-[#3B3028] block leading-tight">
                        {opt.label}
                      </span>
                      <span className="text-xs font-nunito text-[#6B584C] block mt-0.5 leading-snug">
                        {opt.subtitle}
                      </span>
                      <span className="inline-block mt-2 px-2 py-0.5 rounded-full bg-[#FFF9EC] border border-[#EADBCE] text-[10px] font-mono text-[#718B55] font-semibold">
                        {opt.archivePath}
                      </span>
                    </div>
                  </label>
                );
              })}
            </div>

            {/* Writing Subtype selector when 'writing' is chosen */}
            {category === "writing" && (
              <div className="p-3.5 rounded-xl bg-[#FFF9EC] border border-[#EADBCE] flex flex-col sm:flex-row sm:items-center gap-3">
                <label htmlFor="writingSubtype" className="text-xs font-patrick uppercase tracking-wider text-[#718B55] font-bold whitespace-nowrap">
                  Writing Subtype:
                </label>
                <select
                  id="writingSubtype"
                  value={writingSubtype}
                  onChange={(e) => setWritingSubtype(e.target.value)}
                  className="w-full sm:w-auto px-3.5 py-1.5 rounded-xl bg-[#FFF3D9]/60 border border-[#EADBCE] text-sm font-patrick font-bold text-[#3B3028] focus:outline-hidden focus:border-[#E8AF30]"
                >
                  <option value="essay">Essay</option>
                  <option value="short-story">Short Story</option>
                  <option value="letter">Epistolary Letter</option>
                  <option value="reflection">Contemplative Reflection</option>
                  <option value="creative-prose">Creative Prose</option>
                </select>
                <span className="text-xs font-nunito text-[#6B584C] italic">
                  Categorizes this piece in the Letters &amp; Other Words archive
                </span>
              </div>
            )}
          </div>

          {/* Body Content with Formatting Toolbar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="body" className="block text-xs font-patrick uppercase tracking-wider text-[#718B55]">
                {isPoetry ? "Verses & Stanzas (Poetry)" : "Manuscript Body (Prose)"} *
              </label>

              {isPoetry && (
                <span className="text-xs font-kalam text-[#E8AF30]">
                  Line breaks and stanzas are preserved exactly
                </span>
              )}
            </div>

            {/* Handwritten Formatting Bar */}
            <div className="flex flex-wrap items-center gap-1.5 p-2 rounded-t-xl bg-[#FFF3D9] border-t border-x border-[#EADBCE]">
              <button
                type="button"
                onClick={() => insertFormatting("### ")}
                className="p-1.5 rounded-md hover:bg-[#FFF9EC] text-[#3B3028] transition-colors"
                title="Heading"
              >
                <Heading className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => insertFormatting("**", "**")}
                className="p-1.5 rounded-md hover:bg-[#FFF9EC] text-[#3B3028] transition-colors"
                title="Bold"
              >
                <Bold className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => insertFormatting("*", "*")}
                className="p-1.5 rounded-md hover:bg-[#FFF9EC] text-[#3B3028] transition-colors"
                title="Italic"
              >
                <Italic className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => insertFormatting("> ")}
                className="p-1.5 rounded-md hover:bg-[#FFF9EC] text-[#3B3028] transition-colors"
                title="Quotation"
              >
                <Quote className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => insertFormatting("\n\n---\n\n")}
                className="px-2 py-1 text-xs font-patrick rounded-md hover:bg-[#FFF9EC] text-[#3B3028] transition-colors"
                title="Stanza / Section Break"
              >
                Divider
              </button>
              <div className="h-4 w-px bg-[#EADBCE] mx-0.5" />
              <button
                type="button"
                onClick={handleOpenInlineImageModal}
                className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-patrick font-bold rounded-md hover:bg-[#FFF9EC] text-[#3B3028] transition-colors cursor-pointer"
                title="Insert Image into Manuscript"
              >
                <ImagePlus className="w-4 h-4 text-[#E8AF30]" />
                <span>Insert Image</span>
              </button>
            </div>

            {/* Textarea */}
            <textarea
              id="body"
              ref={bodyTextareaRef}
              required
              rows={isPoetry ? 16 : 20}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder={
                isPoetry
                  ? "Type your verses here...\nSingle line breaks are preserved.\nDouble line breaks form new stanzas."
                  : "Begin writing your thoughts, essay, or journal reflections beneath the morning light..."
              }
              className={`w-full p-4 rounded-b-xl bg-[#FFF9EC] border border-[#EADBCE] text-[#3B3028] text-base sm:text-lg leading-relaxed placeholder-[#6B584C]/40 focus:outline-hidden focus:border-[#E8AF30] focus:ring-1 focus:ring-[#E8AF30] transition-colors ${
                isPoetry ? "font-kalam whitespace-pre-wrap" : "font-nunito"
              }`}
            />
          </div>

          {/* Excerpt */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="excerpt" className="block text-xs font-patrick uppercase tracking-wider text-[#718B55]">
                Excerpt / Summary *
              </label>
              <span className="text-xs font-nunito text-[#6B584C]">
                Appears on cards and reading previews
              </span>
            </div>
            <textarea
              id="excerpt"
              required
              rows={3}
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="A brief 1-2 sentence welcoming reflection that invites readers in..."
              className="w-full p-3 rounded-xl bg-[#FFF9EC] border border-[#EADBCE] text-sm text-[#3B3028] placeholder-[#6B584C]/50 focus:outline-hidden focus:border-[#E8AF30] font-nunito transition-colors"
            />
          </div>
        </div>

        {/* Sidebar Settings (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Publishing Status Card */}
          <div className="p-6 rounded-2xl bg-[#FFF3D9]/80 border border-[#EADBCE] space-y-4">
            <span className="font-patrick text-sm font-bold uppercase tracking-wider text-[#718B55] flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-[#E8AF30]" />
              Publication Status
            </span>

            <div className="space-y-2">
              <label className="flex items-center gap-3 p-3 rounded-xl border border-[#EADBCE] bg-[#FFF9EC] cursor-pointer hover:border-[#E8AF30] transition-colors">
                <input
                  type="radio"
                  name="status_radio"
                  value="draft"
                  checked={status === "draft"}
                  onChange={() => setStatus("draft")}
                  className="text-[#E8AF30] focus:ring-[#E8AF30]"
                />
                <div>
                  <span className="font-patrick text-base font-bold text-[#3B3028] block">
                    Save as Draft
                  </span>
                  <span className="text-xs font-nunito text-[#6B584C] block">
                    Visible only to you on your desk
                  </span>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 rounded-xl border border-[#EADBCE] bg-[#FFF9EC] cursor-pointer hover:border-[#E8AF30] transition-colors">
                <input
                  type="radio"
                  name="status_radio"
                  value="published"
                  checked={status === "published"}
                  onChange={() => setStatus("published")}
                  className="text-[#E8AF30] focus:ring-[#E8AF30]"
                />
                <div>
                  <span className="font-patrick text-base font-bold text-[#3B3028] block">
                    Publish to Sanctuary
                  </span>
                  <span className="text-xs font-nunito text-[#6B584C] block">
                    Freely readable by all visitors
                  </span>
                </div>
              </label>
            </div>

            {/* Anonymous Publishing Toggle */}
            <div className="pt-3 border-t border-[#EADBCE]/80">
              <label className="flex items-start gap-3 p-3 rounded-xl border border-[#EADBCE] bg-[#FFF9EC] cursor-pointer hover:border-[#E8AF30] transition-colors">
                <input
                  type="checkbox"
                  id="is_anonymous"
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-[#EADBCE] text-[#E8AF30] focus:ring-[#E8AF30] cursor-pointer"
                />
                <div className="space-y-0.5">
                  <span className="font-patrick text-base font-bold text-[#3B3028] block">
                    Publish Anonymously
                  </span>
                  <span className="text-xs font-nunito text-[#6B584C] block leading-relaxed">
                    Public readers will see &ldquo;By Anonymous&rdquo; with no link to your author profile. Your private ownership remains securely on your desk.
                  </span>
                </div>
              </label>
            </div>
          </div>

          {/* Active Archive Folio Routing Summary */}
          <div className="p-5 rounded-2xl bg-[#FFF3D9]/60 border border-[#EADBCE] space-y-2">
            <span className="font-patrick text-xs font-bold uppercase tracking-wider text-[#718B55] block">
              Active Archive Folio
            </span>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-[#FFF9EC] border border-[#EADBCE] text-xs font-mono font-bold text-[#E8AF30]">
                  {category === "blog" && "/blogs"}
                  {category === "poetry" && "/poetry"}
                  {category === "journal" && "/journal"}
                  {category === "writing" && "/writings"}
                </span>
                <span className="text-sm font-patrick font-bold text-[#3B3028]">
                  {category === "blog" && "Thoughts Beneath the Sun"}
                  {category === "poetry" && "Verses in Bloom"}
                  {category === "journal" && "Pages of Reflection"}
                  {category === "writing" && "Letters & Other Words"}
                </span>
              </div>
              <p className="text-xs font-nunito text-[#6B584C] leading-relaxed">
                {category === "blog" && "Will be cataloged in the Blog folio archive."}
                {category === "poetry" && "Will be cataloged in the Poetry folio with preserved stanza formatting."}
                {category === "journal" && "Will be cataloged in the Journal chronicle."}
                {category === "writing" && `Will be cataloged in the Literary Folio as ${writingSubtype}.`}
              </p>
            </div>
          </div>

          {/* Slug & Tags */}
          <div className="p-6 rounded-2xl bg-[#FFF3D9]/60 border border-[#EADBCE] space-y-4">
            <span className="font-patrick text-sm font-bold uppercase tracking-wider text-[#718B55]">
              URL Slug &amp; Themes
            </span>

            <div className="space-y-1.5">
              <label htmlFor="slug" className="block text-xs font-nunito text-[#6B584C]">
                Unique URL Slug:
              </label>
              <input
                id="slug"
                type="text"
                required
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="my-piece-title"
                className="w-full px-3 py-2 rounded-xl bg-[#FFF9EC] border border-[#EADBCE] text-xs font-mono text-[#3B3028]"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="tags" className="block text-xs font-nunito text-[#6B584C]">
                Themes / Tags (Comma separated):
              </label>
              <input
                id="tags"
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="Morning, Solitude, Sunflowers"
                className="w-full px-3 py-2 rounded-xl bg-[#FFF9EC] border border-[#EADBCE] text-xs font-nunito text-[#3B3028]"
              />
            </div>
          </div>

          {/* Cover Image Upload (Supabase Storage) */}
          <div className="p-6 rounded-2xl bg-[#FFF3D9]/60 border border-[#EADBCE] space-y-3">
            <span className="font-patrick text-sm font-bold uppercase tracking-wider text-[#718B55] flex items-center gap-1.5">
              <ImageIcon className="w-4 h-4 text-[#E8AF30]" />
              Cover Artwork
            </span>

            {coverImage ? (
              <div className="space-y-3">
                <div className="relative w-full h-36 rounded-xl overflow-hidden border border-[#EADBCE] shadow-inner bg-[#FFF9EC]">
                  <Image
                    src={coverImage}
                    alt="Cover Artwork Preview"
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={isUploading}
                    onClick={() => {
                      setErrorMessage(null);
                      fileInputRef.current?.click();
                    }}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-[#FFF9EC] border border-[#EADBCE] hover:border-[#E8AF30] text-xs font-patrick font-bold text-[#3B3028] transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 text-[#E8AF30] ${isUploading ? "animate-spin" : ""}`} />
                    <span>{isUploading ? "Uploading..." : "Replace Artwork"}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setCoverImage("")}
                    className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-[#FFF9EC] border border-[#EADBCE] hover:border-red-400 text-xs font-patrick font-bold text-red-700 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-red-600" />
                    <span>Remove</span>
                  </button>
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/jpeg,image/png,image/webp,image/avif,image/gif"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>
            ) : (
              <div className="space-y-3">
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/jpeg,image/png,image/webp,image/avif,image/gif"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  disabled={isUploading}
                  onClick={() => {
                    setErrorMessage(null);
                    fileInputRef.current?.click();
                  }}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-dashed border-[#E8AF30] bg-[#FFF9EC] hover:bg-[#FFF3D9] text-xs font-patrick font-bold text-[#3B3028] transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isUploading ? (
                    <>
                      <RefreshCw className="w-4 h-4 text-[#E8AF30] animate-spin" />
                      <span>Uploading to Storage...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 text-[#E8AF30]" />
                      <span>Upload Artwork (Max 5MB)</span>
                    </>
                  )}
                </button>
              </div>
            )}

            <p className="text-[11px] font-nunito text-[#6B584C] leading-tight">
              Supported: JPG, PNG, WebP, AVIF, GIF (max 5MB). Stored in your author folder in the public bucket.
            </p>
          </div>
        </div>
      </div>

      {/* Inline Image Insertion Modal */}
      {showInlineImageModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="inline-image-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs"
        >
          <div className="relative w-full max-w-lg rounded-3xl border-2 border-[#EADBCE] bg-[#FFF9EC] p-6 sm:p-8 shadow-xl space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-[#EADBCE]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[#E8AF30]/20 border border-[#E8AF30] flex items-center justify-center">
                  <ImagePlus className="w-4 h-4 text-[#E8AF30]" />
                </div>
                <h3 id="inline-image-title" className="font-patrick text-2xl font-bold text-[#3B3028]">
                  Insert Image into Manuscript
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowInlineImageModal(false)}
                className="p-1 rounded-full hover:bg-[#FFF3D9] text-[#6B584C] transition-colors cursor-pointer"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {inlineUploadError && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs font-nunito text-red-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{inlineUploadError}</span>
              </div>
            )}

            {/* Upload Area or Direct URL */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-patrick uppercase tracking-wider text-[#718B55] mb-1.5">
                  1. Select or Upload Image (Max 5MB)
                </label>
                <input
                  type="file"
                  ref={inlineFileInputRef}
                  accept="image/jpeg,image/png,image/webp,image/avif,image/gif"
                  onChange={handleInlineFileUpload}
                  className="hidden"
                />

                <button
                  type="button"
                  disabled={isInlineUploading}
                  onClick={() => {
                    setInlineUploadError(null);
                    inlineFileInputRef.current?.click();
                  }}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-dashed border-[#E8AF30] bg-[#FFF3D9]/60 hover:bg-[#FFF3D9] text-xs font-patrick font-bold text-[#3B3028] transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isInlineUploading ? (
                    <>
                      <RefreshCw className="w-4 h-4 text-[#E8AF30] animate-spin" />
                      <span>Uploading to Supabase Storage...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 text-[#E8AF30]" />
                      <span>Choose File from Device</span>
                    </>
                  )}
                </button>
              </div>

              <div>
                <label className="block text-xs font-nunito text-[#6B584C] mb-1">
                  Or paste direct Supabase image URL:
                </label>
                <input
                  type="url"
                  value={inlineImageUrl}
                  onChange={(e) => {
                    setInlineImageUrl(e.target.value);
                    setInlineUploadError(null);
                  }}
                  placeholder="https://shxitgbxfestrbhdukku.supabase.co/storage/v1/object/public/sunflower-assets/..."
                  className="w-full px-3 py-2 rounded-xl bg-[#FFF3D9]/40 border border-[#EADBCE] text-xs font-nunito text-[#3B3028] focus:outline-hidden focus:border-[#E8AF30]"
                />
              </div>

              {/* Preview */}
              {inlineImageUrl && (
                <div className="space-y-2">
                  <span className="block text-xs font-patrick uppercase tracking-wider text-[#718B55]">
                    Preview:
                  </span>
                  <div className="relative w-full h-40 rounded-xl overflow-hidden border border-[#EADBCE] shadow-inner bg-[#FFF3D9]/30">
                    <Image
                      src={inlineImageUrl}
                      alt={inlineImageAlt || "Inline preview"}
                      fill
                      className="object-contain"
                      unoptimized
                    />
                  </div>
                </div>
              )}

              {/* Alt text field */}
              <div className="space-y-1.5">
                <label htmlFor="inline-alt" className="block text-xs font-patrick uppercase tracking-wider text-[#718B55]">
                  2. Accessible Alt Text &amp; Caption
                </label>
                <input
                  id="inline-alt"
                  type="text"
                  value={inlineImageAlt}
                  onChange={(e) => setInlineImageAlt(e.target.value)}
                  placeholder="e.g., Morning sunlight illuminating wet sunflower leaves"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FFF3D9]/40 border border-[#EADBCE] text-sm font-nunito text-[#3B3028] placeholder-[#6B584C]/50 focus:outline-hidden focus:border-[#E8AF30]"
                />
                <p className="text-[11px] font-nunito text-[#6B584C]">
                  Provides description for screen readers and displays as a caption beneath the illustration.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-[#FFF3D9]/60 border border-[#EADBCE] text-[11px] font-nunito text-[#6B584C] leading-relaxed">
                <span className="font-bold text-[#3B3028]">Privacy Notice:</span> Uploaded images in the public Sunflower bucket are accessible via direct URL even prior to publishing this draft.
              </div>
            </div>

            {/* Modal actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#EADBCE]">
              <button
                type="button"
                onClick={() => setShowInlineImageModal(false)}
                className="px-4 py-2 rounded-full border border-[#EADBCE] bg-[#FFF9EC] hover:bg-[#FFF3D9] text-xs font-patrick font-semibold text-[#6B584C] transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!inlineImageUrl.trim() || isInlineUploading}
                onClick={handleInsertInlineImage}
                className="inline-flex items-center gap-1.5 px-5 py-2 rounded-full bg-[#E8AF30] hover:bg-[#F4C542] text-xs font-patrick font-bold text-[#3B3028] transition-all shadow-xs disabled:opacity-50 cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Insert into Manuscript</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </form>
  );
}
