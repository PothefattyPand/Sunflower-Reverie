import { createClient } from "next-sanity";
import { apiVersion, dataset, projectId, useCdn } from "./env";

/**
 * Public Sanity Read Client
 * Configured strictly for read-only access.
 * Does NOT contain write tokens or administrative secrets.
 */
export const client = createClient({
  projectId: projectId || "placeholder-project-id",
  dataset: dataset || "production",
  apiVersion,
  useCdn,
});
