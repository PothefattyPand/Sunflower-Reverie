import { AuthorProfile, AuthorSummary, Publication } from '@/types';

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
 * Used as default content and as graceful fallback for design sandboxing.
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
      caption: "First rays over the morning folio â€” demonstration image placeholder",
    },
    body: [
      "There is an exact hour between dusk and daybreak when the sun casts long, honey-colored rectangles across the oak floor. In that quiet threshold, before the world asks anything of you, the light seems almost tangibleâ€”a warm geometric architecture laid out for the solitary writer.",
      "To sit at a desk before the house has stirred is to participate in an ancient ritual. The kettle whispers on the stove; the ink rests patient in its glass vial; the window reveals fields still veiled in thin gossamer mists.",
      "For years, I believed that inspiration arrived like thunderâ€”violent, sudden, and demanding. But morning after morning in this sanctuary, the sunflowers outside have taught me otherwise. They do not turn toward the sun with haste or frenzy; they shift with an almost imperceptible tenderness, faithful to the warmth that sustains them.",
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
      "The solitary desk is not an escape from reality; it is an encounter with it. When the digital torrent is silenced, what remains is the tick of the mantelpiece clock, the scratch of metal nib against cotton paper, and the sudden awareness of oneâ€™s own heart.",
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
      "In the life of an author, there are seasons of frantic blossoming and seasons of quiet seed-bearing. We cannot always be in bloom. To write well, one must accept the autumn months of the spiritâ€”the days when one gathers fuel, reads deeply, and allows the soil of the imagination to rest beneath fallen leaves.",
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
      "There is something cleansing about frost. It strips away all pretense and leaves only the architecture of thingsâ€”the bare branches, the stone borders, the clean straight line of the horizon. It reminded me that good prose also requires occasional frost to trim back the unnecessary flourishes.",
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
      "How wonderful it is to trust oneâ€™s instincts as completely as these tiny birds. They do not hold committee meetings to decide when to fly; they feel the chill in the dusk and spread their wings. I hope to write with that same unhesitating trust.",
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
      "I sat on the porch until the stars began to appear above the highest sunflower headsâ€”first Vega, then Deneb and Altair forming the Summer Triangle. A day well ended is one where you have hurt no one, loved your quiet duties, and given thanks for the bread on your table.",
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
      "Whatever you are tendingâ€”be it a book, a philosophy, or a quiet transformation of characterâ€”allow it the dignity of its subterranean period. Do not dig it up every morning to see if roots are growing. Water the patch faithfully, keep the weeds at bay, and trust that the earth knows what it is doing.",
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
      "Signor Belliniâ€™s shop stood at the narrow end of the Via Sant'Eufemia, where the cobblestones stayed damp even in July. Inside, the air smelled perpetually of mineral oil, camphor, and shaved brass. For forty years, the gentlemen of the Veneto had brought him their pocket watchesâ€”delicate Breguets, heavy English chronometers, and miniature clocks whose silver pendulums swung with mathematical precision.",
      "Bellini could diagnose an ailing escapement simply by holding the case to his ear. He understood springs and pinions with the intimacy of a physician. Yet every afternoon at precisely three o'clock, the old man would lay down his magnifying loupe, take off his leather apron, and step out into the tiny courtyard behind his workbench.",
      "In that courtyard grew a solitary sunflower, seeded by chance between two paving stones. It had no pedigree and received no fertilizer, yet it rose taller than Belliniâ€™s shoulder, its golden head tracking the patch of sunlight that passed between the terracotta chimneys above.",
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
      "We are born into the noisy vernacular of the crowd, but solitude must be acquired like Latin or Greekâ€”slowly, deliberately, and with great reverence for silence.",
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

