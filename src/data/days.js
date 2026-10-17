// src/data/days.js
// Own-words summaries of each day's teaching, prepared for the seminar recap site.
// Do not paste slide text into the UI. Teaching materials belong to the lecturer's brand (see config).
// Day 5 content is live; its photos arrive later ("content-ready-media-pending",
// like Day 4 was). The pipeline picks up media-source/day5/ with no code change.

export const days = [
  {
    n: 1,
    slug: "day-1",
    title: "Digital Marketing Foundations",
    subtitle: "Understanding the customer, channels, journey and strategy",
    headline: "You don't own your Instagram.",
    mediaKey: "day1",
    status: "complete",
    summary:
      "The first day reset what participants think digital marketing is. It is a way of getting the right message to the right person and moving them to act, and it starts with the business and the customer, long before any app is opened.",
    outcomes: [
      "Explain digital marketing in plain language and why it is bigger than posting",
      "Tell traditional marketing and digital marketing apart",
      "Choose a channel based on the audience and the goal",
      "Spot a real audience, its needs and its buying triggers",
      "Draft a simple beginner strategy"
    ],
    sections: [
      {
        title: "Starting with your own business",
        body:
          "Participants began by describing what they sell, who it is for and how people currently find out about it. A short pairing exercise followed: each person traced how they discovered the last business they bought from online, where they first saw it, what made them act and what built their trust.",
        points: [
          "Marketing starts with the business and the customer, not with opening an account",
          "Your own buying habits are a useful clue to how customers behave",
          "A quick starting-point quiz showed everyone where they stood"
        ]
      },
      {
        title: "What digital marketing really is",
        body:
          "Digital marketing was defined as using the internet and digital tools to put a useful message in front of the right customer and move them toward a worthwhile action. The class also cleared up what it is not.",
        points: [
          "Not only Instagram, not only posting, not automatically free",
          "Not the same as going viral, buying followers or being on every platform",
          "Posting is the activity; strategy is the thinking behind it",
          "Before posting, ask why, for whom, what problem it solves, what comes next and how you will know it worked"
        ]
      },
      {
        title: "Customer first, platform second",
        body:
          "Before choosing any platform, participants learned seven questions to ask about their customer: who they are, what they want, what they do instead, what stops them, what proof they need, where they look for information and what action you want from them.",
        points: [
          "\"Everyone\" is not an audience. Narrow by age, budget, needs and occasion",
          "A narrowing challenge pushed each person from three possible audiences down to one",
          "The more specific the audience, the easier the message and channel become"
        ]
      },
      {
        title: "Why Nigerian businesses go digital, and the reality check",
        body:
          "The benefits were set beside the practical realities of doing business online in Nigeria, so plans stay grounded.",
        points: [
          "Benefits: wider reach, clearer targeting, two-way conversation, convenience, measurable results and lasting relationships",
          "Realities: network quality, data costs, trust in unfamiliar sellers, delivery, payment options, location and customer service",
          "Traditional marketing is not useless; digital adds more ways to reach, talk to and understand customers"
        ]
      },
      {
        title: "Channels, and rented versus controlled spaces",
        body:
          "Participants mapped the main channels to their jobs: WhatsApp for direct sales and follow-up, Facebook for community trust, Instagram and TikTok for discovery, Google for being found, email for existing contacts and a website for credibility and action. A matching game had groups defend which channel fits which situation.",
        points: [
          "Choose channels by audience, objective, content and resources",
          "Social platforms are rented space: the platform sets the rules",
          "Your website, customer list and email list are assets you control",
          "Do not build a business that depends on a single platform"
        ]
      },
      {
        title: "Buying triggers and the customer journey",
        body:
          "People buy because of a sudden event, an ongoing frustration or a planned decision. They then move through five stages: awareness, interest, consideration, action and retention. A group case asked each team to design one marketing piece for every stage of selling a ₦25,000 online course.",
        points: [
          "Asking a stranger to buy straight away is like proposing on the first hello",
          "Trust is built stage by stage",
          "Retention is part of marketing, not an afterthought"
        ]
      },
      {
        title: "A beginner strategy in eight steps",
        body:
          "The day ended with a simple framework: goal, audience, problem, offer, message, channel, content and call to action. A worked example for a meal-prep business in Warri showed how the pieces fit, participants filled in an audience worksheet and tried using an AI assistant to narrow their customer, then delivered a 60-second marketing presentation to the room.",
        points: [
          "Ask \"which channel fits my audience, goal, content and resources?\", not \"which platform is best?\"",
          "Common mistakes: no clear audience, weak calls to action, being everywhere, expecting instant sales and confusing likes with results"
        ]
      }
    ],
    activities: [
      { title: "Your business, your story", description: "Describe what you sell, who it is for and how people find it." },
      { title: "Audience narrowing challenge", description: "Turn three possible audiences into one, then answer the seven customer questions." },
      { title: "Channel match game", description: "Choose and defend the right first channel for five real situations." },
      { title: "Course case study", description: "Design one marketing piece for each stage of the customer journey." },
      { title: "60-second presentation", description: "Pitch a simple marketing plan using the eight-step framework." }
    ],
    takeaway:
      "Know who you are speaking to, where they look and why they would act, then build assets you control instead of depending on one platform."
  },

  {
    n: 2,
    slug: "day-2",
    title: "Content Creation Fundamentals",
    subtitle: "Hook, body and call to action",
    headline: "Make people stop, trust you and message you.",
    mediaKey: "day2",
    status: "complete",
    summary:
      "Day 2 turned the strategy into something people can actually see. Participants learned that content is simply what speaks for your business when you are not in the room, and practised building posts that earn attention, deliver value and ask for one clear action.",
    outcomes: [
      "Define content creation and its different jobs",
      "Start from the audience and a clear niche",
      "Write hooks, bodies and calls to action that fit together",
      "Plan a week of content without running out of ideas"
    ],
    sections: [
      {
        title: "Recap and the scroll-or-stop warm-up",
        body:
          "A quick review of Day 1 was followed by a live game in which the room judged real posts and decided whether to stop or scroll, then discussed why. Surprise, humour, a problem that belongs to me, a clear promise, a number and local words made people stop; vague, self-centred posts made them scroll.",
        points: ["The goal is not fame: it is to make people stop, trust you and message you"]
      },
      {
        title: "What content really is",
        body:
          "Content is far more than dancing on TikTok. A recipe, a product photo, a tutorial, a voice note or a customer story all count. The Nigerian market-stall analogy tied it together: the first call is your hook, the arrangement of goods is your visuals, the free taste is useful value, and answering questions, getting recommended and opening daily map to replies, reviews and consistency.",
        points: [
          "Content creation makes the material; content marketing uses it strategically; advertising pays to distribute a promotional message",
          "Content is the fuel, marketing is the engine and advertising is paid distribution"
        ]
      },
      {
        title: "Five jobs your content can do",
        body:
          "Every post needs a clear purpose: educate, entertain, inspire, connect or convert. A corner-of-the-room energiser had participants sort real post ideas into educate, entertain or sell.",
        points: ["A strong post can do more than one job", "A useful rule of thumb is about 80 percent value and 20 percent direct selling"]
      },
      {
        title: "Audience, niche and beginner myths",
        body:
          "Audience comes before content. The class worked on finding a specific niche, then challenged the myths that hold beginners back.",
        points: [
          "You do not need an expensive camera; a decent phone, good light and a clean lens will do",
          "You do not need thousands of followers to begin",
          "You can work faceless using hands, products, voice-over and text",
          "Clear and authentic beats fancy language and over-polished perfection"
        ]
      },
      {
        title: "Formats, pillars and an idea machine",
        body:
          "Purpose, format, platform and topic were separated so ideas stop getting mixed up. Participants met the common formats, learned to choose three to five content pillars and used ten reusable angles to generate endless ideas.",
        points: [
          "Formats include talking head, voice-over with visuals, tutorials, lists, storytime, skits, interviews, carousels and reviews",
          "Pillars come from your expertise, your audience's problems, your proof, your personality and your offers",
          "Angles such as mistakes, how-tos, myth versus fact, behind the scenes and before and after multiply ideas"
        ]
      },
      {
        title: "The anatomy of a post: hook, body, call to action",
        body:
          "A hook earns the next few seconds, the body delivers the value or proof, and the call to action tells people what to do next. Seven hook styles were taught: bold question, relatable pain, calling out the audience, mistake warning, promising a result, before and after, and a surprising number. Two competitive activities followed: a hook battle in groups and a Pidgin hook challenge to hear the same idea in the audience's own voice.",
        points: [
          "Keep each post to one main idea and show proof where you can",
          "Make the next step tiny and clear; one call to action beats five at once",
          "Hooks must be truthful, never clickbait"
        ]
      },
      {
        title: "From idea to finished content",
        body:
          "A working process runs from brief and research through angle, script, creation, editing, packaging, publishing and measuring. Phone basics, editing do's and don'ts and repurposing one master idea across formats rounded out the day, along with a seven-day content calendar mixing educate, entertain, connect and convert posts.",
        points: [
          "Clean the lens, face soft light, protect your audio, steady the phone and frame on purpose",
          "Good editing is clearer, not busier",
          "Repurpose the idea and adapt the delivery to each platform"
        ]
      }
    ],
    activities: [
      { title: "Scroll or Stop?", description: "The room judged real posts and discussed what earns attention." },
      { title: "Explain it to your mother", description: "Describe content creation in two simple sentences." },
      { title: "Educate, Entertain or Sell?", description: "Sort post ideas into the corner that fits best." },
      { title: "Hook battle", description: "Groups wrote five truthful hooks on one topic and the room voted." },
      { title: "Pidgin hook challenge", description: "Rewrite the best hook in Pidgin or a local language and read it with energy." }
    ],
    takeaway:
      "Start with the audience, give every post one job, and keep the hook, body and call to action working as a team."
  },

  {
    n: 3,
    slug: "day-3",
    title: "Platforms & Social Media Marketing",
    subtitle: "From \"what should I post?\" to \"where, and what should it achieve?\"",
    headline: "Don't be everywhere. Be where your customers respond.",
    mediaKey: "day3",
    status: "complete",
    summary:
      "Day 3 answered the question every beginner asks next: where should I post? Participants learned to think of platforms as different market spaces, choose one primary and one support platform, and plan a week of focused activity.",
    outcomes: [
      "Explain a platform and social media marketing simply",
      "Tell creation, management, marketing and paid ads apart",
      "Match a goal to a sensible platform",
      "Adapt one idea for several platforms and plan a week"
    ],
    sections: [
      {
        title: "Platforms are market spaces",
        body:
          "A platform is simply a place where people gather online. Each one behaves like a different part of a Nigerian market: WhatsApp is the shop counter, Facebook the town hall, Instagram the shop window, TikTok the busy motor park and YouTube the library.",
        points: [
          "Being on a platform is not a strategy",
          "Social media marketing runs through attract, build trust, engage, convert and retain",
          "Creation, management, marketing and paid ads are different jobs"
        ]
      },
      {
        title: "Why it matters, and how to choose",
        body:
          "Low start-up cost, reach beyond your street, trust built through conversation and measurable results make social media valuable. The four-question filter helps choose: who is the customer, what are you offering, how will they act, and can you keep it up every week?",
        points: ["Beginner rule: one primary platform plus one support platform", "Start where your customers actually respond"]
      },
      {
        title: "WhatsApp Business, the digital shop counter",
        body:
          "Participants explored the business profile, catalog, greeting and away messages, quick replies and labels for moving a customer from new enquiry to paid and delivered. Selling through WhatsApp Status followed the same hook, body and call to action pattern.",
        points: ["Use a dedicated business line", "Use broadcast lists only with people who saved your number, and never spam groups"]
      },
      {
        title: "Facebook, Instagram, TikTok and YouTube",
        body:
          "Each platform got a focused tour. Facebook builds community and local trust through a complete profile, groups and Marketplace. Instagram is a shop window of profile, feed, Stories and Reels, shown through a plus-size fashion example. TikTok introduces you to strangers when you show personality and open strongly. YouTube suits depth and search, illustrated by a mechanic's short-plus-long video plan.",
        points: [
          "Contribute before you promote on Facebook",
          "Mix photos, carousels, Reels and behind-the-scenes on Instagram",
          "Test and stay consistent on TikTok; it is not only for young people",
          "Use YouTube when your audience needs depth and repeated reference"
        ]
      },
      {
        title: "One idea, many versions",
        body:
          "A bakery launching a red velvet cake showed how a single idea becomes a Status, Reel, Story, Facebook post, TikTok and YouTube Short. What changes is the hook, length, pacing, caption and call to action; the core idea stays.",
        points: ["Repurpose the idea, not the exact post", "Platform Court: five groups defended their platform, format, call to action and metric for real business cases"]
      },
      {
        title: "Reach, the algorithm and good habits",
        body:
          "Organic reach is earned; paid reach is bought. The class learned that the algorithm is a ranking system that tests content on a few people, reads signals such as watching, skipping, sharing and commenting, and decides what to push next.",
        points: [
          "Test free first and pay only for what already works",
          "Reply quickly, ask good questions, use a few relevant hashtags and share real proof",
          "Avoid posting only to sell, copying blindly, vanishing for weeks and judging success by followers alone"
        ]
      },
      {
        title: "Staying safe and reading the numbers",
        body:
          "A transfer screenshot is not payment: always confirm in your real bank or payment app. Protect customer information, ask permission before sharing testimonials, watch for fake alerts and lock your accounts. A metric detective game compared a post with 50,000 views and no sales against one with 4,000 views and eight sales.",
        points: [
          "Reach, views, watch time, engagement, leads and sales each tell a different story",
          "A small audience that acts beats a huge one that does not"
        ]
      },
      {
        title: "Funnel and one-week plan",
        body:
          "The social media funnel moves people from attention to interest to trust to action. The day closed with building a one-week platform plan built on pillars, calls to action and one metric to watch.",
        points: []
      }
    ],
    activities: [
      { title: "Where did you discover it?", description: "Trace where you last discovered a business, and why you trusted it." },
      { title: "Platform Court", description: "Defend a platform, format, call to action and metric for a real Nigerian business case." },
      { title: "Metric detective", description: "Decide which of two posts is better for sales." },
      { title: "One-week plan", description: "Draft a seven-day plan with pillars, calls to action and a metric." }
    ],
    takeaway:
      "A platform is not a strategy. Pick one primary and one support platform where your customers already respond."
  },

  {
    n: 4,
    slug: "day-4",
    title: "Tools & Hands-On Creation",
    subtitle: "From idea to tool to finished content",
    headline: "Done is better than perfect.",
    mediaKey: "day4",
    status: "content-ready-media-pending",
    summary:
      "Day 4 was the practical day. After three days of understanding customers, content and platforms, participants picked up their phones and made real content with simple tools, using the idea that tools are the sewing machine, not the dress.",
    outcomes: [
      "Choose the right tool for a job",
      "Take a better phone photo",
      "Create a simple branded graphic in Canva",
      "Edit a short vertical video in CapCut",
      "Use AI for ideas and drafts responsibly"
    ],
    sections: [
      {
        title: "The big idea: tools are not the goal",
        body:
          "Success is useful content that is created and ready to use, not knowing every button. The creator's toolbox was organised into six drawers instead of thirty apps: capture, design, video, think and write, platform, and measure and organise.",
        points: ["Collect posts, not apps", "Ten finished posts beat thirty unused apps", "Focus, practise, create, publish, improve"]
      },
      {
        title: "Phone photography",
        body:
          "A phone is a production camera. The biggest gains come from a clean lens, good light, good framing, a steady phone and a simple background. Eight habits were taught, and participants learned to think like photographers by showing products in use rather than sitting on a table.",
        points: [
          "Wipe the lens, face the light and prefer daylight to flash",
          "Move closer instead of zooming, tap to focus and use grid lines",
          "Shoot wide, medium and close-up, then take ten and choose one"
        ]
      },
      {
        title: "Canva for simple branded graphics",
        body:
          "Canva was introduced for flyers, price lists, social posts, carousels and Status graphics, with templates treated as starting points. A seven-step flow covered format, template, edits, one clear message, two to three brand colours, proofreading and export.",
        points: [
          "Know the common sizes for square, portrait and story formats",
          "The three-second rule: if a stranger cannot understand it quickly, there is too much text",
          "Build a hierarchy of headline, one supporting line and a clear call to action"
        ]
      },
      {
        title: "CapCut for short vertical video",
        body:
          "Participants learned a seven-step editing flow: choose clips, trim dead air, lead with the strongest moment, add a hook, add captions, add quiet music and export vertically in high quality.",
        points: [
          "The first three seconds decide whether people keep watching",
          "Many people watch on mute, so captions matter",
          "Check music rights for commercial content"
        ]
      },
      {
        title: "Using AI responsibly",
        body:
          "AI is an assistant, not autopilot. A beginner prompt recipe combines a role, your business, your customer, your goal, a tone and a length. The class stressed that you steer and the tool helps.",
        points: [
          "Fact-check every claim and add real business information",
          "Never invent testimonials, results, statistics or false scarcity",
          "Do not paste private information such as bank details, passwords or customers' phone numbers"
        ]
      },
      {
        title: "From views to enquiries, and a repeatable system",
        body:
          "WhatsApp Business turns attention into enquiries through its profile, catalog, quick replies and labels. The content workflow runs from objective, audience and message through format, tool, creation and checking to publishing and review, with simple folders (raw, edited, ready) to stay organised.",
        points: ["See it, try it, show it: skill comes from repetition", "Skill does not wait for you to feel ready"]
      }
    ],
    activities: [
      { title: "Photo challenge", description: "Create three usable photos: wide, medium and close-up." },
      { title: "Make a Canva post", description: "Design one promotional graphic for a Nigerian small business." },
      { title: "Edit a short video", description: "Edit a 15 to 30 second vertical video with a hook, captions and clean cuts." },
      { title: "Spot the AI lie", description: "Find the claims in an AI-written caption that cannot be proven." },
      { title: "Fix this bad post", description: "Teams found and fixed the mistakes in a weak flyer." }
    ],
    takeaway:
      "Use a few simple tools well, publish finished work and let practice, not perfection, build your skill."
  },

  {
    n: 5,
    slug: "day-5",
    title: "Distribute, Sell & Measure",
    subtitle: "Bringing it all together",
    headline: "Turn attention into sales, and learn from the numbers.",
    mediaKey: "day5",
    status: "content-ready-media-pending",
    summary:
      "The final day joined the pieces from Days 1 to 4 into one working system: a simple plan for who to serve and where to show up, a way to grow the right numbers instead of vanity metrics, and a clear picture of what money is actually kept after costs. The questions, exercises and examples all pointed at the same finishing line: steady customers and real income.",
    outcomes: [
      "Write a simple 30-day SMART goal for a real business or service",
      "Describe a specific customer and why they should choose you",
      "Trace the path from stranger to repeat customer and find its weakest step",
      "Read basic metrics and run a weekly keep, improve, stop and test review",
      "Price from costs and value, and tell money collected apart from money kept"
    ],
    sections: [
      {
        title: "The day's question, and a voting icebreaker",
        body:
          "Day 5 opened with one question: how do I turn content into steady customers and real money? The answer was framed as three words to repeat all day: strategy is the plan, growth is the people, income is the pay. An opening vote compared a post with thousands of views and no buyers against one with a few hundred views and a dozen serious enquiries, making the point that views alone never prove success.",
        points: [
          "No plan means random posting; no people means no sales; no pay model means a busy page with an empty pocket",
          "Days 1 to 4 supplied the pieces; Day 5 joins them into one system"
        ]
      },
      {
        title: "Strategy: a plan before posting",
        body:
          "A strategy connects the goal, the audience, the message, the channel, the content plan, the budget and the measurement, so every post has a reason and an expected result. Seven plain questions turn that into something writable, from what you sell and who can pay for it to the next action and the result you will review. Goals were tightened with the SMART check, and each person wrote and peer-checked a 30-day goal.",
        points: [
          "Posting without a reason is just an activity; strategy explains the why and the wanted result",
          "Keep targets realistic for stock, delivery area, capacity and time"
        ]
      },
      {
        title: "Know who you serve, and why they should choose you",
        body:
          "Everybody is not a customer. Participants narrowed to a specific person with a location, need, buying situation, budget and platform habits, then practised positioning: the clear place a business should occupy in a customer's mind, said in concrete words rather than empty superlatives. Narrowing the niche and leading with the customer's problem make the message easier to write and easier to charge well for.",
        points: [
          "A narrow audience is easier to find, easier to write for and easier to price for",
          "Lead with the problem or desire, not with adjectives about the product"
        ]
      },
      {
        title: "Show up in the right places, and earn trust first",
        body:
          "The platform rule stayed beginner-sized: one main platform plus one supporting channel, chosen for where the customer actually is, starting small and doing it well. Because many online buyers hesitate after bad experiences, trust builders that cost nothing got full attention: a real face, real photos, clear prices and delivery areas, permission before sharing proof, and fast replies. Common strategy mistakes and three familiar Nigerian realities, from price sensitivity to data costs, kept the advice grounded.",
        points: [
          "Trust first, sale second: show your face, state your terms, reply fast",
          "Being everywhere and doing nothing well, hiding the price and vanishing for weeks all undo trust"
        ]
      },
      {
        title: "Growth: improve the right numbers",
        body:
          "Growth was redefined as more of the right people seeing, trusting, buying and returning, not bigger follower counts. A five-step path traces a stranger becoming a repeat customer, and the skill is finding the leak: many views but few enquiries points at the offer or call to action, while many enquiries but few purchases points at price clarity, trust or response speed. Metrics were translated into plain language, and a weekly review keeps, improves, stops or tests one thing at a time. Group exercises diagnosed a tailor's funnel and three small business pages.",
        points: [
          "Traffic without buyers is not growth; a small audience that acts beats a huge one that does not",
          "Change one thing at a time so you know what worked"
        ]
      },
      {
        title: "Small budgets, honest audiences",
        body:
          "Paid boosting was taught as a small, careful experiment for posts that already earned real replies: a modest daily amount for a few days, aimed at the right town and age group, sent to WhatsApp, then counted in messages and orders. Buying followers was ruled out entirely: fake followers never buy, platforms remove them, and a big count with no engagement makes a page look suspicious.",
        points: [
          "Prove a post free first; only then test money behind it",
          "Build an audience that can actually become customers"
        ]
      },
      {
        title: "Income: know what you keep",
        body:
          "The closing module drew the line that matters: money collected is what entered the account, money earned is what stays after costs, and a sale that costs more than it brings in is a loss. A simple formula of customer payment minus costs was worked through on a real example, showing how discounting without knowing the numbers multiplies the work for the same keep. Four beginner-friendly earning paths, three pricing questions and a full business worksheet turned the week's learning into a personal plan, closed with a quiz and one system to remember: plan, attract and build trust, measure, improve, sell and retain.",
        points: [
          "Know your numbers before you set a price or offer a discount",
          "Repeat customers and referrals are part of income, not an afterthought"
        ]
      }
    ],
    activities: [
      { title: "Viral post challenge", description: "Vote on which of two posts is better, then learn why views alone never prove success." },
      { title: "Write one SMART goal", description: "Draft a 30-day goal, swap with a partner and check each letter." },
      { title: "Diagnose the numbers", description: "Trace a tailor's week of views, likes, enquiries and orders to find the drop-off." },
      { title: "Number detectives", description: "Find the weakest step for three small business pages and prescribe one fix each." },
      { title: "Day 5 business worksheet", description: "Fill in a full one-page plan: customer, goal, platforms, content ideas, numbers and review date." }
    ],
    takeaway:
      "Plan who you serve and where you show up, grow the numbers that lead to sales, and always know what you actually keep."
  }
];

export const getDay = (n) => days.find((d) => d.n === Number(n));
