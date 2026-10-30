"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";

interface ActionResponse {
  error?: string;
  success?: boolean;
  id?: string;
  url?: string;
}

/**
 * Verify that the currently calling user is an authenticated and allowlisted author.
 */
async function getAuthenticatedAuthor() {
  if (!isSupabaseConfigured) {
    throw new Error("Supabase is not configured.");
  }

  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error("Authentication required.");
  }

  const { data: authorized, error: authError } = await supabase
    .from("authorized_authors")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (authError || !authorized) {
    throw new Error("Unauthorized author account.");
  }

  return { supabase, user };
}

function calculateReadingTime(text: string): string {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.round(words / 180));
  return `${minutes} min read`;
}

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Create or update a publication owned by the logged-in author
 */
export async function savePublicationAction(
  _prevState: ActionResponse | null,
  formData: FormData
): Promise<ActionResponse> {
  try {
    const { supabase, user } = await getAuthenticatedAuthor();

    const id = (formData.get("id") as string)?.trim();
    const title = (formData.get("title") as string)?.trim();
    const subtitle = (formData.get("subtitle") as string)?.trim() || null;
    let slug = (formData.get("slug") as string)?.trim();
    const category = (formData.get("category") as string)?.trim();
    const writingSubtype = (formData.get("writingSubtype") as string)?.trim() || null;
    const excerpt = (formData.get("excerpt") as string)?.trim();
    const body = (formData.get("body") as string)?.trim();
    const coverImage = (formData.get("coverImage") as string)?.trim() || null;
    const tagsString = (formData.get("tags") as string)?.trim() || "";
    const status = (formData.get("status") as string) === "published" ? "published" : "draft";

    if (!title || !category || !excerpt || !body) {
      return { error: "Please provide a title, category, excerpt, and body text." };
    }

    if (!["blog", "poetry", "journal", "writing"].includes(category)) {
      return { error: "Invalid category selected." };
    }

    if (!slug) {
      slug = generateSlug(title);
    } else {
      slug = generateSlug(slug);
    }

    const tags = tagsString
      .split(",")
      .map((t) => t.trim().replace(/^#/, ""))
      .filter(Boolean);

    const readingTime = calculateReadingTime(body);

    if (id) {
      // EDIT EXISTING PUBLICATION
      // Verify ownership before updating
      const { data: existing, error: fetchErr } = await supabase
        .from("publications")
        .select("id, author_id, published_at")
        .eq("id", id)
        .maybeSingle();

      if (fetchErr || !existing) {
        return { error: "Publication not found." };
      }

      if (existing.author_id !== user.id) {
        return { error: "Security violation: You can only edit your own publications." };
      }

      const publishedAt =
        status === "published"
          ? existing.published_at || new Date().toISOString()
          : null;

      const { error: updateErr } = await supabase
        .from("publications")
        .update({
          title,
          subtitle,
          slug,
          category,
          writing_subtype: writingSubtype,
          excerpt,
          body,
          cover_image: coverImage,
          tags,
          status,
          reading_time: readingTime,
          published_at: publishedAt,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .eq("author_id", user.id); // Double-enforce ownership

      if (updateErr) {
        return { error: updateErr.message };
      }

      revalidatePath("/");
      revalidatePath("/blogs");
      revalidatePath("/poetry");
      revalidatePath("/journal");
      revalidatePath("/writings");
      revalidatePath(`/blogs/${slug}`);
      revalidatePath(`/poetry/${slug}`);
      revalidatePath(`/journal/${slug}`);
      revalidatePath(`/writings/${slug}`);
      revalidatePath("/author/dashboard");
      try {
        revalidateTag("publications", "default");
      } catch {
        // Tag revalidation
      }

      return { success: true, id };
    } else {
      // CREATE NEW PUBLICATION
      const publishedAt = status === "published" ? new Date().toISOString() : null;

      const { data: inserted, error: insertErr } = await supabase
        .from("publications")
        .insert({
          author_id: user.id, // Strictly set from server session!
          title,
          subtitle,
          slug,
          category,
          writing_subtype: writingSubtype,
          excerpt,
          body,
          cover_image: coverImage,
          tags,
          status,
          reading_time: readingTime,
          published_at: publishedAt,
        })
        .select("id")
        .single();

      if (insertErr || !inserted) {
        return { error: insertErr?.message || "Failed to create publication." };
      }

      revalidatePath("/");
      revalidatePath("/blogs");
      revalidatePath("/poetry");
      revalidatePath("/journal");
      revalidatePath("/writings");
      revalidatePath("/author/dashboard");
      try {
        revalidateTag("publications", "default");
      } catch {
        // Tag revalidation
      }

      return { success: true, id: inserted.id };
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : "An error occurred while saving.";
    return { error: message };
  }
}

/**
 * Toggle publication status between published and draft
 */
export async function togglePublishStatusAction(
  publicationId: string,
  targetStatus: "draft" | "published"
): Promise<ActionResponse> {
  try {
    const { supabase, user } = await getAuthenticatedAuthor();

    // Verify ownership
    const { data: existing, error: fetchErr } = await supabase
      .from("publications")
      .select("id, author_id, published_at, slug, category")
      .eq("id", publicationId)
      .maybeSingle();

    if (fetchErr || !existing) {
      return { error: "Publication not found." };
    }

    if (existing.author_id !== user.id) {
      return { error: "Security violation: You can only modify your own publications." };
    }

    const publishedAt =
      targetStatus === "published"
        ? existing.published_at || new Date().toISOString()
        : null;

    const { error: updateErr } = await supabase
      .from("publications")
      .update({
        status: targetStatus,
        published_at: publishedAt,
        updated_at: new Date().toISOString(),
      })
      .eq("id", publicationId)
      .eq("author_id", user.id);

    if (updateErr) {
      return { error: updateErr.message };
    }

    revalidatePath("/");
    revalidatePath("/blogs");
    revalidatePath("/poetry");
    revalidatePath("/journal");
    revalidatePath("/writings");
    revalidatePath("/author/dashboard");
    try {
      revalidateTag("publications", "default");
    } catch {
      // Revalidation tag
    }

    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to change publication status.";
    return { error: message };
  }
}

/**
 * Delete a publication owned by the logged-in author
 */
export async function deletePublicationAction(
  publicationId: string
): Promise<ActionResponse> {
  try {
    const { supabase, user } = await getAuthenticatedAuthor();

    // Verify ownership
    const { data: existing, error: fetchErr } = await supabase
      .from("publications")
      .select("id, author_id, slug, category")
      .eq("id", publicationId)
      .maybeSingle();

    if (fetchErr || !existing) {
      return { error: "Publication not found." };
    }

    if (existing.author_id !== user.id) {
      return { error: "Security violation: You can only delete your own publications." };
    }

    const { error: deleteErr } = await supabase
      .from("publications")
      .delete()
      .eq("id", publicationId)
      .eq("author_id", user.id);

    if (deleteErr) {
      return { error: deleteErr.message };
    }

    revalidatePath("/");
    revalidatePath("/blogs");
    revalidatePath("/poetry");
    revalidatePath("/journal");
    revalidatePath("/writings");
    revalidatePath("/author/dashboard");
    try {
      revalidateTag("publications", "default");
    } catch {
      // Revalidation tag
    }

    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to delete publication.";
    return { error: message };
  }
}

/**
 * Update the logged-in author's profile
 */
export async function updateProfileAction(
  _prevState: ActionResponse | null,
  formData: FormData
): Promise<ActionResponse> {
  try {
    const { supabase, user } = await getAuthenticatedAuthor();

    const displayName = (formData.get("displayName") as string)?.trim();
    const rawSlug = (formData.get("slug") as string)?.trim();
    const role = (formData.get("role") as string)?.trim() || "Co-Curator & Author";
    const shortBio = (formData.get("shortBio") as string)?.trim() || null;
    const fullBio = (formData.get("fullBio") as string)?.trim() || null;
    const quote = (formData.get("quote") as string)?.trim() || null;
    const avatarUrl = (formData.get("avatarUrl") as string)?.trim() || null;
    const substack = (formData.get("substack") as string)?.trim();
    const goodreads = (formData.get("goodreads") as string)?.trim();
    const twitter = (formData.get("twitter") as string)?.trim();
    const website = (formData.get("website") as string)?.trim();
    const email = (formData.get("email") as string)?.trim();
    const interestsString = (formData.get("interests") as string)?.trim() || "";

    if (!displayName) {
      return { error: "Display name is required." };
    }

    if (displayName.length > 80) {
      return { error: "Author name cannot exceed 80 characters." };
    }

    if (shortBio && shortBio.length > 250) {
      return { error: "Short biography cannot exceed 250 characters." };
    }

    if (quote && quote.length > 250) {
      return { error: "Personal quote cannot exceed 250 characters." };
    }

    if (fullBio && fullBio.length > 5000) {
      return { error: "Full biography cannot exceed 5000 characters." };
    }

    // Format and validate slug
    let slug = rawSlug ? generateSlug(rawSlug) : generateSlug(displayName);
    if (!slug) {
      slug = `author-${user.id.slice(0, 8)}`;
    }

    // Ensure slug is unique across all profiles except current author
    const { data: existingSlug } = await supabase
      .from("profiles")
      .select("id")
      .eq("slug", slug)
      .neq("id", user.id)
      .maybeSingle();

    if (existingSlug) {
      return { error: `The author slug '${slug}' is already taken. Please choose another.` };
    }

    const socialLinks = [];
    if (substack) socialLinks.push({ platform: "Substack", url: substack });
    if (goodreads) socialLinks.push({ platform: "Goodreads", url: goodreads });
    if (twitter) socialLinks.push({ platform: "Twitter", url: twitter });
    if (website) socialLinks.push({ platform: "Website", url: website });
    if (email) socialLinks.push({ platform: "Email", url: email.startsWith("mailto:") ? email : `mailto:${email}` });

    const interests = interestsString
      .split(",")
      .map((i) => i.trim())
      .filter(Boolean);

    const updatePayload: Record<string, unknown> = {
      display_name: displayName,
      slug,
      role,
      short_bio: shortBio,
      full_bio: fullBio,
      quote,
      avatar_url: avatarUrl,
      social_links: socialLinks,
      updated_at: new Date().toISOString(),
    };

    // If interests are provided, include them safely
    if (interests.length > 0) {
      updatePayload.interests = interests;
    }

    const { error: updateErr } = await supabase
      .from("profiles")
      .update(updatePayload)
      .eq("id", user.id);

    if (updateErr) {
      return { error: updateErr.message };
    }

    revalidatePath("/");
    revalidatePath("/about");
    revalidatePath("/author/dashboard");
    revalidatePath("/author/dashboard/profile");
    revalidatePath(`/authors/${slug}`);
    try {
      revalidateTag("author", "default");
    } catch {
      // Revalidation tag
    }

    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to update profile.";
    return { error: message };
  }
}

/**
 * Change the logged-in author's password
 */
export async function changePasswordAction(
  _prevState: ActionResponse | null,
  formData: FormData
): Promise<ActionResponse> {
  try {
    const { supabase, user } = await getAuthenticatedAuthor();

    const currentPassword = formData.get("currentPassword") as string;
    const newPassword = formData.get("newPassword") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return { error: "Please provide your current password and new password." };
    }

    if (newPassword !== confirmPassword) {
      return { error: "The new passwords do not match. Please verify and re-enter." };
    }

    if (newPassword.length < 8) {
      return { error: "The new password must be at least 8 characters long." };
    }

    if (!user.email) {
      return { error: "User email not found." };
    }

    // Reauthenticate with current password to prevent unauthorized tampering
    const { error: signInErr } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: currentPassword,
    });

    if (signInErr) {
      return { error: "Current password is incorrect. Verification failed." };
    }

    // Update password
    const { error: updateErr } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (updateErr) {
      return { error: updateErr.message };
    }

    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to change password.";
    return { error: message };
  }
}

/**
 * Send password reset email for the currently authenticated author
 */
export async function requestPasswordResetAction(): Promise<ActionResponse> {
  try {
    const { supabase, user } = await getAuthenticatedAuthor();

    if (!user.email) {
      return { error: "User email not found." };
    }

    const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/author/dashboard/settings`,
    });

    if (error) {
      return { error: error.message };
    }

    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to request password reset.";
    return { error: message };
  }
}

/**
 * Upload an image asset to Supabase Storage isolated to `{user.id}/*`
 */
export async function uploadAssetAction(formData: FormData): Promise<ActionResponse> {
  try {
    const { supabase, user } = await getAuthenticatedAuthor();

    const file = formData.get("file") as File | null;
    if (!file || !(file instanceof File) || file.size === 0) {
      return { error: "Please select an image file to upload." };
    }

    // Validate size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return { error: "Image file exceeds the 5MB size limit." };
    }

    // Validate mime type
    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/avif", "image/gif"];
    if (!validTypes.includes(file.type)) {
      return { error: "Invalid image format. Allowed: JPG, PNG, WEBP, AVIF, GIF." };
    }

    const sanitizedName = file.name.replace(/[^\w.-]/g, "_");
    const filePath = `${user.id}/${Date.now()}-${sanitizedName}`;

    const { error: uploadErr } = await supabase.storage
      .from("sunflower-assets")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadErr) {
      return { error: uploadErr.message };
    }

    const { data: publicData } = supabase.storage
      .from("sunflower-assets")
      .getPublicUrl(filePath);

    return { success: true, url: publicData.publicUrl };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to upload asset.";
    return { error: message };
  }
}
