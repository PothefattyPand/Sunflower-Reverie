-- ==============================================================================
-- Sunflower Reverie: Database Seed Script
-- ==============================================================================
-- Use this script in the Supabase SQL Editor after creating the two author accounts
-- in Supabase Studio -> Authentication -> Users.
--
-- Instructions:
-- 1. Create two user accounts in Supabase Auth (e.g. author1@example.com, author2@example.com).
-- 2. Copy their UUIDs from Supabase Studio -> Authentication -> Users.
-- 3. Replace the placeholder UUIDs below:
--      AUTHOR_ONE_UUID  -> The UUID of Author One
--      AUTHOR_TWO_UUID  -> The UUID of Author Two
-- 4. Run this script in the Supabase SQL Editor.
-- ==============================================================================

DO $$
DECLARE
    -- REPLACE THESE WITH YOUR ACTUAL SUPABASE AUTH USER UUIDs
    v_author_one_id UUID := '00000000-0000-0000-0000-000000000001'::UUID;
    v_author_two_id UUID := '00000000-0000-0000-0000-000000000002'::UUID;
    v_author_one_email TEXT := 'author1@sunflowerreverie.com';
    v_author_two_email TEXT := 'author2@sunflowerreverie.com';
BEGIN
    -- 1. Register in Authorized Authors Allowlist (Limit 2)
    INSERT INTO public.authorized_authors (user_id, email)
    VALUES 
        (v_author_one_id, v_author_one_email),
        (v_author_two_id, v_author_two_email)
    ON CONFLICT (user_id) DO UPDATE SET email = EXCLUDED.email;

    -- 2. Insert Profiles
    INSERT INTO public.profiles (
        id, display_name, slug, role, short_bio, full_bio, quote, social_links
    ) VALUES (
        v_author_one_id,
        'Author One',
        'author-one',
        'Essayist, Poet & Co-Curator',
        'Dedicated to quiet morning reflections, classical nature poetry, and the unhurried craft of contemplative prose.',
        'Author One writes from the eastern perimeter of the sanctuary, where the morning sun first touches the row of sunflowers. With a deep affection for classical lyric poetry, quiet essays, and pastoral philosophy, their writings explore how stillness and gentle observation restore our connection to language.',
        'Words quiet as dawn, enduring as sunflowers.',
        '[{"platform": "Substack", "url": "https://substack.com"}, {"platform": "Goodreads", "url": "https://goodreads.com"}, {"platform": "Email", "url": "mailto:author1@sunflowerreverie.com"}]'::JSONB
    ) ON CONFLICT (id) DO UPDATE SET
        display_name = EXCLUDED.display_name,
        slug = EXCLUDED.slug,
        role = EXCLUDED.role,
        short_bio = EXCLUDED.short_bio,
        full_bio = EXCLUDED.full_bio,
        quote = EXCLUDED.quote,
        social_links = EXCLUDED.social_links;

    INSERT INTO public.profiles (
        id, display_name, slug, role, short_bio, full_bio, quote, social_links
    ) VALUES (
        v_author_two_id,
        'Author Two',
        'author-two',
        'Narrative Essayist, Diarist & Co-Curator',
        'A chronicler of garden seasons, reflective memoirs, and intimate epistolary letters written beneath the afternoon sun.',
        'Author Two tends to the afternoon folios and chronicles of Sunflower Reverie. Focusing on personal journals, literary short narratives, and epistolary correspondences, their works celebrate the patience required to let thoughts mature like seeds beneath autumn soil.',
        'In the garden of language, every sentence seeks its own light.',
        '[{"platform": "Substack", "url": "https://substack.com"}, {"platform": "Goodreads", "url": "https://goodreads.com"}, {"platform": "Email", "url": "mailto:author2@sunflowerreverie.com"}]'::JSONB
    ) ON CONFLICT (id) DO UPDATE SET
        display_name = EXCLUDED.display_name,
        slug = EXCLUDED.slug,
        role = EXCLUDED.role,
        short_bio = EXCLUDED.short_bio,
        full_bio = EXCLUDED.full_bio,
        quote = EXCLUDED.quote,
        social_links = EXCLUDED.social_links;

    -- 3. Seed Publications (Blogs, Poetry, Journal, Writings)
    -- BLOGS
    INSERT INTO public.publications (
        author_id, title, subtitle, slug, category, excerpt, body, reading_time, status, published_at, tags
    ) VALUES (
        v_author_one_id,
        'The Geometry of Morning Light',
        'Reflections on dawn shadows and the beginning of the writing day',
        'geometry-of-morning-light',
        'blog',
        'There is an exact hour between dusk and daybreak when the sun casts long, honey-colored rectangles across the oak floor. Here lies the true beginning of the writing day.',
        E'There is an exact hour between dusk and daybreak when the sun casts long, honey-colored rectangles across the oak floor. In this brief interlude, the world has not yet demanded an accounting of our time.\n\nI sit with a wooden pen and an inkstone ground from charcoal and river water. The garden outside is entirely silent except for the methodical tapping of a nuthatch against cedar bark.\n\nTo write in the morning is not merely an act of discipline; it is an act of listening. One does not arrive at the desk to impose a noisy will upon the silence, but rather to record the shape that quietness takes as the light climbs across the page.',
        '5 min read',
        'published',
        '2026-10-24T06:30:00Z',
        ARRAY['Morning', 'Writing Craft', 'Solitude']
    ), (
        v_author_two_id,
        'On the Art of Unrushed Reading',
        'Why the deepest literature resists the speed of contemporary life',
        'on-the-art-of-unrushed-reading',
        'blog',
        'We measure our reading in pages per hour and books per year, yet the sentences that change us forever demand to be read as slowly as honey drips from a spoon.',
        E'We measure our reading in pages per hour and books per year, yet the sentences that change us forever demand to be read as slowly as honey drips from a spoon.\n\nWhen we rush through a book, we consume information, but we starve the imagination. A truly literary sentence has acoustic weight, rhythmic cadence, and emotional undertow.\n\nTry reading a single paragraph three times in a quiet room before turning the page. Notice how the vowels echo, how the author crafted the pause at the semicolon, and how the concluding cadence leaves a subtle resonance in the mind.',
        '6 min read',
        'published',
        '2026-10-18T10:15:00Z',
        ARRAY['Reading', 'Philosophy', 'Patience']
    ), (
        v_author_one_id,
        'Sunflowers as Teachers of Patience',
        'What twenty seasons in the garden teach about creative stamina',
        'sunflowers-as-teachers-of-patience',
        'blog',
        'A sunflower seed is small, striped, and unassuming. Buried in dark soil, it spends weeks in cold darkness before lifting a single crown toward the sky.',
        E'A sunflower seed is small, striped, and unassuming. Buried in dark soil, it spends weeks in cold darkness before lifting a single crown toward the sky.\n\nEvery author knows the feeling of working in the dark. For months or years, the seed of an essay or poem remains hidden beneath the loam of consciousness.\n\nWhen the stalk finally rises, it does not argue with the wind. It simply turns its face to the source of light and stands steadfast.',
        '4 min read',
        'published',
        '2026-10-10T08:00:00Z',
        ARRAY['Sunflowers', 'Gardening', 'Creative Process']
    ), (
        v_author_two_id,
        'The Quiet Dignity of Paper',
        'Thoughts on tactile stationery in an ephemeral digital age',
        'the-quiet-dignity-of-paper',
        'blog',
        'Heavy cotton paper has a scent of clean water and pressed fiber. It absorbs the ink without bleeding, making every mark feel permanent and considered.',
        E'Heavy cotton paper has a scent of clean water and pressed fiber. It absorbs the ink without bleeding, making every mark feel permanent and considered.\n\nIn our hurried digital realm, letters vanish with a tap. But a manuscript laid upon paper has gravity; it occupies physical space in the room.\n\nSunflower Reverie is designed as a digital homage to this tangible grace: unhurried, warm, and inviting readers to linger.',
        '5 min read',
        'published',
        '2026-10-02T14:45:00Z',
        ARRAY['Stationery', 'Craftsmanship', 'Tactile Arts']
    );

    -- POETRY
    INSERT INTO public.publications (
        author_id, title, subtitle, slug, category, excerpt, body, reading_time, status, published_at, tags
    ) VALUES (
        v_author_two_id,
        'Hymn to the August Sun',
        'A morning hymn for late summer warmth',
        'hymn-to-the-august-sun',
        'poetry',
        'Golden monarch of the noon,\nTurn our faces from the clay;\nTeach our heavy hearts to bloom\nIn the bright unhurried day.',
        E'Golden monarch of the noon,\nTurn our faces from the clay;\nTeach our heavy hearts to bloom\nIn the bright unhurried day.\n\nTall beside the weathered stone,\nYellow sentinels arise;\nRooted deep where seeds were sown,\nLifting halos to the skies.\n\nNot for glory do they stand,\nNor for pride of petal bold;\nOnly yielding to the hand\nThat bestows the morning gold.',
        '2 min read',
        'published',
        '2026-10-22T07:00:00Z',
        ARRAY['Hymn', 'Sunflowers', 'Summer']
    ), (
        v_author_one_id,
        'Petals in the West Wind',
        'An elegiac reflection on the surrender of autumn',
        'petals-in-the-west-wind',
        'poetry',
        'One by one they loose their hold,\nDrifting down the amber hill;\nHeavy with the summer gold,\nPatient in the autumn chill.',
        E'One by one they loose their hold,\nDrifting down the amber hill;\nHeavy with the summer gold,\nPatient in the autumn chill.\n\nNo lament upon the wind,\nNo rebellion in the fall;\nEvery petal gently sinned\nAgainst no law that governs all.\n\nEarth receives the yellow crown,\nSoft as dust and light as breath;\nGlory lying quietly down\nIn the golden grace of death.',
        '3 min read',
        'published',
        '2026-10-08T16:20:00Z',
        ARRAY['Elegy', 'Autumn', 'Nature']
    ), (
        v_author_two_id,
        'The Nocturne of the Stalk',
        'A night meditation under starlight',
        'the-nocturne-of-the-stalk',
        'poetry',
        'When shadows take the garden green,\nThe sunflowers sleep upright and still;\nDreaming of the light unseen\nBehind the eastern hill.',
        E'When shadows take the garden green,\nThe sunflowers sleep upright and still;\nDreaming of the light unseen\nBehind the eastern hill.\n\nTheir heavy discs bow to the loam,\nTheir roots hold fast the darkened soil;\nA quiet sanctuary home\nRelieved of daytime toil.\n\nSleep, bright pilgrim of the sky,\nThe dawn already turns the key;\nThe stars will watch your petals dry\nAbove the silver lea.',
        '2 min read',
        'published',
        '2026-09-28T21:00:00Z',
        ARRAY['Nocturne', 'Night', 'Stillness']
    ), (
        v_author_one_id,
        'Seedhead Hymn',
        'A harvest verse celebrating abundance in quietude',
        'seedhead-hymn',
        'poetry',
        'Ten thousand seeds in spiral ring,\nThe secret math of leaf and sun;\nA silent choir prepared to sing\nWhen summer work is done.',
        E'Ten thousand seeds in spiral ring,\nThe secret math of leaf and sun;\nA silent choir prepared to sing\nWhen summer work is done.\n\nFeed the sparrow, feed the thrush,\nScatter across the winter plain;\nIn the cold November hush,\nPromise of the spring again.',
        '2 min read',
        'published',
        '2026-09-15T09:30:00Z',
        ARRAY['Harvest', 'Spirals', 'Winter']
    );

    -- JOURNAL
    INSERT INTO public.publications (
        author_id, title, subtitle, slug, category, excerpt, body, reading_time, status, published_at, tags
    ) VALUES (
        v_author_one_id,
        'October 28: The First Crisp Frost',
        'Field notes from the eastern garden gate',
        'october-28-the-first-crisp-frost',
        'journal',
        'Awoke to glass-like crystals rimming every leaf. The garden smells of cold cedar and rich wet earth. A morning that sharpens both the pencil and the spirit.',
        E'6:15 AM. The temperature dropped to two degrees below freezing overnight.\n\nWalking out to the eastern gate with a mug of black tea, I found the final sunflowers rimmed in fine crystalline filigree. They look cast in blown glass, catching the horizontal rays of sunrise like amber pendants.\n\nIt is extraordinary how frost clarifies the lines of the landscape. All the soft, billowing foliage of late summer has receded, leaving only bone, branch, and geometric stalk. A morning that encourages concise, honest writing.',
        '3 min read',
        'published',
        '2026-10-28T06:15:00Z',
        ARRAY['Frost', 'October', 'Field Notes']
    ), (
        v_author_two_id,
        'October 14: Dew Upon the Stalks',
        'Quiet observations made before the village stirs',
        'october-14-dew-upon-the-stalks',
        'journal',
        'The valley was blanketed in river mist until eight o\'clock. Every cobweb in the hedgerow had become a necklace of liquid diamonds.',
        E'7:30 AM. A thick river fog drifted up from the valley floor and lingered among the orchard rows.\n\nI spent an hour observing the spiderwebs woven between the sunflower stalks. In ordinary daylight they are invisible, but this morning each strand was weighted with dozens of water droplets, perfectly spaced and trembling in the slight breeze.\n\nHow much beauty exists in the garden unnoticed simply because the lighting is wrong? Our duty as writers is to supply the right light so that quiet miracles can be seen.',
        '4 min read',
        'published',
        '2026-10-14T07:30:00Z',
        ARRAY['Dew', 'Morning Notes', 'Observation']
    ), (
        v_author_one_id,
        'September 30: Saving the Seedheads',
        'Practical notes on harvesting seeds for spring replanting',
        'september-30-saving-the-seedheads',
        'journal',
        'Cut thirty of the largest sunflower crowns this afternoon. Tied them in bundles of three with brown twine to dry in the rafters of the potting shed.',
        E'3:00 PM. Cut thirty of the largest sunflower crowns this afternoon. The stems are as thick as a walking stick and tough as seasoned willow.\n\nTied them with rough hemp twine and hung them upside down from the oak rafters in the potting shed. When you tap the seedhead gently with a wooden spoon, the seeds fall out in a dark, rhythmic rain onto the newspaper below.\n\nSaved three jars of the fattest striped seeds for next year\'s planting along the stone wall. The rest will go into the winter bird feeders outside the study window.',
        '3 min read',
        'published',
        '2026-09-30T15:00:00Z',
        ARRAY['Harvesting', 'Seeds', 'Gardening']
    ), (
        v_author_two_id,
        'September 12: An Afternoon with Montaigne',
        'Reading beneath the walnut tree while swallows migrate south',
        'september-12-an-afternoon-with-montaigne',
        'journal',
        'Carried the Florio translation of Montaigne\'s essays into the shade of the walnut tree. The air feels like warm cider.',
        E'2:45 PM. Sitting under the walnut tree with Montaigne. Swallows are gathering on the telephone wires across the pasture, chattering quietly before their long journey south.\n\nMontaigne wrote that he studied himself more than any other subject: "It is my metaphysic, it is my natural philosophy." There is great humility in admitting that one\'s own mind is the only instrument one has for understanding the universe.\n\nWriting is not vanity when done with this disposition; it is simply taking inventory of the soul\'s luggage before the next crossing.',
        '4 min read',
        'published',
        '2026-09-12T14:45:00Z',
        ARRAY['Montaigne', 'Reading', 'Autumn']
    );

    -- WRITINGS (Essays, Stories, Letters, Creative Prose)
    INSERT INTO public.publications (
        author_id, title, subtitle, slug, category, writing_subtype, excerpt, body, reading_time, status, published_at, tags
    ) VALUES (
        v_author_one_id,
        'Letter to a Young Gardener',
        'On planting seeds whose bloom you may not live to see',
        'letter-to-a-young-gardener',
        'writing',
        'letter',
        'On the courage required to plant seeds whose harvest you may never witness. A personal epistolary reflection from the writing cabinet.',
        E'My Dear Friend,\n\nYou wrote to me last week with understandable impatience, lamenting that after months of digging, turning loam, and watering in the twilight, your borders remain largely brown and modest.\n\nPermit an older gardener to offer a gentle reminder: true gardening is never an exercise in instant satisfaction. It is a long, loving covenant made with time itself.\n\nWhen you press a seed into damp earth, you are practicing faith in tomorrow. You are saying to the future: "I believe the sun will return, and I have prepared a welcoming hearth for its arrival." Do not hurry the green shoots. Let them establish their roots in the dark; what grows slowly endures the winter.',
        '5 min read',
        'published',
        '2026-10-20T11:00:00Z',
        ARRAY['Letter', 'Patience', 'Mentorship']
    ), (
        v_author_two_id,
        'The Watchmaker of Verona',
        'A short narrative on clockwork, mortality, and brass gears',
        'the-watchmaker-of-verona',
        'writing',
        'short-story',
        'Old Maestro Lorenzo had repaired three generations of church clocks. In his workshop, time was not an abstraction, but the steady heartbeat of bronze teeth clicking in oil.',
        E'In a narrow alleyway behind the Piazza delle Erbe, Maestro Lorenzo worked by the yellow light of an oil lamp.\n\nHis shop was filled with hundreds of pendulums swinging in asynchronous reverence. Some ticked with the nervous flutter of a sparrow; others beat with the stately dignity of an old monk walking through cloistered arches.\n\n"People believe clocks measure time," Lorenzo would say, his magnifying loupe resting against his wrinkled temple. "They are mistaken. Time flows like the Adige river, indifferent to our brass gears. A watch does not measure time—it only measures our own heartbeat against the silence."',
        '7 min read',
        'published',
        '2026-10-12T16:30:00Z',
        ARRAY['Short Story', 'Time', 'Craftsmanship']
    ), (
        v_author_one_id,
        'Notes on the Architecture of Silence',
        'An essay exploring the aesthetic value of deliberate pauses in prose',
        'notes-on-the-architecture-of-silence',
        'writing',
        'essay',
        'Architecture is not just stone and mortar; it is the space enclosed between walls. Similarly, prose is not just vocabulary; it is the deliberate shape of silence between paragraphs.',
        E'We often praise a writer for their vocabulary, their wit, or the vividness of their descriptive flourishes. Yet the true master of prose is recognized by how skillfully they manage silence.\n\nA colon creates a ledge where the reader must pause and gaze across the precipice. A paragraph break is an archway through which the mind steps from sunlight into cool vaulted shadow.\n\nWhen every sentence screams for attention, nothing is heard. But when language is built with classical proportion—allowing white space to breathe around the words—the simplest utterance can carry the resonance of a bronze bell across an empty meadow.',
        '8 min read',
        'published',
        '2026-10-04T13:00:00Z',
        ARRAY['Essay', 'Style', 'Silence']
    ), (
        v_author_two_id,
        'Autumn Fugue in G Minor',
        'A creative prose piece composed in musical cadences',
        'autumn-fugue-in-g-minor',
        'writing',
        'creative-prose',
        'The first theme enters in the cellar, where apples ferment in slatted crates. The second theme rises through the chimney smoke, drifting across purple hills.',
        E'The first voice enters quietly in the cellar: the sweet, ciderous scent of Russet apples fermenting in slatted pine crates.\n\nThe second voice answers in the chimney stack: thin blue cedar smoke curling upward into a sky the color of a bruised plum. It carries the sharp tang of resin, the ghost of wood that spent fifty summers absorbing the sun before yielding to the hearth.\n\nNow the full chorus arrives: dry oak leaves tumbling across flagstones like parchment discarded by an impatient scholar. A fugue without strings, without brass, played entirely on the instruments of the turning earth.',
        '4 min read',
        'published',
        '2026-09-22T17:15:00Z',
        ARRAY['Creative Prose', 'Music', 'Autumn']
    );

END $$;

