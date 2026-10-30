import { Publication, AuthorProfile, AuthorSummary, SiteSettings } from "@/types";
import { isSanityConfigured } from "@/sanity/env";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { getPublicSupabase } from "@/lib/supabase/public";
import { client } from "@/sanity/client";
import { urlForImage } from "@/sanity/image";
import {
  allPublicationsQuery,
  publicationsByCategoryQuery,
  publicationBySlugQuery,
  publicationsByAuthorSlugQuery,
  featuredPublicationsQuery,
  latestPublicationsQuery,
  allSlugsByCategoryQuery,
  allPublicSlugsQuery,
  allAuthorsQuery,
  authorBySlugQuery,
  allAuthorSlugsQuery,
  siteSettingsQuery,
} from "@/sanity/queries";

/**
 * Two Author Profiles for Sunflower Reverie
 */
export const MOCK_AUTHORS: AuthorProfile[] = [
  {
    id: "author-1",
    name: "Author One",
    slug: "author-one",
    role: "Essayist, Poet & Co-Curator",
    shortBio:
      "Dedicated to quiet morning reflections, classical nature poetry, and the unhurried craft of contemplative prose.",
    fullBio: [
      {
        _type: "block",
        children: [
          {
            _type: "span",
            text: "Author One writes from the eastern perimeter of the sanctuary, where the morning sun first touches the row of sunflowers. With a deep affection for classical lyric poetry, quiet essays, and pastoral philosophy, their writings explore how stillness and gentle observation restore our connection to language.",
          },
        ],
      },
    ],
    quote: "Words quiet as dawn, enduring as sunflowers.",
    socialLinks: [
      { platform: "Substack", url: "https://substack.com" },
      { platform: "Goodreads", url: "https://goodreads.com" },
      { platform: "Email", url: "mailto:letters@sunflowerreverie.com" },
    ],
  },
  {
    id: "author-2",
    name: "Author Two",
    slug: "author-two",
    role: "Narrative Essayist, Diarist & Co-Curator",
    shortBio:
      "A chronicler of garden seasons, reflective memoirs, and intimate epistolary letters written beneath the afternoon sun.",
    fullBio: [
      {
        _type: "block",
        children: [
          {
            _type: "span",
            text: "Author Two tends to the afternoon folios and chronicles of Sunflower Reverie. Focusing on personal journals, literary short narratives, and epistolary correspondences, their works celebrate the patience required to let thoughts mature like seeds beneath autumn soil.",
          },
        ],
      },
    ],
    quote: "In the garden of language, every sentence seeks its own light.",
    socialLinks: [
      { platform: "Substack", url: "https://substack.com" },
      { platform: "Goodreads", url: "https://goodreads.com" },
      { platform: "Email", url: "mailto:letters@sunflowerreverie.com" },
    ],
  },
];

const authorOneSummary: AuthorSummary = {
  id: MOCK_AUTHORS[0].id,
  name: MOCK_AUTHORS[0].name,
  slug: MOCK_AUTHORS[0].slug,
  role: MOCK_AUTHORS[0].role,
};

const authorTwoSummary: AuthorSummary = {
  id: MOCK_AUTHORS[1].id,
  name: MOCK_AUTHORS[1].name,
  slug: MOCK_AUTHORS[1].slug,
  role: MOCK_AUTHORS[1].role,
};

/**
 * Centralized Mock Publications for Sunflower Reverie
 * Used as default content and as graceful fallback when Sanity is pending configuration.
 * All publications belong to either Author One or Author Two.
 */
export const MOCK_PUBLICATIONS: Publication[] = [
  // ==========================================
  // BLOGS ("Thoughts Beneath the Sun")
  // ==========================================
  {
    id: "blog-1",
    slug: "geometry-of-morning-light",
    type: "blog",
    title: "The Geometry of Morning Light",
    subtitle: "Observing the quiet patterns of sunbeams across an unwritten page",
    author: authorOneSummary,
    date: "October 24, 2026",
    isoDate: "2026-10-24",
    excerpt:
      "There is an exact hour between dusk and daybreak when the sun casts long, honey-colored rectangles across the oak floor. Here lies the true beginning of the writing day.",
    readingTime: "5 min read",
    tags: ["Morning Routine", "Creativity", "Light & Solitude"],
    isSampleContent: true,
    coverImage: {
      alt: "Morning sunlight streaming through an open window onto a wooden writing desk",
      caption: "First rays over the morning folio — demonstration image placeholder",
    },
    body: [
      "There is an exact hour between dusk and daybreak when the sun casts long, honey-colored rectangles across the oak floor. In that quiet threshold, before the world asks anything of you, the light seems almost tangible—a warm geometric architecture laid out for the solitary writer.",
      "To sit at a desk before the house has stirred is to participate in an ancient ritual. The kettle whispers on the stove; the ink rests patient in its glass vial; the window reveals fields still veiled in thin gossamer mists.",
      "For years, I believed that inspiration arrived like thunder—violent, sudden, and demanding. But morning after morning in this sanctuary, the sunflowers outside have taught me otherwise. They do not turn toward the sun with haste or frenzy; they shift with an almost imperceptible tenderness, faithful to the warmth that sustains them.",
      "Writing, too, requires this gentle fidelity. We do not demand brilliance of the dawn; we merely open the notebook and allow the sunbeam to touch the blank parchment. What follows is not labor, but reception.",
    ],
  },
  {
    id: "blog-2",
    slug: "on-the-art-of-unrushed-reading",
    type: "blog",
    title: "On the Art of Unrushed Reading",
    subtitle: "Why difficult books and long sentences deserve our patience",
    author: authorTwoSummary,
    date: "October 16, 2026",
    isoDate: "2026-10-16",
    excerpt:
      "Modern reading often resembles a marathon where speed is celebrated over absorption. Yet the finest sentences are meant to be savored like tea steeped in quiet waters.",
    readingTime: "6 min read",
    tags: ["Literary Craft", "Slow Living", "Essays"],
    isSampleContent: true,
    coverImage: {
      alt: "An open classical hardcover book beside an autumn leaf",
      caption: "Linguistic sanctuaries require patience and quiet contemplation",
    },
    body: [
      "Modern reading often resembles a frantic sprint. We measure our literary appetite in books completed per annum, articles skimmed between notifications, and summaries digested at double speed. Yet the finest sentences were never written for rapid consumption; they were meant to be held in the mouth like wine, savored in quiet company.",
      "When John Keats spoke of the 'realm of Flora and old Pan,' he was describing an imaginative landscape that cannot be entered at a gallop. You must leave your boots at the threshold. You must be willing to sit beneath a single paragraph for twenty minutes, listening to the cadence of the consonants and the slow breathing of its clauses.",
      "In Sunflower Reverie, our goal is not to accumulate words, but to inhabit them. When you read a page here, take all the time you need. Look out the window between stanzas. Let the idea settle like gold dust in a calm stream.",
      "A sentence that changes how you view the evening sky is worth far more than a hundred pages turned in a hurry.",
    ],
  },
  {
    id: "blog-3",
    slug: "field-notes-from-the-solitary-desk",
    type: "blog",
    title: "Field Notes from the Solitary Desk",
    subtitle: "Reflections on finding focus away from the digital torrent",
    author: authorOneSummary,
    date: "October 02, 2026",
    isoDate: "2026-10-02",
    excerpt:
      "A small collection of practical insights gained from turning off the telephone, closing the browser tabs, and listening to the rustle of dry leaves in the garden.",
    readingTime: "4 min read",
    tags: ["Solitude", "Writing Life", "Focus"],
    isSampleContent: true,
    coverImage: {
      alt: "A minimalist desk with an inkwell, notebook, and dried sunflower petals",
      caption: "The solitary desk where words are gathered in stillness",
    },
    body: [
      "The solitary desk is not an escape from reality; it is an encounter with it. When the digital torrent is silenced, what remains is the tick of the mantelpiece clock, the scratch of metal nib against cotton paper, and the sudden awareness of one’s own heart.",
      "Many aspiring writers fear solitude because they mistake it for loneliness. Loneliness is the painful absence of others; solitude is the rich, generative presence of oneself. It is the room where thoughts are allowed to finish their own sentences without being interrupted by a ding or a vibration.",
      "Here in the sanctuary, I keep three simple rules for the writing desk: first, no illuminated screens before the first draft is written in ink; second, the window must stay slightly ajar so the garden breeze can enter; third, when the words refuse to come, one must not force them, but walk out into the garden and inspect the sunflowers instead.",
    ],
  },
  {
    id: "blog-4",
    slug: "the-gentle-discipline-of-autumn",
    type: "blog",
    title: "The Gentle Discipline of Autumn",
    subtitle: "How the changing seasons mirror the rhythms of creative work",
    author: authorTwoSummary,
    date: "September 21, 2026",
    isoDate: "2026-09-21",
    excerpt:
      "Nature does not fight the arrival of autumn; she yields gracefully, knowing that shedding what is old is the only way to prepare the soil for spring.",
    readingTime: "5 min read",
    tags: ["Seasons", "Reflections", "Creative Discipline"],
    isSampleContent: true,
    coverImage: {
      alt: "Golden sunflower stalks bowing beneath an amber autumn sky",
      caption: "Autumn brings the harvest of patience and quiet beauty",
    },
    body: [
      "There is an honesty to the equinox that summer never quite possesses. In summer, abundance is so loud that one easily forgets the fragility of every green leaf. But as October settles over the valley, the trees begin their great act of renunciation.",
      "The sunflowers, whose golden crowns once rose high above the fence, now bow their heads under the weight of ripening seed. Their petals curl into parchment; their greens turn to russet and bronze. There is no sadness in this posture, only completion.",
      "In the life of an author, there are seasons of frantic blossoming and seasons of quiet seed-bearing. We cannot always be in bloom. To write well, one must accept the autumn months of the spirit—the days when one gathers fuel, reads deeply, and allows the soil of the imagination to rest beneath fallen leaves.",
    ],
  },

  // ==========================================
  // POETRY ("Verses in Bloom")
  // ==========================================
  {
    id: "poem-1",
    slug: "hymn-to-the-august-sun",
    type: "poetry",
    title: "Hymn to the August Sun",
    subtitle: "A lyric in four movements",
    author: authorOneSummary,
    date: "October 18, 2026",
    isoDate: "2026-10-18",
    excerpt:
      "Golden monarch of the noon,\nTurn our faces from the clay;\nTeach our heavy hearts to bloom\nIn the bright unhurried day.",
    readingTime: "2 min read",
    tags: ["Lyric Poetry", "Sunflower", "Sunlight"],
    isSampleContent: true,
    stanzas: [
      [
        "Golden monarch of the noon,",
        "Turn our faces from the clay;",
        "Teach our heavy hearts to bloom",
        "In the bright unhurried day.",
      ],
      [
        "Row on row in silent praise,",
        "Helianthus bows her head,",
        "Gathering the amber rays",
        "Where the tired shadows fled.",
      ],
      [
        "Rooted deep in humble earth,",
        "Yet aspiring toward the sky,",
        "Every blossom knows its worth",
        "As the summer breezes sigh.",
      ],
      [
        "Stay with us when dusk descends,",
        "Leave your warmth upon the stone,",
        "For the light that never ends",
        "Is the light the heart has known.",
      ],
    ],
    body: [],
  },
  {
    id: "poem-2",
    slug: "petals-in-the-west-wind",
    type: "poetry",
    title: "Petals in the West Wind",
    subtitle: "Elegiac verse for late October",
    author: authorTwoSummary,
    date: "October 08, 2026",
    isoDate: "2026-10-08",
    excerpt:
      "One by one they loose their hold,\nDrifting across the quiet loam,\nFleck of saffron, flake of gold,\nFinding in the earth a home.",
    readingTime: "2 min read",
    tags: ["Elegy", "Autumn", "Wind"],
    isSampleContent: true,
    stanzas: [
      [
        "One by one they loose their hold,",
        "Drifting across the quiet loam,",
        "Fleck of saffron, flake of gold,",
        "Finding in the earth a home.",
      ],
      [
        "No sorrow marks their downward flight,",
        "No bitter cry against the frost;",
        "They gave their tribute to the light,",
        "And nothing beautiful is lost.",
      ],
      [
        "The stalks remain like slender spears",
        "Against the fading sunset red,",
        "To whisper to the coming years",
        "Of glory that has lived and fled.",
      ],
    ],
    body: [],
  },
  {
    id: "poem-3",
    slug: "dialogue-between-earth-and-sky",
    type: "poetry",
    title: "Dialogue Between Earth and Sky",
    subtitle: "A pastoral reflection in couplets",
    author: authorOneSummary,
    date: "September 28, 2026",
    isoDate: "2026-09-28",
    excerpt:
      "The sky asked of the meadow: 'What have you to bring?'\nThe meadow raised a sunflower and whispered: 'Everything.'",
    readingTime: "2 min read",
    tags: ["Pastoral", "Couplets", "Nature"],
    isSampleContent: true,
    stanzas: [
      [
        "The sky asked of the meadow: 'What have you to bring?'",
        "The meadow raised a sunflower and whispered: 'Everything.'",
      ],
      [
        "'I have no silver clouds to spread, no thunderbolts to cast,",
        "Yet in my quiet cup of soil I hold the summer fast.'",
      ],
      [
        "The sky leaned down in azure grace and kissed the petal rim,",
        "And all the little singing birds broke into evening hymn.",
      ],
      [
        "For what is high and what is low meet in a single flower,",
        "Where heaven shares with humble loam its everlasting power.",
      ],
    ],
    body: [],
  },
  {
    id: "poem-4",
    slug: "the-quiet-quarry-of-dawn",
    type: "poetry",
    title: "The Quiet Quarry of Dawn",
    subtitle: "An unrhymed lyrical meditation",
    author: authorTwoSummary,
    date: "September 15, 2026",
    isoDate: "2026-09-15",
    excerpt:
      "Before the bell tolls five,\nThe world is an unchiselled stone,\nPure alabaster touched with honey.\nHere, words are born without grief.",
    readingTime: "3 min read",
    tags: ["Free Verse", "Dawn", "Solitude"],
    isSampleContent: true,
    stanzas: [
      [
        "Before the church bell tolls five,",
        "The valley is an unchiselled stone,",
        "Pure alabaster touched with honey.",
        "Here, words are born without grief.",
      ],
      [
        "I walk along the garden path",
        "Where spiders have spun silver bridges",
        "Between the stalks of sleeping sunflowers.",
        "Each web holds a necklace of dew.",
      ],
      [
        "Do not speak yet.",
        "Let the morning quarry its own quiet gold.",
        "The first breath of day",
        "Is prayer enough for any soul.",
      ],
    ],
    body: [],
  },

  // ==========================================
  // JOURNAL ("Pages of Reflection")
  // ==========================================
  {
    id: "journal-1",
    slug: "october-28-the-first-crisp-frost",
    type: "journal",
    title: "October 28: The First Crisp Frost",
    subtitle: "Field notes from the eastern perimeter of the garden",
    author: authorOneSummary,
    date: "October 28, 2026",
    isoDate: "2026-10-28",
    excerpt:
      "Awoke to glass-like crystals rimming every leaf. The garden smells of cold cedar and rich wet earth. A morning that sharpens both the pencil and the spirit.",
    readingTime: "3 min read",
    tags: ["Field Note", "Frost", "Sanctuary"],
    isSampleContent: true,
    body: [
      "6:15 AM. The mercury plunged below freezing for the first time this autumn. When I stepped onto the veranda with a mug of black tea, the grass was silvered over with delicate needles of rime.",
      "The sunflowers have fully surrendered their yellow crowns now, but their dark seed heads stand like sturdy compasses against the pale blue horizon. Several chickadees were already busy feasting upon the seeds, their tiny wings fluttering like dried leaves.",
      "There is something cleansing about frost. It strips away all pretense and leaves only the architecture of things—the bare branches, the stone borders, the clean straight line of the horizon. It reminded me that good prose also requires occasional frost to trim back the unnecessary flourishes.",
    ],
  },
  {
    id: "journal-2",
    slug: "october-14-dew-upon-the-stalks",
    type: "journal",
    title: "October 14: Dew Upon the Stalks",
    subtitle: "Observing morning moisture before the breeze begins",
    author: authorTwoSummary,
    date: "October 14, 2026",
    isoDate: "2026-10-14",
    excerpt:
      "Spent two hours watching how dew collects along the coarse green ridges of sunflower stems. A quiet reminder that nourishment often arrives quietly in the dark.",
    readingTime: "3 min read",
    tags: ["Stillness", "Observation", "Garden Life"],
    isSampleContent: true,
    body: [
      "A gray, mist-laden morning that refused to hurry. I took my leather notebook down into the central rows of the sunflower garden. Everything was soaked in gentle, silent moisture.",
      "We often imagine that plants grow only when the sun is blazing high. But touching the stalks this morning, I realized how much of their vitality comes from these damp, solitary hours of stillness. The soil drinks deep; the leaves expand; the roots anchor themselves in the cool dark.",
      "Perhaps we writers need the damp, cloudy days as much as the triumphs. Today I did not write a single finished poem, but I listened intently. That, too, is cultivation.",
    ],
  },
  {
    id: "journal-3",
    slug: "september-29-migrating-swallows",
    type: "journal",
    title: "September 29: Migrating Swallows",
    subtitle: "Watching the sky above the sunflower rows at twilight",
    author: authorOneSummary,
    date: "September 29, 2026",
    isoDate: "2026-09-29",
    excerpt:
      "Dozens of swallows gathered on the telegraph wires above the lane, preparing for their southward journey. An evening full of quiet departures.",
    readingTime: "4 min read",
    tags: ["Birds", "Twilight", "Transience"],
    isSampleContent: true,
    body: [
      "Dusk fell with an extraordinary lavender tint across the western hills. Looking up from my desk, I saw the telegraph wires lined with hundreds of swallows, chattering in low, excited chirps.",
      "Every year at this exact juncture, they assemble without a calendar or an alarm. They know in their bones that the season is turning. Within forty-eight hours, the wires will be empty, and the sky will feel strangely vast and quiet.",
      "How wonderful it is to trust one’s instincts as completely as these tiny birds. They do not hold committee meetings to decide when to fly; they feel the chill in the dusk and spread their wings. I hope to write with that same unhesitating trust.",
    ],
  },
  {
    id: "journal-4",
    slug: "september-12-listening-to-evening-crickets",
    type: "journal",
    title: "September 12: Listening to Evening Crickets",
    subtitle: "The steady cadence of a late summer dusk",
    author: authorTwoSummary,
    date: "September 12, 2026",
    isoDate: "2026-09-12",
    excerpt:
      "When the daylight fades, the meadow crickets take up their tireless symphony. A meditation on meter and the rhythms of the natural world.",
    readingTime: "3 min read",
    tags: ["Soundscape", "Evening", "Memory"],
    isSampleContent: true,
    body: [
      "The sun went down behind the ridge at 7:04 PM. Almost instantly, as though directed by an invisible conductor, the meadow crickets began their rhythmic chorus.",
      "If you listen closely, their meter is not random. It rises and falls in waves, modulated by the cooling temperature of the air. It is the purest metronome in the natural world, steadying the restless mind after a long day of reading and correspondence.",
      "I sat on the porch until the stars began to appear above the highest sunflower heads—first Vega, then Deneb and Altair forming the Summer Triangle. A day well ended is one where you have hurt no one, loved your quiet duties, and given thanks for the bread on your table.",
    ],
  },

  // ==========================================
  // WRITINGS ("Letters & Other Words")
  // ==========================================
  {
    id: "writing-1",
    slug: "letter-to-a-young-gardener",
    type: "writing",
    writingSubtype: "letter",
    title: "Letter to a Young Gardener",
    subtitle: "On the courage required to plant seeds whose harvest you may never witness",
    author: authorOneSummary,
    date: "October 20, 2026",
    isoDate: "2026-10-20",
    excerpt:
      "My dear friend: You write to me of impatience, asking how one endures the long weeks when the soil appears entirely dead. Let me tell you what the sunflowers have taught me over twenty summers.",
    readingTime: "7 min read",
    tags: ["Epistolary", "Mentorship", "Patience"],
    isSampleContent: true,
    coverImage: {
      alt: "A classical sealed envelope with dried flower sprig",
      caption: "Epistolary prose from the author's writing cabinet",
    },
    body: [
      "My dear friend:",
      "You write to me of impatience, asking how one endures the long weeks between sowing and the first green spear, when the soil appears entirely dormant and indifferent to your hopes. You worry that your labor has been in vain, or that some secret frost has blighted your endeavor before it could even announce its name.",
      "Let me tell you what the sunflowers have taught me over twenty unhurried summers in this valley. When you press a seed into the earth, the first thing it does is not reach upward toward the light; it reaches downward into the dark.",
      "It must anchor itself in the invisible before it dare raise a single leaf toward the sky. If it rushed to bloom on surface soil alone, the first summer thunderstorm would topple it without mercy.",
      "Whatever you are tending—be it a book, a philosophy, or a quiet transformation of character—allow it the dignity of its subterranean period. Do not dig it up every morning to see if roots are growing. Water the patch faithfully, keep the weeds at bay, and trust that the earth knows what it is doing.",
      "When the blossom finally breaks through the crust, it will not be an accident; it will be the natural expression of all the silent hours you spent waiting in good faith.",
      "Yours in the garden,\nAuthor One",
    ],
  },
  {
    id: "writing-2",
    slug: "the-watchmaker-of-verona",
    type: "writing",
    writingSubtype: "short-story",
    title: "The Watchmaker of Verona",
    subtitle: "A short story concerning time, brass gears, and a solitary sunflower",
    author: authorTwoSummary,
    date: "October 10, 2026",
    isoDate: "2026-10-10",
    excerpt:
      "Signor Bellini had repaired the timepieces of kings and merchants for forty years, yet every afternoon at three o'clock he set aside his eyeglass to watch a single flower turning by the alley wall.",
    readingTime: "8 min read",
    tags: ["Short Fiction", "Time", "Craftsmanship"],
    isSampleContent: true,
    coverImage: {
      alt: "Vintage watch gears resting beside an antique manuscript",
      caption: "A literary narrative exploring the intersection of mechanical and organic time",
    },
    body: [
      "Signor Bellini’s shop stood at the narrow end of the Via Sant'Eufemia, where the cobblestones stayed damp even in July. Inside, the air smelled perpetually of mineral oil, camphor, and shaved brass. For forty years, the gentlemen of the Veneto had brought him their pocket watches—delicate Breguets, heavy English chronometers, and miniature clocks whose silver pendulums swung with mathematical precision.",
      "Bellini could diagnose an ailing escapement simply by holding the case to his ear. He understood springs and pinions with the intimacy of a physician. Yet every afternoon at precisely three o'clock, the old man would lay down his magnifying loupe, take off his leather apron, and step out into the tiny courtyard behind his workbench.",
      "In that courtyard grew a solitary sunflower, seeded by chance between two paving stones. It had no pedigree and received no fertilizer, yet it rose taller than Bellini’s shoulder, its golden head tracking the patch of sunlight that passed between the terracotta chimneys above.",
      "'Look at that, Marco,' Bellini once said to his young apprentice, pointing with a calloused finger. 'All my little gears count the seconds, but they know nothing of the day. That blossom has no spring inside, yet it never loses a moment of the light.'",
      "When Bellini died in the winter of his seventy-second year, he left his shop and tools to Marco. But in his will was a single handwritten line: 'Keep the courtyard stone loose where the sunflower grows. Some clocks must never be wound.'",
    ],
  },
  {
    id: "writing-3",
    slug: "solitude-as-a-second-language",
    type: "writing",
    writingSubtype: "essay",
    title: "Solitude as a Second Language",
    subtitle: "A philosophical essay on learning to be at peace in one's own company",
    author: authorOneSummary,
    date: "September 25, 2026",
    isoDate: "2026-09-25",
    excerpt:
      "We are born into the noisy vernacular of the crowd, but solitude must be acquired like Latin or Greek—slowly, deliberately, and with great reverence for silence.",
    readingTime: "9 min read",
    tags: ["Philosophy", "Essay", "Inner Life"],
    isSampleContent: true,
    coverImage: {
      alt: "A sunlit stone courtyard with an open book on a wicker chair",
      caption: "Philosophical reflections on the architecture of quietness",
    },
    body: [
      "Most people treat silence as an awkward pause in a conversation that must be immediately filled. We turn on radios to cover the quiet of an empty kitchen; we check our glowing screens when an elevator ride lasts more than eight seconds. We behave as though silence were an enemy waiting to accuse us.",
      "Yet silence is not a vacuum. It is a language with its own subtle grammar, its own vocabulary of rustling leaves, ticking clocks, and steady breathing. To learn it is akin to mastering a classical tongue: at first, the declensions feel strange and forbidding, but with practice, it reveals a literature richer than anything found in the marketplace.",
      "When Henry David Thoreau retired to Walden Pond, his neighbors assumed he would be driven mad by boredom within a fortnight. They did not understand that a person who has befriended solitude is never bored, because the interior landscape is inexhaustible.",
      "In our little sanctuary of Sunflower Reverie, solitude is not an isolation ward; it is the garden soil from which every genuine sentence must take root.",
    ],
  },
  {
    id: "writing-4",
    slug: "amber-leaves-upon-the-sill",
    type: "writing",
    writingSubtype: "creative-prose",
    title: "Amber Leaves Upon the Sill",
    subtitle: "A poetic prose meditation on the arrival of dusk",
    author: authorTwoSummary,
    date: "September 18, 2026",
    isoDate: "2026-09-18",
    excerpt:
      "A vignette in three movements: the amber windowsill, the copper kettle, and the memory of words spoken beneath ancient lime trees.",
    readingTime: "4 min read",
    tags: ["Creative Prose", "Vignette", "Autumn"],
    isSampleContent: true,
    coverImage: {
      alt: "Autumn leaves resting on a sun-drenched wooden windowsill",
      caption: "Lyrical vignette capturing moments of stillness",
    },
    body: [
      "The sill of the eastern window is scarred by decades of sunlight and rain. Along its pale pine surface lie three dried sunflower petals and two maple leaves, curled into miniature golden boats.",
      "Outside, the shadows of the fence posts lengthen until they reach the edge of the orchard. A rooster crows in the far distance, uncertain whether night or morning has claimed the valley. In the chimney, the first cedar smoke rises straight into the windless blue.",
      "I hold the porcelain teacup with both hands. It is warm, and the warmth travels up through the wrists and into the shoulders. Sometimes happiness is nothing more complicated than this: an hour with nowhere to go, a clean page before you, and amber leaves resting peacefully upon the sill.",
    ],
  },
];

// Helper to convert Sanity raw document to our standard Publication interface
interface SanityRawAuthor {
  _id?: string;
  name?: string;
  slug?: string;
  role?: string;
  picture?: unknown;
}

interface SanityRawDoc {
  _id: string;
  title: string;
  slug: string;
  category: Publication["type"];
  writingSubtype?: Publication["writingSubtype"];
  subtitle?: string;
  excerpt?: string;
  body?: unknown;
  poetryStanzas?: { lines?: string }[];
  coverImage?: unknown;
  imageAlt?: string;
  publishedAt?: string;
  readingTime?: string;
  tags?: string[];
  featured?: boolean;
  seoTitle?: string;
  seoDescription?: string;
  author?: SanityRawAuthor;
}

function mapSanityToPublication(doc: SanityRawDoc): Publication {
  const publishedDate = doc.publishedAt ? new Date(doc.publishedAt) : new Date();
  const formattedDate = publishedDate.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  // Extract poetry stanzas preserving exact line breaks
  let stanzas: string[][] | undefined = undefined;
  if (doc.category === "poetry" && Array.isArray(doc.poetryStanzas)) {
    stanzas = doc.poetryStanzas
      .map((s) => (s?.lines ? s.lines.split("\n") : []))
      .filter((s) => s.length > 0);
  }

  // Extract plain body paragraphs if array
  const bodyParagraphs: string[] = [];
  if (Array.isArray(doc.body)) {
    doc.body.forEach((block: { children?: { text?: string }[] }) => {
      if (block?.children) {
        const text = block.children.map((c) => c.text || "").join("");
        if (text.trim()) bodyParagraphs.push(text);
      }
    });
  }

  const coverImageUrl = doc.coverImage ? urlForImage(doc.coverImage)?.url() : undefined;

  // Resolve author reference with graceful fallback to first author
  const authorData: AuthorSummary = doc.author?.name
    ? {
        id: doc.author._id || "author-1",
        name: doc.author.name,
        slug: doc.author.slug || "author-one",
        role: doc.author.role || "Co-Curator",
        pictureUrl: doc.author.picture ? urlForImage(doc.author.picture)?.url() : undefined,
      }
    : authorOneSummary;

  return {
    id: doc._id,
    slug: doc.slug,
    type: doc.category,
    writingSubtype: doc.writingSubtype,
    title: doc.title,
    subtitle: doc.subtitle,
    author: authorData,
    date: formattedDate,
    isoDate: doc.publishedAt ? doc.publishedAt.split("T")[0] : "",
    excerpt: doc.excerpt || "",
    body: bodyParagraphs.length > 0 ? bodyParagraphs : [doc.excerpt || ""],
    bodyRaw: doc.body,
    stanzas,
    readingTime: doc.readingTime || "4 min read",
    tags: doc.tags || [],
    featured: Boolean(doc.featured),
    seoTitle: doc.seoTitle,
    seoDescription: doc.seoDescription,
    isSampleContent: false,
    coverImage: doc.coverImage
      ? {
          src: coverImageUrl,
          alt: doc.imageAlt || doc.title,
        }
      : undefined,
  };
}

// Caching options: on-demand tag revalidation + 60s background ISR
const FETCH_OPTIONS = {
  next: {
    revalidate: 60,
    tags: ["publications"],
  },
};

function formatIsoDate(isoString?: string): { date: string; isoDate: string } {
  if (!isoString) {
    const now = new Date();
    return {
      date: now.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
      isoDate: now.toISOString().split("T")[0],
    };
  }
  const d = new Date(isoString);
  return {
    date: isNaN(d.getTime())
      ? isoString
      : d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
    isoDate: isNaN(d.getTime()) ? isoString : d.toISOString().split("T")[0],
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapSupabaseToAuthor(row: any): AuthorProfile {
  return {
    id: row.id,
    name: row.display_name || "Author",
    slug: row.slug || "author",
    role: row.role || "Co-Curator & Author",
    shortBio: row.short_bio,
    fullBio: row.full_bio,
    quote: row.quote,
    pictureUrl: row.avatar_url,
    socialLinks: Array.isArray(row.social_links) ? row.social_links : [],
    interests: Array.isArray(row.interests) ? row.interests : [],
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapSupabaseToPublication(row: any): Publication {
  const profile = row.profiles || {};
  const isPoetry = row.category === "poetry";
  const bodyText = row.body || "";
  const paragraphs = bodyText.split(/\n\s*\n/).filter(Boolean);
  const stanzas = isPoetry
    ? bodyText.split(/\n\s*\n/).map((s: string) => s.split("\n").map((l: string) => l.trim()).filter(Boolean))
    : undefined;

  const { date, isoDate } = formatIsoDate(row.published_at || row.created_at);

  return {
    id: row.id,
    slug: row.slug,
    type: row.category,
    writingSubtype: row.writing_subtype || undefined,
    title: row.title,
    subtitle: row.subtitle || undefined,
    author: {
      id: profile.id || row.author_id,
      name: profile.display_name || "Author",
      slug: profile.slug || "author",
      role: profile.role,
      pictureUrl: profile.avatar_url,
    },
    date,
    isoDate,
    excerpt: row.excerpt || "",
    body: paragraphs.length > 0 ? paragraphs : [bodyText],
    stanzas,
    readingTime: row.reading_time || "4 min read",
    tags: Array.isArray(row.tags) ? row.tags : [],
    coverImage: row.cover_image
      ? {
          src: row.cover_image,
          alt: row.title,
        }
      : undefined,
    featured: false,
    seoTitle: row.title,
    seoDescription: row.excerpt,
    isSampleContent: false,
  };
}

// ==========================================
// Central Query Helper Functions
// Checks Supabase when configured, then Sanity; seamlessly falls back to mock items.
// ==========================================

export async function fetchAllPublications(): Promise<Publication[]> {
  if (isSupabaseConfigured) {
    try {
      const supabase = getPublicSupabase();
      if (supabase) {
        const { data, error } = await supabase
          .from("publications")
          .select("*, profiles(*)")
          .eq("status", "published")
          .order("published_at", { ascending: false });
        if (!error && data && data.length > 0) {
          return data.map(mapSupabaseToPublication);
        }
      }
    } catch (err) {
      console.error("[Supabase] Error fetching all publications:", err);
    }
  }

  if (isSanityConfigured) {
    try {
      const sanityDocs = await client.fetch<SanityRawDoc[]>(allPublicationsQuery, {}, FETCH_OPTIONS);
      if (sanityDocs) {
        return sanityDocs.map(mapSanityToPublication);
      }
    } catch (err) {
      console.error("[Sanity] Error fetching all publications:", err);
    }
  }
  return MOCK_PUBLICATIONS;
}

export async function fetchPublicationsByCategory(category: Publication["type"]): Promise<Publication[]> {
  if (isSupabaseConfigured) {
    try {
      const supabase = getPublicSupabase();
      if (supabase) {
        const { data, error } = await supabase
          .from("publications")
          .select("*, profiles(*)")
          .eq("category", category)
          .eq("status", "published")
          .order("published_at", { ascending: false });
        if (!error && data && data.length > 0) {
          return data.map(mapSupabaseToPublication);
        }
      }
    } catch (err) {
      console.error(`[Supabase] Error fetching category '${category}':`, err);
    }
  }

  if (isSanityConfigured) {
    try {
      const sanityDocs = await client.fetch<SanityRawDoc[]>(
        publicationsByCategoryQuery,
        { category },
        FETCH_OPTIONS
      );
      if (sanityDocs) {
        return sanityDocs.map(mapSanityToPublication);
      }
    } catch (err) {
      console.error(`[Sanity] Error fetching publications for category '${category}':`, err);
    }
  }
  return MOCK_PUBLICATIONS.filter((p) => p.type === category);
}

export async function fetchPublicationBySlug(
  category: Publication["type"],
  slug: string
): Promise<Publication | undefined> {
  if (isSupabaseConfigured) {
    try {
      const supabase = getPublicSupabase();
      if (supabase) {
        const { data, error } = await supabase
          .from("publications")
          .select("*, profiles(*)")
          .eq("category", category)
          .eq("slug", slug)
          .eq("status", "published")
          .maybeSingle();
        if (!error && data) {
          return mapSupabaseToPublication(data);
        }
      }
    } catch (err) {
      console.error(`[Supabase] Error fetching publication '${slug}':`, err);
    }
  }

  if (isSanityConfigured) {
    try {
      const doc = await client.fetch<SanityRawDoc | null>(
        publicationBySlugQuery,
        { category, slug },
        FETCH_OPTIONS
      );
      if (doc) {
        return mapSanityToPublication(doc);
      }
      return undefined;
    } catch (err) {
      console.error(`[Sanity] Error fetching publication '${slug}':`, err);
    }
  }
  return MOCK_PUBLICATIONS.find((p) => p.type === category && p.slug === slug);
}

export async function fetchPublicationsByAuthor(authorSlug: string): Promise<Publication[]> {
  if (isSupabaseConfigured) {
    try {
      const supabase = getPublicSupabase();
      if (supabase) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("id")
          .eq("slug", authorSlug)
          .maybeSingle();

        if (profile?.id) {
          const { data, error } = await supabase
            .from("publications")
            .select("*, profiles(*)")
            .eq("author_id", profile.id)
            .eq("status", "published")
            .order("published_at", { ascending: false });
          if (!error && data && data.length > 0) {
            return data.map(mapSupabaseToPublication);
          }
        }
      }
    } catch (err) {
      console.error(`[Supabase] Error fetching publications for author '${authorSlug}':`, err);
    }
  }

  if (isSanityConfigured) {
    try {
      const sanityDocs = await client.fetch<SanityRawDoc[]>(
        publicationsByAuthorSlugQuery,
        { authorSlug },
        FETCH_OPTIONS
      );
      if (sanityDocs && sanityDocs.length > 0) {
        return sanityDocs.map(mapSanityToPublication);
      }
    } catch (err) {
      console.error(`[Sanity] Error fetching publications for author '${authorSlug}':`, err);
    }
  }
  return MOCK_PUBLICATIONS.filter((p) => p.author.slug === authorSlug);
}

export async function fetchFeaturedPublications(): Promise<Publication[]> {
  if (isSupabaseConfigured) {
    try {
      const supabase = getPublicSupabase();
      if (supabase) {
        const { data, error } = await supabase
          .from("publications")
          .select("*, profiles(*)")
          .eq("status", "published")
          .order("published_at", { ascending: false })
          .limit(3);
        if (!error && data && data.length > 0) {
          return data.map(mapSupabaseToPublication);
        }
      }
    } catch (err) {
      console.error("[Supabase] Error fetching featured publications:", err);
    }
  }

  if (isSanityConfigured) {
    try {
      let sanityDocs = await client.fetch<SanityRawDoc[]>(featuredPublicationsQuery, {}, FETCH_OPTIONS);
      if (!sanityDocs || sanityDocs.length === 0) {
        sanityDocs = await client.fetch<SanityRawDoc[]>(latestPublicationsQuery, {}, FETCH_OPTIONS);
      }
      if (sanityDocs && sanityDocs.length > 0) {
        return sanityDocs.map(mapSanityToPublication);
      }
    } catch (err) {
      console.error("[Sanity] Error fetching featured publications:", err);
    }
  }
  return MOCK_PUBLICATIONS.filter((p) => ["geometry-of-morning-light", "hymn-to-the-august-sun", "october-28-the-first-crisp-frost"].includes(p.slug));
}

export async function fetchLatestPublications(limit = 3): Promise<Publication[]> {
  if (isSupabaseConfigured) {
    try {
      const supabase = getPublicSupabase();
      if (supabase) {
        const { data, error } = await supabase
          .from("publications")
          .select("*, profiles(*)")
          .eq("status", "published")
          .order("published_at", { ascending: false })
          .limit(limit);
        if (!error && data && data.length > 0) {
          return data.map(mapSupabaseToPublication);
        }
      }
    } catch (err) {
      console.error("[Supabase] Error fetching latest publications:", err);
    }
  }

  if (isSanityConfigured) {
    try {
      const sanityDocs = await client.fetch<SanityRawDoc[]>(latestPublicationsQuery, {}, FETCH_OPTIONS);
      if (sanityDocs && sanityDocs.length > 0) {
        return sanityDocs.slice(0, limit).map(mapSanityToPublication);
      }
    } catch (err) {
      console.error("[Sanity] Error fetching latest publications:", err);
    }
  }
  return MOCK_PUBLICATIONS.slice(0, limit);
}

export async function fetchCategorySlugs(category: Publication["type"]): Promise<string[]> {
  if (isSupabaseConfigured) {
    try {
      const supabase = getPublicSupabase();
      if (supabase) {
        const { data, error } = await supabase
          .from("publications")
          .select("slug")
          .eq("category", category)
          .eq("status", "published");
        if (!error && data && data.length > 0) {
          return data.map((r: { slug: string }) => r.slug);
        }
      }
    } catch (err) {
      console.error(`[Supabase] Error fetching slugs for category '${category}':`, err);
    }
  }

  if (isSanityConfigured) {
    try {
      const results = await client.fetch<{ slug: string }[]>(
        allSlugsByCategoryQuery,
        { category },
        FETCH_OPTIONS
      );
      if (results && results.length > 0) {
        return results.map((r) => r.slug);
      }
    } catch (err) {
      console.error(`[Sanity] Error fetching slugs for category '${category}':`, err);
    }
  }
  return MOCK_PUBLICATIONS.filter((p) => p.type === category).map((p) => p.slug);
}

export async function fetchAllPublicSlugs(): Promise<{ slug: string; category: string; publishedAt?: string }[]> {
  if (isSupabaseConfigured) {
    try {
      const supabase = getPublicSupabase();
      if (supabase) {
        const { data, error } = await supabase
          .from("publications")
          .select("slug, category, published_at")
          .eq("status", "published");
        if (!error && data && data.length > 0) {
          return data.map((r: { slug: string; category: string; published_at?: string }) => ({
            slug: r.slug,
            category: r.category === "writing" ? "writings" : r.category,
            publishedAt: r.published_at,
          }));
        }
      }
    } catch (err) {
      console.error("[Supabase] Error fetching all public slugs:", err);
    }
  }

  if (isSanityConfigured) {
    try {
      const results = await client.fetch<{ slug: string; category: string; publishedAt?: string }[]>(
        allPublicSlugsQuery,
        {},
        FETCH_OPTIONS
      );
      if (results && results.length > 0) {
        return results;
      }
    } catch (err) {
      console.error("[Sanity] Error fetching all public slugs:", err);
    }
  }
  return MOCK_PUBLICATIONS.map((p) => ({
    slug: p.slug,
    category: p.type === "writing" ? "writings" : p.type,
    publishedAt: p.isoDate,
  }));
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapSanityToAuthor(doc: any): AuthorProfile {
  return {
    id: doc._id || doc.slug,
    name: doc.name || "Author",
    slug: doc.slug || "author",
    role: doc.role || "Co-Curator",
    shortBio: doc.shortBio,
    fullBio: doc.fullBio,
    quote: doc.quote,
    picture: doc.picture,
    pictureUrl: doc.picture ? urlForImage(doc.picture)?.url() : undefined,
    socialLinks: doc.socialLinks || [],
  };
}

export async function fetchAllAuthors(): Promise<AuthorProfile[]> {
  if (isSupabaseConfigured) {
    try {
      const supabase = getPublicSupabase();
      if (supabase) {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .order("created_at", { ascending: true });
        if (!error && data && data.length > 0) {
          return data.map(mapSupabaseToAuthor);
        }
      }
    } catch (err) {
      console.error("[Supabase] Error fetching all authors:", err);
    }
  }

  if (isSanityConfigured) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const authorDocs = await client.fetch<any[]>(
        allAuthorsQuery,
        {},
        { next: { revalidate: 60, tags: ["author"] } }
      );
      if (authorDocs && authorDocs.length > 0) {
        return authorDocs.map(mapSanityToAuthor);
      }
    } catch (err) {
      console.error("[Sanity] Error fetching all authors:", err);
    }
  }
  return MOCK_AUTHORS;
}

export async function fetchAuthorBySlug(slug: string): Promise<AuthorProfile | undefined> {
  if (isSupabaseConfigured) {
    try {
      const supabase = getPublicSupabase();
      if (supabase) {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("slug", slug)
          .maybeSingle();
        if (!error && data) {
          return mapSupabaseToAuthor(data);
        }
      }
    } catch (err) {
      console.error(`[Supabase] Error fetching author '${slug}':`, err);
    }
  }

  if (isSanityConfigured) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const authorDoc = await client.fetch<any>(
        authorBySlugQuery,
        { slug },
        { next: { revalidate: 60, tags: ["author"] } }
      );
      if (authorDoc && authorDoc.name) {
        return mapSanityToAuthor(authorDoc);
      }
    } catch (err) {
      console.error(`[Sanity] Error fetching author '${slug}':`, err);
    }
  }
  return MOCK_AUTHORS.find((a) => a.slug === slug);
}

export async function fetchAllAuthorSlugs(): Promise<string[]> {
  if (isSupabaseConfigured) {
    try {
      const supabase = getPublicSupabase();
      if (supabase) {
        const { data, error } = await supabase
          .from("profiles")
          .select("slug");
        if (!error && data && data.length > 0) {
          const slugs = data.map((r: { slug: string }) => r.slug);
          if (slugs.length === 1 && !slugs.includes("author-two")) {
            return [...slugs, "author-two"];
          }
          return slugs;
        }
      }
    } catch (err) {
      console.error("[Supabase] Error fetching author slugs:", err);
    }
  }

  if (isSanityConfigured) {
    try {
      const results = await client.fetch<{ slug: string }[]>(
        allAuthorSlugsQuery,
        {},
        { next: { revalidate: 60, tags: ["author"] } }
      );
      if (results && results.length > 0) {
        return results.map((r) => r.slug);
      }
    } catch (err) {
      console.error("[Sanity] Error fetching author slugs:", err);
    }
  }
  return MOCK_AUTHORS.map((a) => a.slug);
}

export async function fetchAuthorProfile(): Promise<AuthorProfile | undefined> {
  const authors = await fetchAllAuthors();
  return authors[0];
}

export async function fetchSiteSettings(): Promise<SiteSettings | undefined> {
  if (isSanityConfigured) {
    try {
      const settings = await client.fetch<SiteSettings>(
        siteSettingsQuery,
        {},
        { next: { revalidate: 60, tags: ["siteSettings"] } }
      );
      if (settings) {
        return settings;
      }
    } catch (err) {
      console.error("[Sanity] Error fetching site settings:", err);
    }
  }
  return undefined;
}

// Synchronous helpers for fallback and component related-posts
export function getAllPublications(): Publication[] {
  return MOCK_PUBLICATIONS;
}

export function getPublicationsByType(type: Publication["type"]): Publication[] {
  return MOCK_PUBLICATIONS.filter((p) => p.type === type);
}

export function getPublicationBySlug(type: Publication["type"], slug: string): Publication | undefined {
  return MOCK_PUBLICATIONS.find((p) => p.type === type && p.slug === slug);
}

export function getAllSlugsByType(type: Publication["type"]): string[] {
  return MOCK_PUBLICATIONS.filter((p) => p.type === type).map((p) => p.slug);
}

export function getRelatedPublications(
  currentId: string,
  type: Publication["type"],
  limit: number = 3,
  items?: Publication[]
): Publication[] {
  const source = items && items.length > 0 ? items : MOCK_PUBLICATIONS;
  return source.filter((p) => p.id !== currentId && p.type === type).slice(0, limit);
}
