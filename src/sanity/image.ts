import { createImageUrlBuilder } from "@sanity/image-url";
import { dataset, projectId } from "./env";

const imageBuilder = createImageUrlBuilder({
  projectId: projectId || "placeholder-project-id",
  dataset: dataset || "production",
});

export const urlForImage = (source: unknown) => {
  if (!source) return undefined;
  return imageBuilder?.image(source as Parameters<typeof imageBuilder.image>[0]).auto("format").fit("max");
};
