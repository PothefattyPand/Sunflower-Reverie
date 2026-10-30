import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Compass,
  Feather,
  Heart,
  Mail,
  Sparkles,
  Sun,
} from "lucide-react";
import { Container } from "@/components/common/Container";
import { BotanicalDivider } from "@/components/reading/BotanicalDivider";
import { fetchAllAuthors, fetchSiteSettings } from "@/data/publications";

export const metadata = {
  title: "About the Authors & Sanctuary | Sunflower Reverie",
  description:
    "Meet the two authors behind Sunflower Reverie—an intimate literary sanctuary for poetry, contemplative prose, and unhurried thoughts.",
};

export default async function AboutPage() {
  const [authors, settings] = await Promise.all([
    fetchAllAuthors(),
    fetchSiteSettings(),
  ]);

  const contactEmail = settings?.contactEmail || "letters@sunflowerreverie.com";

  return (
    <div className="py-16 sm:py-24 bg-[#FFF9EC] text-[#3B3028]">
      <Container className="max-w-4xl">
        {/* Top Back Navigation */}
        <div className="mb-10 pb-4 border-b border-[#EADBCE]">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-base font-patrick font-bold text-[#6B584C] hover:text-[#3B3028] transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 text-[#E8AF30] group-hover:-translate-x-1 transition-transform" />
            <span>Back to Sanctuary Homepage</span>
          </Link>
        </div>

        {/* Hero Section */}
        <section className="text-center space-y-6 mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#FFF3D9] border border-[#EADBCE] text-xs font-patrick uppercase tracking-widest text-[#718B55]">
            <Sun className="w-3.5 h-3.5 text-[#E8AF30]" />
            <span>Two-Author Literary Sanctuary</span>
          </div>

          <h1 className="font-caveat text-5xl sm:text-7xl lg:text-8xl font-bold tracking-tight text-[#3B3028] leading-[1.05]">
            About Our Authors
          </h1>

          <p className="font-kalam text-xl sm:text-2xl text-[#6B584C] max-w-2xl mx-auto">
            &ldquo;Two pens, two unhurried cadences, and one open garden where words turn toward the light.&rdquo;
          </p>

          {/* Balanced Two-Author Cards */}
          <div className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
            {authors.map((author, idx) => {
              const hasPortrait = Boolean(author.pictureUrl);
              return (
                <div
                  key={author.id || author.slug || idx}
                  className="rounded-3xl border-2 border-[#EADBCE] bg-[#FFF3D9]/90 hover:bg-[#FFF3D9] p-8 shadow-xs flex flex-col justify-between transition-all duration-300 hover:border-[#E8AF30]"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-[#EADBCE]">
                      <span className="font-patrick text-xs uppercase tracking-wider text-[#718B55] flex items-center gap-1.5">
                        <Feather className="w-3.5 h-3.5 text-[#E8AF30]" />
                        Co-Curator {idx + 1}
                      </span>
                      <span className="text-xs font-nunito italic text-[#6B584C]">
                        Sunflower Reverie
                      </span>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="w-20 h-20 rounded-full border-2 border-[#E8AF30] bg-[#FFF9EC] flex items-center justify-center shrink-0 overflow-hidden shadow-inner">
                        {hasPortrait ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={author.pictureUrl}
                            alt={author.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Feather className="w-9 h-9 text-[#3B3028]/80 stroke-[1.25]" />
                        )}
                      </div>

                      <div>
                        <h2 className="font-patrick text-2xl sm:text-3xl font-bold text-[#3B3028]">
                          <Link href={`/authors/${author.slug}`}>
                            {author.name}
                          </Link>
                        </h2>
                        <p className="font-nunito text-xs sm:text-sm text-[#718B55] font-semibold">
                          {author.role}
                        </p>
                      </div>
                    </div>

                    {author.quote && (
                      <p className="font-kalam text-sm text-[#6B584C] italic border-l-2 border-[#E8AF30] pl-3 py-0.5">
                        &ldquo;{author.quote}&rdquo;
                      </p>
                    )}

                    <p className="font-nunito text-sm sm:text-base text-[#3B3028]/90 leading-relaxed">
                      {author.shortBio}
                    </p>
                  </div>

                  <div className="pt-6 mt-6 border-t border-[#EADBCE]/80">
                    <Link
                      href={`/authors/${author.slug}`}
                      className="inline-flex items-center justify-center gap-2 w-full px-5 py-2.5 rounded-full bg-[#FFF9EC] hover:bg-[#F4C542]/20 border border-[#EADBCE] hover:border-[#E8AF30] font-patrick text-base font-bold text-[#3B3028] transition-colors group shadow-xs"
                    >
                      <span>Explore {author.name}&apos;s Folio</span>
                      <ArrowRight className="w-4 h-4 text-[#E8AF30] group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <BotanicalDivider className="my-12" />

        {/* Section 1: The Sanctuary Vision */}
        <section className="space-y-6">
          <div className="flex items-center gap-2 text-xs font-patrick uppercase tracking-widest text-[#718B55]">
            <Sparkles className="w-4 h-4 text-[#E8AF30]" />
            <span>The Shared Hearth</span>
          </div>

          <h2 className="font-caveat text-4xl sm:text-5xl font-bold text-[#3B3028]">
            The Sanctuary Vision
          </h2>

          <div className="prose prose-stone max-w-none space-y-5 font-nunito text-lg sm:text-xl text-[#3B3028]/95 leading-relaxed">
            <p>
              Sunflower Reverie is the personal, self-published archive of exactly two writers.
              Here, there are no algorithmic feeds, no noisy comment sections, and no community
              submissions. Every sentence, verse, and journal entry gathered on these pages flows
              from our shared writing cabinets, kept as a quiet testament to the enduring craft of language.
            </p>
            <p>
              Dedicated to the art of the unhurried sentence, we spend our mornings and afternoons
              writing beside east and west-facing windows where sunflowers follow the daylight. With a deep
              love for gentle meter, pastoral beauty, and reflective memoir, our goal is simple:
              to offer readers a cheerful refuge in an otherwise frenetic world.
            </p>
          </div>
        </section>

        <BotanicalDivider className="my-12" />

        {/* Section 2: Writing Journey */}
        <section className="space-y-6">
          <div className="flex items-center gap-2 text-xs font-patrick uppercase tracking-widest text-[#718B55]">
            <Compass className="w-4 h-4 text-[#E8AF30]" />
            <span>The Path of Words</span>
          </div>

          <h2 className="font-caveat text-4xl sm:text-5xl font-bold text-[#3B3028]">
            The Writing Journey
          </h2>

          <div className="p-7 rounded-2xl bg-[#FFF3D9]/60 border border-[#EADBCE] space-y-4">
            <h3 className="font-patrick text-2xl font-bold text-[#3B3028]">
              From Solitary Notebooks to an Open Sanctuary
            </h3>
            <p className="font-nunito text-base sm:text-lg text-[#3B3028]/90 leading-relaxed">
              Like many who fall in love with literature, our separate journeys began in silence—scribbling verses
              in battered cloth-bound notebooks, wandering through autumn orchards with volumes of poetry
              tucked into coat pockets, and learning to observe the world closely before attempting to describe it.
            </p>
            <p className="font-nunito text-base sm:text-lg text-[#3B3028]/90 leading-relaxed">
              Sunflower Reverie brings these two paths together into a permanent, unhurried digital sanctuary
              where thoughts can mature, bloom, and be read freely by anyone seeking quiet contemplation.
            </p>
          </div>
        </section>

        <BotanicalDivider className="my-12" />

        {/* Section 3: Inspirations */}
        <section className="space-y-6">
          <div className="flex items-center gap-2 text-xs font-patrick uppercase tracking-widest text-[#718B55]">
            <BookOpen className="w-4 h-4 text-[#E8AF30]" />
            <span>Literary &amp; Natural Hearth</span>
          </div>

          <h2 className="font-caveat text-4xl sm:text-5xl font-bold text-[#3B3028]">
            Literary &amp; Natural Inspirations
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-[#FFF3D9]/50 border border-[#EADBCE] space-y-2">
              <span className="text-xs uppercase tracking-wider text-[#718B55] block font-patrick">
                The Classical Poets
              </span>
              <h3 className="font-patrick text-2xl font-bold text-[#3B3028]">
                Keats, Dickinson &amp; Rilke
              </h3>
              <p className="font-nunito text-sm text-[#6B584C] leading-relaxed">
                For their devotion to lyrical beauty, reverence for transience, and the courage to speak from the quiet heart.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#FFF3D9]/50 border border-[#EADBCE] space-y-2">
              <span className="text-xs uppercase tracking-wider text-[#718B55] block font-patrick">
                The Natural World
              </span>
              <h3 className="font-patrick text-2xl font-bold text-[#3B3028]">
                Helianthus &amp; Morning Light
              </h3>
              <p className="font-nunito text-sm text-[#6B584C] leading-relaxed">
                The faithful geometry of sunflowers turning with the sun; reminders that patience is the deepest form of love.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#FFF3D9]/50 border border-[#EADBCE] space-y-2">
              <span className="text-xs uppercase tracking-wider text-[#718B55] block font-patrick">
                The Essayist Tradition
              </span>
              <h3 className="font-patrick text-2xl font-bold text-[#3B3028]">
                Montaigne &amp; Thoreau
              </h3>
              <p className="font-nunito text-sm text-[#6B584C] leading-relaxed">
                The freedom of the personal essay—unrushed, honest, seeking truth through the prism of daily life.
              </p>
            </div>
          </div>
        </section>

        <BotanicalDivider className="my-12" />

        {/* Section 4: Publishing Philosophy */}
        <section className="p-8 rounded-2xl bg-[#FFF3D9] border-2 border-[#EADBCE] space-y-4 text-center">
          <Heart className="w-8 h-8 text-[#E8AF30] mx-auto fill-[#E8AF30]/30" />
          <h2 className="font-caveat text-3xl sm:text-4xl font-bold text-[#3B3028]">
            An Unconditional Gift to Readers
          </h2>
          <p className="font-nunito text-base sm:text-lg text-[#3B3028]/90 max-w-2xl mx-auto leading-relaxed">
            All writings across Sunflower Reverie are published freely. There are no paywalls,
            no intrusive advertisements, and no tracking cookies. You are invited to read, reflect,
            and return whenever your spirit longs for warmth and quietude.
          </p>
        </section>

        {/* Section 5: Correspondence */}
        <section className="mt-14 pt-8 border-t border-[#EADBCE] space-y-6">
          <div className="text-center space-y-2">
            <h3 className="font-caveat text-3xl font-bold text-[#3B3028]">
              Correspondence &amp; Dispatches
            </h3>
            <p className="font-nunito text-sm text-[#6B584C]">
              Both authors welcome thoughtful letters, impressions, and quiet greetings.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 text-sm font-patrick text-[#3B3028]">
            <a
              href={`mailto:${contactEmail}`}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#FFF3D9] border border-[#EADBCE] hover:border-[#E8AF30] transition-colors shadow-xs"
            >
              <Mail className="w-4 h-4 text-[#E8AF30]" />
              <span>{contactEmail}</span>
            </a>
          </div>

          <div className="text-center pt-8">
            <Link
              href="/writings"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-[#E8AF30] hover:bg-[#F4C542] text-[#3B3028] font-patrick text-xl shadow-xs hover:shadow transition-all"
            >
              <span>Explore the Complete Archive</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>
      </Container>
    </div>
  );
}
