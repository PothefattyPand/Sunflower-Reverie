/**
 * Sanity Environment Variables
 */

export const apiVersion =
  process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2024-01-01";

export const dataset =
  process.env.NEXT_PUBLIC_SANITY_DATASET || "production";

export const projectId =
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "";

export const useCdn = false;

export const isSanityConfigured = Boolean(
  projectId &&
  projectId !== "your_sanity_project_id" &&
  projectId !== "placeholder-project-id" &&
  projectId.trim() !== ""
);

export const revalidateSecret =
  process.env.SANITY_REVALIDATE_SECRET || "";

