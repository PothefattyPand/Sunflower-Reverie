import { type SchemaTypeDefinition } from "sanity";
import { publication } from "./publication";
import { author } from "./author";
import { siteSettings } from "./siteSettings";
import { blockContent } from "./blockContent";

export const schemaTypes: SchemaTypeDefinition[] = [
  publication,
  author,
  siteSettings,
  blockContent,
];

