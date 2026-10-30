import { defineField, defineType } from "sanity";
import { BookOpen } from "lucide-react";

export const publication = defineType({
  name: "publication",
  title: "Publications",
  type: "document",
  icon: BookOpen,
  groups: [
    { name: "content", title: "Content", default: true },
    { name: "media", title: "Media" },
    { name: "meta", title: "Metadata" },
    { name: "seo", title: "SEO" },
  ],
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      group: "content",
      validation: (rule) => rule.required().error("A title is required."),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      group: "content",
      options: {
        source: "title",
        maxLength: 96,
      },
      validation: (rule) => rule.required().error("A unique slug is required."),
    }),
    defineField({
      name: "author",
      title: "Author",
      type: "reference",
      to: [{ type: "author" }],
      group: "content",
      description: "Select which of the two authors penned this publication.",
      validation: (rule) => rule.required().error("An author must be assigned to every publication."),
    }),
    defineField({
      name: "category",
      title: "Category",
      type: "string",
      group: "content",
      options: {
        list: [
          { title: "Blog", value: "blog" },
          { title: "Poetry", value: "poetry" },
          { title: "Journal", value: "journal" },
          { title: "Writings", value: "writing" },
        ],
        layout: "radio",
      },
      validation: (rule) => rule.required(),
      initialValue: "blog",
    }),
    defineField({
      name: "writingSubtype",
      title: "Writing Subtype",
      type: "string",
      group: "content",
      options: {
        list: [
          { title: "Essay", value: "essay" },
          { title: "Short Story", value: "short-story" },
          { title: "Letter", value: "letter" },
          { title: "Reflection", value: "reflection" },
          { title: "Creative Prose", value: "creative-prose" },
        ],
      },
      hidden: ({ document }) => document?.category !== "writing",
    }),
    defineField({
      name: "subtitle",
      title: "Subtitle / Tagline",
      type: "string",
      group: "content",
    }),
    defineField({
      name: "excerpt",
      title: "Excerpt",
      type: "text",
      rows: 3,
      group: "content",
      description: "Brief summary shown on listing cards.",
      validation: (rule) => rule.max(300),
    }),
    defineField({
      name: "poetryStanzas",
      title: "Poetry Stanzas (Preserves Exact Line Breaks)",
      type: "array",
      group: "content",
      description:
        "Each item represents a stanza. Use line breaks freely within each stanza to preserve poetic meter.",
      hidden: ({ document }) => document?.category !== "poetry",
      of: [
        {
          type: "object",
          name: "stanza",
          title: "Stanza",
          fields: [
            {
              name: "lines",
              title: "Lines (Press Enter for each line)",
              type: "text",
              rows: 5,
            },
          ],
        },
      ],
    }),
    defineField({
      name: "body",
      title: "Body Text",
      type: "blockContent",
      group: "content",
      description: "Full publication article or prose.",
      hidden: ({ document }) => document?.category === "poetry",
    }),
    defineField({
      name: "coverImage",
      title: "Cover Image",
      type: "image",
      group: "media",
      options: {
        hotspot: true,
      },
    }),
    defineField({
      name: "imageAlt",
      title: "Image Alt Text",
      type: "string",
      group: "media",
      description: "Accessible description of the cover image for screen readers.",
      hidden: ({ document }) => !document?.coverImage,
    }),
    defineField({
      name: "publishedAt",
      title: "Publication Date",
      type: "datetime",
      group: "meta",
      initialValue: () => new Date().toISOString(),
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "readingTime",
      title: "Estimated Reading Time",
      type: "string",
      group: "meta",
      placeholder: "e.g. 5 min read",
    }),
    defineField({
      name: "tags",
      title: "Tags & Themes",
      type: "array",
      group: "meta",
      of: [{ type: "string" }],
      options: {
        layout: "tags",
      },
    }),
    defineField({
      name: "featured",
      title: "Feature on Homepage",
      type: "boolean",
      group: "meta",
      initialValue: false,
    }),
    defineField({
      name: "seoTitle",
      title: "SEO Title",
      type: "string",
      group: "seo",
      description: "Title used in search engines (defaults to publication title).",
    }),
    defineField({
      name: "seoDescription",
      title: "SEO Description",
      type: "text",
      rows: 3,
      group: "seo",
      description: "Description used in search engines and social previews.",
    }),
  ],
  preview: {
    select: {
      title: "title",
      category: "category",
      date: "publishedAt",
      media: "coverImage",
      authorName: "author.name",
    },
    prepare({ title, category, date, media, authorName }) {
      const formattedDate = date ? new Date(date).toLocaleDateString() : "Unscheduled";
      const catLabel = category ? category.toUpperCase() : "GENERAL";
      const authorLabel = authorName ? `By ${authorName}` : "No author assigned";
      return {
        title: title || "Untitled Publication",
        subtitle: `${catLabel} • ${authorLabel} • ${formattedDate}`,
        media,
      };
    },
  },
});

