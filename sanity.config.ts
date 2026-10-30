import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { visionTool } from "@sanity/vision";
import { schemaTypes } from "./src/sanity/schemaTypes";
import { structure } from "./src/sanity/structure";
import { apiVersion, dataset, projectId } from "./src/sanity/env";

export default defineConfig({
  basePath: "/studio",
  name: "sunflower-reverie-studio",
  title: "Sunflower Reverie Studio",

  projectId: projectId || "placeholder-project-id",
  dataset: dataset || "production",

  plugins: [
    structureTool({
      structure,
    }),
    visionTool({
      defaultApiVersion: apiVersion,
    }),
  ],

  schema: {
    types: schemaTypes,
  },
});
