"use client";

import { useState, useTransition, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  Feather,
  Upload,
  AlertCircle,
  Check,
  ExternalLink,
  Plus,
  X,
  BookOpen,
  Quote,
  Globe,
  RefreshCw,
  Trash2,
} from "lucide-react";
import { updateProfileAction, uploadAssetAction } from "@/app/author/dashboard/actions";

interface ProfileData {
  id: string;
  display_name: string;
  slug: string;
  is_public_author?: boolean | null;
  role?: string | null;
  short_bio?: string | null;
  full_bio?: string | null;
  quote?: string | null;
  avatar_url?: string | null;
  social_links?: { platform?: string; url?: string }[] | null;
  interests?: string[] | null;
}

interface ProfileEditorProps {
  initialProfile: ProfileData;
}

const RECOMMENDED_INTERESTS = [
  "Pastoral Poetry",
  "Morning Essays",
  "Garden Chronicles",
  "Contemplative Prose",
  "Epistolary Letters",
  "Autumn Reflections",
  "Stillness & Craft",
];

export function ProfileEditor({ initialProfile }: ProfileEditorProps) {
  const [isPending, startTransition] = useTransition();
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [displayName, setDisplayName] = useState(initialProfile.display_name || "");
  const [slug, setSlug] = useState(initialProfile.slug || "");
  const [role, setRole] = useState(initialProfile.role || "Co-Curator & Author");
  const [shortBio, setShortBio] = useState(initialProfile.short_bio || "");
  const [fullBio, setFullBio] = useState(initialProfile.full_bio || "");
  const [quote, setQuote] = useState(initialProfile.quote || "");
  const [avatarUrl, setAvatarUrl] = useState(initialProfile.avatar_url || "");

  // Social Links
  const initialSubstack = initialProfile.social_links?.find((l) => l.platform?.toLowerCase() === "substack")?.url || "";
  const initialGoodreads = initialProfile.social_links?.find((l) => l.platform?.toLowerCase() === "goodreads")?.url || "";
  const initialTwitter = initialProfile.social_links?.find((l) => l.platform?.toLowerCase() === "twitter")?.url || "";
  const initialWebsite = initialProfile.social_links?.find((l) => l.platform?.toLowerCase() === "website")?.url || "";
  const initialEmail = initialProfile.social_links?.find((l) => l.platform?.toLowerCase() === "email")?.url?.replace(/^mailto:/, "") || "";

  const [substack, setSubstack] = useState(initialSubstack);
  const [goodreads, setGoodreads] = useState(initialGoodreads);
  const [twitter, setTwitter] = useState(initialTwitter);
  const [website, setWebsite] = useState(initialWebsite);
  const [email, setEmail] = useState(initialEmail);

  // Interests / Genres
  const [interests, setInterests] = useState<string[]>(
    Array.isArray(initialProfile.interests) ? initialProfile.interests : []
  );
  const [newInterestInput, setNewInterestInput] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage("Image exceeds the 5MB size limit. Please select a smaller portrait.");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    // Validate format
    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/avif", "image/gif"];
    if (!validTypes.includes(file.type)) {
      setErrorMessage("Please select a valid image format (JPEG, PNG, WebP, AVIF, or GIF).");
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
      setAvatarUrl(res.url);
      setSuccessMessage("Portrait uploaded. Click 'Save Profile' below to commit changes.");
    }
  };

  const handleAddInterest = (tagToAdd?: string) => {
    const tag = (tagToAdd || newInterestInput).trim();
    if (!tag) return;
    if (!interests.includes(tag)) {
      setInterests([...interests, tag]);
    }
    setNewInterestInput("");
  };

  const handleRemoveInterest = (tagToRemove: string) => {
    setInterests(interests.filter((t) => t !== tagToRemove));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!displayName.trim()) {
      setErrorMessage("Please enter an author name.");
      return;
    }

    if (!slug.trim()) {
      setErrorMessage("Please enter an author URL slug.");
      return;
    }

    startTransition(async () => {
      const formData = new FormData();
      formData.append("displayName", displayName);
      formData.append("slug", slug);
      formData.append("role", role);
      formData.append("shortBio", shortBio);
      formData.append("fullBio", fullBio);
      formData.append("quote", quote);
      formData.append("avatarUrl", avatarUrl);
      formData.append("substack", substack);
      formData.append("goodreads", goodreads);
      formData.append("twitter", twitter);
      formData.append("website", website);
      formData.append("email", email);
      formData.append("interests", interests.join(", "));

      const res = await updateProfileAction(null, formData);
      if (res.error) {
        setErrorMessage(res.error);
      } else {
        setSuccessMessage("Your author profile and public folio have been updated in the sanctuary.");
      }
    });
  };

  return (
    <div className="space-y-8">
      {/* Top Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#EADBCE]">
        <Link
          href="/author/dashboard"
          className="inline-flex items-center gap-2 text-base font-patrick font-bold text-[#6B584C] hover:text-[#3B3028] transition-colors"
        >
          <ArrowLeft className="w-4 h-4 text-[#E8AF30]" />
          <span>Back to My Writing Desk</span>
        </Link>

        {initialProfile.is_public_author && slug ? (
          <Link
            href={`/authors/${slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-patrick font-bold text-[#E8AF30] hover:text-[#3B3028] transition-colors px-3 py-1.5 rounded-full bg-[#FFF3D9] border border-[#EADBCE]"
          >
            <span>View Public Author Folio</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        ) : (
          <span className="inline-flex items-center gap-1.5 text-xs font-patrick text-[#6B584C] px-3 py-1.5 rounded-full bg-[#FFF9EC] border border-[#EADBCE]">
            <span>Private Contributing Desk</span>
          </span>
        )}
      </div>

      {/* Notifications */}
      {errorMessage && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-sm font-nunito flex items-start gap-3 shadow-xs">
          <AlertCircle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold">Editorial Notice</p>
            <p className="leading-relaxed">{errorMessage}</p>
          </div>
        </div>
      )}

      {successMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-sm font-nunito flex items-start gap-3 shadow-xs animate-fade-in">
          <Check className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <p className="font-semibold">{successMessage}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-10">
        {/* Notebook Top Grid: Portrait + Core Identity */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Portrait Column */}
          <div className="lg:col-span-4 rounded-3xl border border-[#EADBCE] bg-[#FFF3D9]/60 p-6 flex flex-col items-center text-center space-y-4 shadow-xs">
            <div className="relative group">
              <div className="relative w-36 h-36 rounded-full border-3 border-[#E8AF30] bg-[#FFF9EC] flex items-center justify-center overflow-hidden shadow-inner">
                {avatarUrl ? (
                  <Image
                    src={avatarUrl}
                    alt={displayName || "Author Portrait"}
                    width={144}
                    height={144}
                    className="w-full h-full object-cover"
                    unoptimized
                  />
                ) : (
                  <Feather className="w-14 h-14 text-[#3B3028]/70 stroke-[1.5]" />
                )}
              </div>
            </div>

            <input
              type="file"
              ref={fileInputRef}
              accept="image/jpeg,image/png,image/webp,image/avif,image/gif"
              onChange={handleAvatarUpload}
              className="hidden"
            />

            <div className="space-y-2 w-full">
              <button
                type="button"
                disabled={isUploading}
                onClick={() => {
                  setErrorMessage(null);
                  fileInputRef.current?.click();
                }}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-full bg-[#E8AF30] hover:bg-[#F4C542] text-xs font-patrick font-bold text-[#3B3028] transition-all shadow-xs disabled:opacity-50 cursor-pointer"
              >
                {isUploading ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#3B3028]" />
                    <span>Uploading Portrait...</span>
                  </>
                ) : avatarUrl ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 text-[#3B3028]" />
                    <span>Replace Portrait</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-3.5 h-3.5 text-[#3B3028]" />
                    <span>Upload New Portrait</span>
                  </>
                )}
              </button>

              {avatarUrl && (
                <button
                  type="button"
                  onClick={() => {
                    setAvatarUrl("");
                    setSuccessMessage("Portrait removed. Click 'Save Profile' below to commit changes.");
                  }}
                  className="w-full inline-flex items-center justify-center gap-1.5 py-1 text-[11px] font-patrick text-red-700 hover:text-red-900 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Remove Portrait</span>
                </button>
              )}
            </div>

            <p className="text-[11px] font-nunito text-[#6B584C] leading-tight">
              Supported: JPEG, PNG, WebP, AVIF, GIF (max 5MB). Assets are scoped to your author folder in the public bucket.
            </p>
          </div>

          {/* Core Fields */}
          <div className="lg:col-span-8 space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Author Display Name */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label
                    htmlFor="displayName"
                    className="block text-xs font-patrick uppercase tracking-wider text-[#718B55] font-bold"
                  >
                    Author Name *
                  </label>
                  <span className="text-[10px] text-[#6B584C] font-nunito">
                    {displayName.length}/80
                  </span>
                </div>
                <input
                  id="displayName"
                  type="text"
                  required
                  maxLength={80}
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="e.g., Rowan Reed"
                  className="w-full px-4 py-2.5 rounded-2xl bg-[#FFF9EC] border border-[#EADBCE] text-base font-patrick font-bold text-[#3B3028] focus:outline-hidden focus:border-[#E8AF30] focus:ring-1 focus:ring-[#E8AF30] transition-colors"
                />
              </div>

              {/* Public Author Slug */}
              <div className="space-y-1.5">
                <label
                  htmlFor="slug"
                  className="block text-xs font-patrick uppercase tracking-wider text-[#718B55] font-bold"
                >
                  Public Folio URL Slug *
                </label>
                <input
                  id="slug"
                  type="text"
                  required
                  value={slug}
                  onChange={(e) =>
                    setSlug(
                      e.target.value
                        .toLowerCase()
                        .replace(/[^\w-]/g, "-")
                        .replace(/-+/g, "-")
                    )
                  }
                  placeholder="e.g., rowan-reed"
                  className="w-full px-4 py-2.5 rounded-2xl bg-[#FFF9EC] border border-[#EADBCE] text-sm font-nunito font-semibold text-[#3B3028] focus:outline-hidden focus:border-[#E8AF30] focus:ring-1 focus:ring-[#E8AF30] transition-colors"
                />
                {initialProfile.is_public_author ? (
                  <span className="text-[11px] font-nunito text-[#6B584C] block">
                    Public link: <code className="bg-[#FFF3D9] px-1 py-0.5 rounded text-[10px]">/authors/{slug || "slug"}</code>
                  </span>
                ) : (
                  <span className="text-[11px] font-nunito text-[#6B584C] block">
                    Note: Your author profile is currently private. Public writings will display as &ldquo;Anonymous&rdquo;.
                  </span>
                )}
              </div>
            </div>

            {/* Editorial Role */}
            <div className="space-y-1.5">
              <label
                htmlFor="role"
                className="block text-xs font-patrick uppercase tracking-wider text-[#718B55] font-bold"
              >
                Editorial Role / Title
              </label>
              <input
                id="role"
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="e.g., Essayist, Poet & Co-Curator"
                className="w-full px-4 py-2.5 rounded-2xl bg-[#FFF9EC] border border-[#EADBCE] text-sm font-nunito text-[#3B3028] focus:outline-hidden focus:border-[#E8AF30] focus:ring-1 focus:ring-[#E8AF30] transition-colors"
              />
            </div>

            {/* Handwritten Quote */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label
                  htmlFor="quote"
                  className="block text-xs font-patrick uppercase tracking-wider text-[#718B55] font-bold flex items-center gap-1.5"
                >
                  <Quote className="w-3.5 h-3.5 text-[#E8AF30]" />
                  <span>Personal Handwritten Quote (Kalam font)</span>
                </label>
                <span className="text-[10px] text-[#6B584C] font-nunito">
                  {quote.length}/250
                </span>
              </div>
              <div className="relative">
                <input
                  id="quote"
                  type="text"
                  maxLength={250}
                  value={quote}
                  onChange={(e) => setQuote(e.target.value)}
                  placeholder="Words quiet as dawn, enduring as sunflowers."
                  className="w-full pl-4 pr-4 py-3 rounded-2xl bg-[#FFF9EC] border border-[#EADBCE] font-kalam text-lg text-[#3B3028] italic focus:outline-hidden focus:border-[#E8AF30] focus:ring-1 focus:ring-[#E8AF30] transition-colors"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Short & Long Biographies */}
        <div className="space-y-6 pt-6 border-t border-[#EADBCE]">
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label
                htmlFor="shortBio"
                className="block text-xs font-patrick uppercase tracking-wider text-[#718B55] font-bold"
              >
                Short Summary (Card Bylines &amp; Homepage Feature)
              </label>
              <span className="text-[10px] text-[#6B584C] font-nunito">
                {shortBio.length}/250
              </span>
            </div>
            <textarea
              id="shortBio"
              rows={2}
              maxLength={250}
              value={shortBio}
              onChange={(e) => setShortBio(e.target.value)}
              placeholder="Dedicated to quiet morning reflections, classical nature poetry, and the unhurried craft of contemplative prose."
              className="w-full p-3.5 rounded-2xl bg-[#FFF9EC] border border-[#EADBCE] text-sm font-nunito text-[#3B3028] focus:outline-hidden focus:border-[#E8AF30] focus:ring-1 focus:ring-[#E8AF30] transition-colors leading-relaxed"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label
                htmlFor="fullBio"
                className="block text-xs font-patrick uppercase tracking-wider text-[#718B55] font-bold"
              >
                Full Biographical Essay (Public Author Folio)
              </label>
              <span className="text-[10px] text-[#6B584C] font-nunito">
                {fullBio.length}/5000
              </span>
            </div>
            <textarea
              id="fullBio"
              rows={6}
              maxLength={5000}
              value={fullBio}
              onChange={(e) => setFullBio(e.target.value)}
              placeholder="Write an intimate, essayistic biography detailing your literary journey, relationship with silence, and craft beneath the sunflowers..."
              className="w-full p-4 rounded-2xl bg-[#FFF9EC] border border-[#EADBCE] text-sm font-nunito text-[#3B3028] focus:outline-hidden focus:border-[#E8AF30] focus:ring-1 focus:ring-[#E8AF30] transition-colors leading-relaxed"
            />
          </div>
        </div>

        {/* Writing Interests / Literary Themes */}
        <div className="space-y-4 pt-6 border-t border-[#EADBCE]">
          <div>
            <span className="text-xs font-patrick uppercase tracking-wider text-[#718B55] font-bold flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-[#E8AF30]" />
              <span>Writing Themes &amp; Literary Interests</span>
            </span>
            <p className="text-xs font-nunito text-[#6B584C] mt-0.5">
              Tags reflecting your literary cadence and topics of focus.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {interests.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFF9EC] border border-[#EADBCE] text-xs font-patrick text-[#3B3028] font-bold"
              >
                <span>{tag}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveInterest(tag)}
                  className="hover:text-red-700 transition-colors cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <input
              type="text"
              value={newInterestInput}
              onChange={(e) => setNewInterestInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddInterest();
                }
              }}
              placeholder="Add an interest (e.g., Dawn Reflections)"
              className="px-3.5 py-1.5 rounded-full bg-[#FFF9EC] border border-[#EADBCE] text-xs font-nunito text-[#3B3028] focus:outline-hidden focus:border-[#E8AF30]"
            />
            <button
              type="button"
              onClick={() => handleAddInterest()}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#FFF3D9] hover:bg-[#E8AF30] text-xs font-patrick font-bold text-[#3B3028] border border-[#EADBCE] transition-colors cursor-pointer"
            >
              <Plus className="w-3 h-3" />
              <span>Add</span>
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-[11px] font-nunito text-[#6B584C] mr-1">Suggestions:</span>
            {RECOMMENDED_INTERESTS.filter((rec) => !interests.includes(rec)).slice(0, 4).map((rec) => (
              <button
                key={rec}
                type="button"
                onClick={() => handleAddInterest(rec)}
                className="text-[11px] font-patrick text-[#718B55] hover:text-[#3B3028] bg-[#FFF3D9]/60 hover:bg-[#FFF3D9] px-2 py-0.5 rounded-md border border-[#EADBCE] transition-colors cursor-pointer"
              >
                + {rec}
              </button>
            ))}
          </div>
        </div>

        {/* Social & Correspondence Links */}
        <div className="space-y-4 pt-6 border-t border-[#EADBCE]">
          <span className="text-xs font-patrick uppercase tracking-wider text-[#718B55] font-bold block flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5 text-[#E8AF30]" />
            <span>Correspondence &amp; Public Social Links</span>
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-[11px] font-patrick text-[#6B584C]">Substack Publication URL</label>
              <input
                type="url"
                placeholder="https://substack.com/@yourpen"
                value={substack}
                onChange={(e) => setSubstack(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-[#FFF9EC] border border-[#EADBCE] text-xs font-nunito text-[#3B3028] focus:outline-hidden focus:border-[#E8AF30]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-patrick text-[#6B584C]">Goodreads Profile</label>
              <input
                type="url"
                placeholder="https://goodreads.com/author/show/..."
                value={goodreads}
                onChange={(e) => setGoodreads(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-[#FFF9EC] border border-[#EADBCE] text-xs font-nunito text-[#3B3028] focus:outline-hidden focus:border-[#E8AF30]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-patrick text-[#6B584C]">Twitter / X Profile</label>
              <input
                type="url"
                placeholder="https://x.com/yourhandle"
                value={twitter}
                onChange={(e) => setTwitter(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-[#FFF9EC] border border-[#EADBCE] text-xs font-nunito text-[#3B3028] focus:outline-hidden focus:border-[#E8AF30]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-patrick text-[#6B584C]">Personal Website / Portfolio</label>
              <input
                type="url"
                placeholder="https://yourpersonalfolio.com"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-[#FFF9EC] border border-[#EADBCE] text-xs font-nunito text-[#3B3028] focus:outline-hidden focus:border-[#E8AF30]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-patrick text-[#6B584C]">Public Inquiries Email</label>
              <input
                type="email"
                placeholder="letters@yourdomain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-[#FFF9EC] border border-[#EADBCE] text-xs font-nunito text-[#3B3028] focus:outline-hidden focus:border-[#E8AF30]"
              />
            </div>
          </div>
        </div>

        {/* Action Buttons: Save & Cancel */}
        <div className="pt-6 border-t border-[#EADBCE] flex flex-wrap items-center justify-between gap-4">
          <Link
            href="/author/dashboard"
            className="px-6 py-2.5 rounded-full bg-[#FFF3D9] hover:bg-[#FFF9EC] border border-[#EADBCE] text-sm font-patrick font-bold text-[#6B584C] hover:text-[#3B3028] transition-colors"
          >
            Cancel &amp; Return to Desk
          </Link>

          <button
            type="submit"
            disabled={isPending || isUploading}
            className="inline-flex items-center gap-2 px-8 py-3 rounded-full bg-[#E8AF30] hover:bg-[#F4C542] text-[#3B3028] font-patrick text-base font-bold transition-all shadow-xs hover:shadow-md disabled:opacity-50 cursor-pointer"
          >
            {isPending ? (
              <>
                <div className="w-4 h-4 border-2 border-[#3B3028] border-t-transparent rounded-full animate-spin" />
                <span>Saving Notebook...</span>
              </>
            ) : (
              <>
                <Feather className="w-4 h-4" />
                <span>Save Profile Changes</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
