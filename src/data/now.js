// The /now page (the nownownow.com idea): what I'm focused on at the moment,
// not everything I've ever done. Bump `updated` whenever this changes; once
// it's 60 days old the page says it might be stale. The "lately" block under
// it (latest post, latest pushes) fills itself in at build time.
//
// Inline markup: [text](url), **bold**, *italic*, `code`.

export const now = {
  updated: "2026-09-25",
  sections: [
    {
      title: "Building",
      items: [
        "**[Nexium](/projects/nexium/)** 1.3.0, *Annapurna: North Face*, shipped on September 24. Now on 1.4: a standard library people stop supplementing. Collections and hashing are in; an HTTP client with TLS, websockets and time zones are next.",
        "**[nxtls](/projects/nxtls/)**, TLS 1.3 written in pure Nexium, talks to Discord, GitHub and Cloudflare. Next is the part I can't do myself: a review by someone who knows TLS.",
        "**[the-long-fork](/projects/the-long-fork/)** is live and waiting on its first link. [Fork the tip](https://londopy.github.io/the-long-fork/tip/) and it's yours.",
      ],
    },
    {
      title: "Writing",
      items: ["Notes on security, systems, radio, and building things, on [the blog](/blog/)."],
    },
    {
      title: "Studying",
      items: [
        "First year of college, and pointing it at OT / XIoT security.",
        "Open to internships in security and systems. [Say hi](/contact/).",
      ],
    },
    {
      title: "Outside",
      items: ["Skiing the Sierras, surfing the coast, and trad climbing anywhere I can drive to."],
    },
  ],
};
