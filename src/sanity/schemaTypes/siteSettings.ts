import { defineField, defineType } from "sanity";
import { Settings } from "lucide-react";

export const siteSettings = defineType({
  name: "siteSettings",
  title: "Site Settings",
  type: "document",
  icon: Settings,
  fields: [
    defineField({
      name: "title",
      title: "Website Title",
      type: "string",
      initialValue: "Sunflower Reverie",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "tagline",
      title: "Homepage Tagline",
      type: "string",
      initialValue: "Where thoughts bloom into words.",
    }),
    defineField({
      name: "welcomeMessage",
      title: "Welcome Message",
      type: "text",
      rows: 4,
      description: "Hero introduction text welcoming visitors to the sanctuary.",
    }),
    defineField({
      name: "contactEmail",
      title: "Contact / Inquiries Email",
      type: "string",
      placeholder: "letters@sunflowerreverie.com",
    }),
  ],
});

