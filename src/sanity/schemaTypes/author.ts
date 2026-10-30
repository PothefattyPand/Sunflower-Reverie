import { defineField, defineType } from "sanity";
import { Feather } from "lucide-react";

export const author = defineType({
  name: "author",
  title: "Authors",
  type: "document",
  icon: Feather,
  fields: [
    defineField({
      name: "name",
      title: "Author Name",
      type: "string",
      validation: (rule) => rule.required().error("Author name is required."),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: {
        source: "name",
        maxLength: 96,
      },
      validation: (rule) => rule.required().error("A unique author slug is required."),
    }),
    defineField({
      name: "picture",
      title: "Author Portrait / Picture",
      type: "image",
      options: {
        hotspot: true,
      },
    }),
    defineField({
      name: "role",
      title: "Role / Tagline",
      type: "string",
      placeholder: "e.g. Essayist, Poet & Co-Curator",
    }),
    defineField({
      name: "shortBio",
      title: "Short Biography",
      type: "text",
      rows: 3,
      description: "Brief summary shown on homepage cards and article bylines.",
    }),
    defineField({
      name: "fullBio",
      title: "Full Biography",
      type: "blockContent",
      description: "Detailed narrative biography shown on the individual author profile page.",
    }),
    defineField({
      name: "quote",
      title: "Introductory Quote / Motto",
      type: "string",
      placeholder: "e.g. Words quiet as dawn, enduring as sunflowers.",
      description: "Optional introductory literary quote displayed alongside the author portrait.",
    }),
    defineField({
      name: "socialLinks",
      title: "Social & Contact Links",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            {
              name: "platform",
              title: "Platform Name",
              type: "string",
              placeholder: "e.g. Substack, Goodreads, Email",
            },
            {
              name: "url",
              title: "URL or Email Address",
              type: "string",
            },
          ],
        },
      ],
    }),
  ],
  preview: {
    select: {
      title: "name",
      subtitle: "role",
      media: "picture",
    },
  },
});

