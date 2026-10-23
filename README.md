# A website that feels like you

A prompt, a creative process, and a small code foundation for bringing your links and work into one personal website.

Bring your writing, shop, business, products, courses, projects, services, portfolio, events, community, or whatever you're making. The design starts with you. There is no preset aesthetic, illustration, object, or page layout to recreate.

## Start here

1. **Open your coding assistant.** Give it this repository link and the [copy-and-paste prompt](PROMPT.md).
2. **Share your world.** Answer a few questions, send inspiration pictures, and provide your exact links. You don't need a finished idea or design vocabulary.
3. **Choose a direction.** Explore different concepts, approve a small visual study, and give feedback on the working preview. “This feels too polished” or “I want the shop to be easier to find” is useful feedback.
4. **Put it online when you're ready.** Ask your assistant to check the site on a phone and computer, verify the destinations, and help you publish it. If you own a domain, tell it. It should explain any account or cost decisions before you commit.

You do not need to create folders, edit JSON, or upload code by hand. Ask your assistant to handle those steps. A GitHub account is not required just to read this guide.

## What's included

- [PROMPT.md](PROMPT.md): the conversation starter.
- [BUILD_GUIDE.md](BUILD_GUIDE.md): instructions for the assistant, from discovery through launch.
- [PERSONALIZE.md](PERSONALIZE.md): optional prompts for references and a place to collect exact destinations.
- [DESIGN_BRIEF.md](DESIGN_BRIEF.md): a short record the assistant fills in as you make decisions.
- `site.json`: your content, kept separate from the design.
- `catalog.mjs`: link validation and accessible HTML rendering helpers with no required visual theme.
- `index.html`, `review.css`, and `review.mjs`: a deliberately plain content review page. It helps check labels and destinations; **it is not the finished design or a visual direction to approve**.
- `build.mjs`, `preview.mjs`, and `check.mjs`: dependency-free preview, build, and content checks.

No personal assets, live accounts, example businesses, or working credentials are included. Contact forms, shops, mailing lists, and automatic feeds are not preconnected. Links can point to your existing services; extra integrations should be added only when needed and tested before they are described as working.

## For the coding assistant

Read [BUILD_GUIDE.md](BUILD_GUIDE.md) before implementation. Start with discovery and concepts. Do not show the content review page as your design proposal. Create the visual composition from the approved brief; retain, adapt, or replace the starter as appropriate.

With Node.js 22 or later, no dependency installation is needed:

```sh
npm run check
npm run build
npm run preview
```

Open `http://127.0.0.1:4173`. `preview` serves the current `dist/`; run `build` again after editing source files. The supplied build copies only the five website files into `dist/`; guide documents, tests, and environment files stay out of the build. The preview listens only on this computer. `PORT` can select another port.

```sh
npm test
npm run check:publish
```

The publish check intentionally fails on the blank starter. It catches empty identity/content, missing destinations, unconfirmed links, and invalid URLs. It does **not** prove that a remote page works, that a destination belongs to the user, or that a finished design is approved. Follow the launch review in the build guide too.

Publishing is a separate step. Use a static host with `npm run build` and output directory `dist`, or adapt the hosting settings if the final design uses a different stack. Verify current provider instructions and costs when launching; this repository does not deploy automatically.

The guide and code are provided under the [MIT License](LICENSE). Images, fonts, and other assets you add may have their own terms.
