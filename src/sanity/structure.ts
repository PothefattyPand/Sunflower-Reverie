import type { StructureResolver } from "sanity/structure";
import { BookOpen, Feather, FileText, Heart, PenTool, Settings, Sparkles, Users } from "lucide-react";

/**
 * Custom Sanity Studio Structure tailored for two authors.
 * Grouped intuitively for easy co-author navigation and publishing.
 * (Note: Category and author organization are workflow convenience views;
 * free-tier Sanity projects share collaborative project-level editor permissions).
 */
export const structure: StructureResolver = (S) =>
  S.list()
    .title("Sunflower Reverie Studio")
    .items([
      // 1. All Publications
      S.listItem()
        .title("All Publications")
        .icon(BookOpen)
        .child(S.documentTypeList("publication").title("All Writings & Posts")),

      S.divider(),

      // 2. Folios by Category
      S.listItem()
        .title("Blogs")
        .icon(Sparkles)
        .child(
          S.documentList()
            .title("Thoughts Beneath the Sun")
            .filter('_type == "publication" && category == "blog"')
        ),

      S.listItem()
        .title("Poetry")
        .icon(Feather)
        .child(
          S.documentList()
            .title("Verses in Bloom")
            .filter('_type == "publication" && category == "poetry"')
        ),

      S.listItem()
        .title("Journal")
        .icon(PenTool)
        .child(
          S.documentList()
            .title("Pages of Reflection")
            .filter('_type == "publication" && category == "journal"')
        ),

      S.listItem()
        .title("Writings")
        .icon(FileText)
        .child(
          S.documentList()
            .title("Letters & Other Words")
            .filter('_type == "publication" && category == "writing"')
        ),

      S.divider(),

      // 3. Convenience: Publications Grouped by Author
      S.listItem()
        .title("Publications by Author")
        .icon(Users)
        .child(
          S.documentTypeList("author")
            .title("Select Author to View Folio")
            .child((authorId) =>
              S.documentList()
                .title("Author's Publications")
                .filter('_type == "publication" && author._ref == $authorId')
                .params({ authorId })
            )
        ),

      S.divider(),

      // 4. Author Profiles (Two Authors)
      S.listItem()
        .title("Author Profiles")
        .icon(Heart)
        .child(S.documentTypeList("author").title("Authors (2 Profiles)")),

      // 5. Site Settings (Singleton)
      S.listItem()
        .title("Site Settings")
        .icon(Settings)
        .child(
          S.document()
            .schemaType("siteSettings")
            .documentId("siteSettings")
            .title("Site Settings")
        ),
    ]);

