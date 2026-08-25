import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

async function render(path = "/") {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}-${path}`);
  const { default: worker } = await import(workerUrl.href);
  return worker.fetch(
    new Request(`http://localhost${path}`, { headers: { accept: "text/html" } }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

test("server-renders the GameDay Huddle marketing page", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);
  const html = await response.text();
  assert.match(html, /GameDay Huddle/);
  assert.match(html, /Build the playbook/);
  assert.match(html, /The sideline operating system/);
  assert.match(html, /FOR MULTI-TEAM PROGRAMS/i);
  assert.match(html, /Your signal can drop/);
  assert.match(html, /Get the Android app/);
  assert.match(html, /application\/ld\+json/);
  // The playable game-day screen server-renders a scrimmage already under way, so the
  // analytics have something to say before the visitor has touched anything.
  assert.match(html, /id="demo"/);
  assert.match(html, /Record a drive/);
  assert.match(html, /Quick Stats/);
  assert.match(html, /Blast 24/);
  assert.match(html, /Riverside vs Northgate/);
  assert.match(html, /Offense Playbook/);
  assert.match(html, /THE EVERY-SNAP LOG/);
  assert.doesNotMatch(html, /Get the Android beta/i);
  assert.doesNotMatch(html, /stadium/i);
  assert.doesNotMatch(html, /Less tapping\. More coaching\./i);
  assert.doesNotMatch(html, /codex-preview|Your site is taking shape|react-loading-skeleton/);
});

test("download page carries release copy instead of beta copy", async () => {
  const response = await render("/download");
  assert.equal(response.status, 200);
  const html = await response.text();
  for (const phrase of [
    "Download GameDay Huddle <span",
    "What(?:'|&#x27;|&#39;)s new in",
    "Install the app",
    "Hear about updates",
    "Direct install",
    "Request an invite",
  ]) assert.match(html, new RegExp(phrase, "i"));
  for (const phrase of [
    "Download GameDay Huddle beta",
    // The Play Keeper is a seat inside the app now, not a second installer.
    "Download Play Keeper",
    "Install the beta",
    "Join the beta group",
    "Android beta",
    "Beta note",
    "testing build",
  ]) assert.doesNotMatch(html, new RegExp(phrase, "i"));
});

test("signup page renders a working account form instead of the opens-soon banner", async () => {
  const response = await render("/signup");
  assert.equal(response.status, 200);
  const html = await response.text();
  for (const phrase of [
    "Choose Coach Only",
    // Organization plans are arranged with us, so that card links out to /contact.
    "Contact us to set it up",
    "Team name",
    "Your name",
    "Email",
    "Password",
    "Access code \\(optional\\)",
    "covers your first year",
    "<noscript",
    "<form",
    // An invited coach has a door of their own: the code replaces the team name.
    "I(?:'|&#x27;|&#39;)m starting a new team",
    "I was given a coach code",
  ]) assert.match(html, new RegExp(phrase, "i"));
  assert.doesNotMatch(html, /Account creation opens soon/i);
  assert.doesNotMatch(html, /<button[^>]*\sdisabled/i);
  // The signup form only ever creates a coach account now.
  assert.doesNotMatch(html, /Program name/i);
  // The found door asks where the team plays. The state is picked, never typed:
  // the request carries a USPS code, and counting teams by state depends on
  // every Texas team saying "TX" rather than a spelling.
  assert.match(html, /<input(?=[^>]*\srequired)[^>]*name="town"/);
  assert.match(html, /<select(?=[^>]*\srequired)[^>]*name="state"/);
  const stateStart = html.indexOf('name="state"');
  const statePicker = html.slice(stateStart, html.indexOf("</select>", stateStart));
  // The whole USPS set, not a count: a count of 51 survives a pasted duplicate
  // that displaced a real state, and Kentucky coaches would have nothing to pick.
  const stateCodes = [...statePicker.matchAll(/<option[^>]*value="([A-Z]{2})"/g)].map((m) => m[1]);
  assert.deepEqual(
    stateCodes,
    ["AL","AK","AZ","AR","CA","CO","CT","DE","DC","FL","GA","HI","ID","IL","IN",
     "IA","KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH",
     "NJ","NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT",
     "VT","VA","WA","WV","WI","WY"],
    "fifty states and the District of Columbia, in the order the picker shows them",
  );
});

test("a returning coach is sent to a door that exists, not to a field the app hasn't got", async () => {
  const html = await render("/signup").then((response) => response.text());
  assert.match(html, /\sid="returning"/);
  assert.match(html, /A new season(?:'|&#x27;|&#39;)s code comes through us/i);
  assert.match(html, /<a[^>]+href="\/contact"/);
  // Redemption happens only inside sign-up, so a coach who already has an
  // account has nowhere to type a fresh code: not in the app, whose season-over
  // screen offers a sign-out and nothing else, and not on a route the server
  // does not serve. Naming either would send him round a closed loop.
  assert.doesNotMatch(html, /enter the new code (?:there|in the app)/i);
  assert.doesNotMatch(html, /href="\/account"/);

  const page = await readFile(new URL("../app/signup/page.tsx", import.meta.url), "utf8");
  assert.doesNotMatch(page, /\/api\/invites\/redeem/, "no such route is registered; naming it as fact misleads");
});

test("an invited coach founds no team, so no team name goes with the code", async () => {
  const flow = await readFile(new URL("../app/components/SignupFlow.tsx", import.meta.url), "utf8");
  assert.match(flow, /payload\.inviteCode = code;/);
  // The join branch must never put a team name in the payload; the server
  // ignores one, and asking for it would promise a team the account has not got.
  // Slice from the branch itself: an earlier if/else would otherwise cut this to
  // an empty string, and an empty string passes every check made of it.
  const start = flow.indexOf('if (door === "join")');
  const join = flow.slice(start, flow.indexOf("} else {", start));
  assert.match(join, /payload\.inviteCode/, "the join branch should be what got sliced");
  assert.doesNotMatch(join, /payload\.name/);
});

test("an invited coach can find his door, and reaching it costs him no keystrokes", async () => {
  const html = await render("/signup").then((response) => response.text());
  // Both landing cards otherwise describe founding a team or buying for a
  // program; a coach holding a code matches neither and has nowhere to start.
  assert.match(html, /Handed a code by your head coach/i);

  const flow = await readFile(new URL("../app/components/SignupFlow.tsx", import.meta.url), "utf8");
  // The code field only renders behind the join door, and its hint has to say
  // which code this is: the Play Keeper is handed an eight-digit game code that
  // belongs in the app, and the server calls this one an invite code.
  assert.match(flow, /coach-code-hint[\s\S]{0,400}?eight digits/i);
  assert.match(flow, /coach-code-hint[\s\S]{0,400}?invite code/i);
  // A maxLength lets the browser cut a pasted code to fit before the digits can
  // be read out of it, and the coach is refused over a code that was right.
  assert.doesNotMatch(flow, /maxLength=\{CODE_LENGTH/);
  // Arrow keys move and select inside a radio group, so selecting a door must
  // not move focus out of it (WCAG 3.2.2); the deliberate click still may.
  const pick = flow.slice(flow.indexOf("function pick("), flow.indexOf("function typeCode("));
  assert.doesNotMatch(pick, /focusFirstField/);
  assert.match(flow, /function choose\(next: Door\) \{[\s\S]{0,200}?focusFirstField\(next\);/);
});

test("the sign-up page promises the app we have, and opens its form without being asked", async () => {
  const html = await render("/signup").then((response) => response.text());

  // The form is the page: it renders open beside the reasons to fill it, and the
  // three plan cards below aim it rather than gate it. A card that had to be
  // clicked first cost a coach who arrived ready to type a whole step.
  assert.match(html, /<form/);
  assert.doesNotMatch(html, /class="signup-form-card"[^>]*hidden/i);
  for (const heading of ["Create your account", "Once you sign up", "Choose what works for you"]) {
    assert.match(html, new RegExp(heading, "i"));
  }

  // Nothing is running in a real season yet, so the page that asks a coach to
  // trust us with his program may not open by counting the coaches who already
  // did. There is no count here, and there is not to be one until there is one.
  assert.doesNotMatch(html, /thousands of coaches|trusted by|loved by|join \d[\d,]* coach/i);

  // Every line beside the form is something the app does. It has no messaging,
  // and it has never run anywhere but Android, so neither may be sold here.
  for (const truth of [
    "Build your playbook",
    "Manage your team",
    "Track games and stats",
    "Bring your staff in",
    "Coach without a signal",
  ]) assert.match(html, new RegExp(truth, "i"));
  assert.doesNotMatch(html, /send messages|staff and parents|on any device/i);

  // /login belongs to the account portal, which is not among the exported pages,
  // so naming it would send a returning coach to a 404 on the live site. The
  // sign-in door that exists is the app.
  assert.doesNotMatch(html, /href="\/login"/);
  assert.match(html, /Already have an account\?[\s\S]{0,80}sign in/i);
});

test("the repeated password is a check here and a field nowhere else", async () => {
  const html = await render("/signup").then((response) => response.text());
  assert.match(html, /Confirm password/i);

  const flow = await readFile(new URL("../app/components/SignupFlow.tsx", import.meta.url), "utf8");
  // A password cannot be read back, so the second field catches the typo before
  // the account is created around it. It is compared and then dropped: the
  // request that leaves the browser has never carried it, and the server has
  // never been told to expect it.
  assert.match(flow, /password !== String\(form\.get\("repeatPassword"\)/);
  assert.doesNotMatch(flow, /payload\.repeatPassword|repeatPassword:/);
});

test("the contact form is built with no relay to fail against", async () => {
  const workflow = await readFile(new URL("../.github/workflows/pages.yml", import.meta.url), "utf8");
  // marketing.gamedayhuddle.com was deleted on 20 Aug 2026. A URL here spends a
  // failed request on a dead host before every single fallback.
  assert.doesNotMatch(workflow, /NEXT_PUBLIC_CONTACT_ENDPOINT:\s*\S*https?:/);
  assert.match(workflow, /NEXT_PUBLIC_CONTACT_ENDPOINT:\s*""/);

  // With no endpoint the form goes straight to the prepared email: no request.
  const form = await readFile(new URL("../app/components/ContactForm.tsx", import.meta.url), "utf8");
  assert.match(form, /if \(!endpoint\) \{[\s\S]{0,200}?setStatus\("draft"\);[\s\S]{0,40}?return;/);
});

test("contact page carries the sales door and a working direct address", async () => {
  const response = await render("/contact");
  assert.equal(response.status, 200);
  const html = await response.text();
  for (const phrase of [
    "Organization plans start",
    "Running a program",
    "Coaching one team",
    "Number of teams",
    "<textarea",
    "Send message",
    'href="mailto:Doug@GameDayHuddle\\.com"',
  ]) assert.match(html, new RegExp(phrase, "i"));
  // Nothing on the page may promise a response time or a person we do not have.
  assert.doesNotMatch(html, /within 24 hours|sales team|account manager/i);
});

test("the Organization plan routes to sales while Coach stays self-serve", async () => {
  const [home, pricing, signup] = await Promise.all(
    ["/", "/pricing", "/signup"].map((path) => render(path).then((response) => response.text())),
  );

  for (const html of [home, pricing]) {
    assert.match(html, /<a[^>]+href="\/contact\?topic=organization"[^>]*>Contact us<\/a>/);
    assert.match(html, /Organization plans are set up directly with us\./);
    assert.doesNotMatch(html, /Get Organization/);
  }
  assert.match(signup, /<a[^>]+href="\/contact\?topic=organization"/);
});

test("the Live Demo page renders the playable recorder", async () => {
  const response = await render("/demo");
  assert.equal(response.status, 200);
  const html = await response.text();
  for (const phrase of [
    "Live Demo",
    "Quick Stats",
    "Offense Playbook",
    "THE EVERY-SNAP LOG",
    "Blast 24",
    "Riverside vs Northgate",
    "Scrimmage",
    "What this demo is not",
  ]) assert.match(html, new RegExp(phrase, "i"));
  // The tab is in the primary navigation on every page, not just this one.
  const home = await render("/").then((page) => page.text());
  assert.match(home, /href="\/demo"[^>]*>Live Demo</);
});

test("all exported navigation targets and page anchors resolve", async () => {
  const routeRequests = new Map([
    ["/", "/"],
    ["/demo", "/demo"],
    ["/about", "/about"],
    ["/pricing", "/pricing"],
    ["/download", "/download"],
    ["/signup", "/signup"],
    ["/contact", "/contact"],
    ["/privacy", "/privacy"],
    ["/terms", "/terms"],
  ]);
  const htmlByRoute = new Map();

  for (const [route, requestPath] of routeRequests) {
    const response = await render(requestPath);
    assert.equal(response.status, 200, `${route} should render`);
    htmlByRoute.set(route, await response.text());
  }

  for (const [route, html] of htmlByRoute) {
    const hrefs = [...html.matchAll(/\shref="([^"]+)"/g)].map((match) => match[1].replaceAll("&amp;", "&"));
    for (const href of hrefs) {
      if (!href.startsWith("/") && !href.startsWith("#")) continue;
      if (href.startsWith("/_next/")) continue;

      const [rawPath, hash] = href.split("#");
      // Links may carry a query string (/contact?topic=organization); the route is the path.
      const targetPath = rawPath.split("?")[0] || route;
      if (/\.[a-z0-9]+$/i.test(targetPath)) {
        await access(new URL(`../public${targetPath}`, import.meta.url));
        continue;
      }
      assert.ok(routeRequests.has(targetPath), `${route} links to an unexported route: ${href}`);
      if (hash) assert.match(htmlByRoute.get(targetPath), new RegExp(`\\sid="${hash}"`), `${href} should have a matching target`);
    }
  }
});

test("static hosting renders working fallbacks instead of dead controls", async () => {
  const home = await render("/").then((response) => response.text());

  // Without a checkout API configured, the Coach button falls back to sign-up
  // rather than rendering a dead control (or implying the plan is free).
  assert.match(home, /<a[^>]+href="\/signup"[^>]*>Get Coach<\/a>/);
  assert.doesNotMatch(home, /<button[^>]*>Call play/);
});

test("homepage includes the supplied app's Game Day and offensive analytics views", async () => {
  const response = await render("/");
  const html = await response.text();
  const productScreens = await readFile(new URL("../app/components/ProductScreens.tsx", import.meta.url), "utf8");

  assert.match(html, /Game Day home/);
  assert.match(html, /Offensive analytics/);
  assert.match(html, /Riverside vs Northgate/);
  assert.match(productScreens, /Where our carries are going/);
  assert.match(productScreens, /Power Right/);
  assert.match(productScreens, /Yards \/ play/);
});

test("homepage ships the coach product tour and accessible media assets", async () => {
  const response = await render("/");
  const html = await response.text();

  assert.match(html, /id="product-tour"/);
  assert.match(html, /gameday-huddle-product-overview\.mp4/);
  assert.match(html, /gameday-huddle-product-overview-poster\.jpg/);
  assert.match(html, /gameday-huddle-product-overview-en\.vtt/);
  await Promise.all([
    access(new URL("../public/media/gameday-huddle-product-overview.mp4", import.meta.url)),
    access(new URL("../public/media/gameday-huddle-product-overview-poster.jpg", import.meta.url)),
    access(new URL("../public/media/gameday-huddle-product-overview-en.vtt", import.meta.url)),
  ]);
});

test("ships production assets and removes the starter preview", async () => {
  const manifest = JSON.parse(await readFile(new URL("../app/download/manifest.json", import.meta.url), "utf8"));
  const [packageJson] = await Promise.all([readFile(new URL("../package.json", import.meta.url), "utf8"), access(new URL("../public/og.png", import.meta.url)), access(new URL(`../public/downloads/${manifest.huddle.file}`, import.meta.url))]);
  assert.doesNotMatch(packageJson, /react-loading-skeleton/);
  await assert.rejects(access(new URL("../app/_sites-preview/SkeletonPreview.tsx", import.meta.url)));
});
