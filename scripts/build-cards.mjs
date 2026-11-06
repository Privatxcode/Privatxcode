// Builds the animated SVG cards used by the profile README.
// Static cards are always rebuilt. The stats card needs STATS_TOKEN, otherwise it is left untouched.
import { mkdirSync, writeFileSync } from "node:fs";

const LOGIN = "Privatxcode";
const OUT = new URL("../assets/", import.meta.url);
const WIDTH = 900;

const color = {
  bg: "#0d1117",
  panel: "#161b22",
  border: "#30363d",
  text: "#f0f6fc",
  muted: "#9da7b3",
  accent: "#2dd4a7",
};
const SANS = "-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif";
const MONO = "ui-monospace,SFMono-Regular,Menlo,Consolas,'Liberation Mono',monospace";
const MONO_CHAR_RATIO = 0.6;

const esc = (value) =>
  String(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const reveal = (delay) => `class="in" style="animation-delay:${delay}s"`;

// Elements start hidden and fade in once. Reduced motion shows the final state immediately.
const baseStyle = `
  .sans{font-family:${SANS}}
  .mono{font-family:${MONO}}
  .in{opacity:0;animation:in .7s cubic-bezier(.2,.7,.2,1) forwards}
  @keyframes in{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
  @media (prefers-reduced-motion:reduce){
    *{animation:none!important}
    .in{opacity:1}
  }`;

const svg = (height, title, style, body) => `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${height}" viewBox="0 0 ${WIDTH} ${height}" role="img" aria-label="${esc(title)}">
<title>${esc(title)}</title>
<style>${baseStyle}${style}</style>
<rect x=".5" y=".5" width="${WIDTH - 1}" height="${height - 1}" rx="14" fill="${color.bg}" stroke="${color.border}"/>
${body}
</svg>
`;

function banner() {
  const phrases = [
    "Multi-tenant architectures",
    "Mobile money and card payments",
    "React Native apps for iOS and Android",
    "Redis caching and idempotence",
  ];
  const nodes = [
    { label: "web", x: 600, y: 90 },
    { label: "mobile", x: 600, y: 210 },
    { label: "api", x: 715, y: 150, active: true },
    { label: "postgres", x: 825, y: 80 },
    { label: "redis", x: 825, y: 150 },
    { label: "payments", x: 825, y: 220 },
  ];
  const links = [
    [0, 2],
    [1, 2],
    [2, 3],
    [2, 4],
    [2, 5],
  ];
  const NODE_W = 84;
  const NODE_H = 34;

  const paths = links
    .map(([from, to], i) => {
      const a = nodes[from];
      const b = nodes[to];
      const startX = a.x + NODE_W / 2;
      const endX = b.x - NODE_W / 2;
      const midX = (startX + endX) / 2;
      const d = `M${startX} ${a.y}C${midX} ${a.y} ${midX} ${b.y} ${endX} ${b.y}`;
      return `<g ${reveal(0.9 + i * 0.08)}><path d="${d}" fill="none" stroke="${color.border}" stroke-width="1.5"/><path class="flow" d="${d}" fill="none" stroke="${color.accent}" stroke-width="1.5" stroke-linecap="round"/></g>`;
    })
    .join("\n");

  const boxes = nodes
    .map(
      (n, i) => `<g ${reveal(0.5 + i * 0.08)}><rect x="${n.x - NODE_W / 2}" y="${n.y - NODE_H / 2}" width="${NODE_W}" height="${NODE_H}" rx="8" fill="${color.panel}" stroke="${n.active ? color.accent : color.border}"/><text class="mono" x="${n.x}" y="${n.y + 4.5}" text-anchor="middle" font-size="13" fill="${n.active ? color.accent : color.text}">${n.label}</text></g>`,
    )
    .join("\n");

  const rotating = phrases
    .map(
      (p, i) =>
        `<text class="mono rot${i === 0 ? " rot-first" : ""}" style="animation-delay:${1 + i * 3}s" x="48" y="212" font-size="15" fill="${color.accent}">${esc(p)}</text>`,
    )
    .join("\n");

  const style = `
  .flow{stroke-dasharray:3 13;animation:flow 1.4s linear infinite}
  @keyframes flow{to{stroke-dashoffset:-16}}
  .dot{animation:pulse 2.4s ease-in-out infinite}
  @keyframes pulse{50%{opacity:.35}}
  .rule{transform-origin:48px 0;animation:rule 1s cubic-bezier(.2,.7,.2,1) .35s both}
  @keyframes rule{from{transform:scaleX(0)}to{transform:scaleX(1)}}
  .rot{opacity:0;animation:rot 12s linear infinite}
  @keyframes rot{0%{opacity:0}2%,23%{opacity:1}25%,100%{opacity:0}}
  @media (prefers-reduced-motion:reduce){
    .rot-first{opacity:1}
  }`;

  const body = `<g ${reveal(0)}><circle class="dot" cx="53" cy="62" r="4.5" fill="${color.accent}"/><text class="mono" x="68" y="67" font-size="13" fill="${color.muted}">Lomé, Togo · Open to freelance &amp; remote</text></g>
<text ${reveal(0.1)} x="48" y="132"><tspan class="sans" font-size="58" font-weight="700" fill="${color.text}" letter-spacing="-1">Privat Daagbo</tspan></text>
<rect class="rule" x="48" y="150" width="64" height="3" rx="1.5" fill="${color.accent}"/>
<text ${reveal(0.25)} x="48" y="184"><tspan class="sans" font-size="23" fill="${color.text}">Tech Lead · Full Stack &amp; Mobile</tspan></text>
${rotating}
${paths}
${boxes}`;

  return svg(
    290,
    "Privat Daagbo, Tech Lead Full Stack and Mobile, Lomé, Togo. Open to freelance and remote work.",
    style,
    body,
  );
}

function impact() {
  const tiles = [
    { value: "500M+", lines: ["FCFA (~€760k) tracked", "monthly in a TMS"] },
    { value: "195", lines: ["employees on a", "self-service HRIS"] },
    { value: "90→10%", lines: ["manual tasks on", "transport operations"] },
    { value: "6", lines: ["iOS and Android", "apps delivered"] },
  ];
  const GAP = 12;
  const MARGIN = 16;
  const tileW = (WIDTH - MARGIN * 2 - GAP * (tiles.length - 1)) / tiles.length;

  const body = tiles
    .map((tile, i) => {
      const x = MARGIN + i * (tileW + GAP);
      const lines = tile.lines
        .map(
          (line, j) =>
            `<text class="sans" x="${x + 18}" y="${100 + j * 20}" font-size="14" fill="${color.muted}">${esc(line)}</text>`,
        )
        .join("");
      return `<g ${reveal(0.15 + i * 0.18)}><rect x="${x}" y="16" width="${tileW}" height="128" rx="10" fill="${color.panel}" stroke="${color.border}"/><text class="sans" x="${x + 18}" y="72" font-size="36" font-weight="700" fill="${color.accent}" letter-spacing="-.5">${esc(tile.value)}</text>${lines}</g>`;
    })
    .join("\n");

  return svg(
    160,
    "Impact: over 500 million FCFA tracked monthly in a TMS, 195 employees on a self-service HRIS, manual tasks reduced from 90% to 10%, 6 iOS and Android apps delivered.",
    "",
    body,
  );
}

function stack() {
  const groups = [
    ["Languages", ["TypeScript", "JavaScript", "SQL"]],
    ["Front & mobile", ["React", "Next.js", "React Native", "Expo", "Tailwind CSS", "TanStack Query"]],
    ["Backend", ["Node.js", "NestJS", "Express", "REST", "WebSockets"]],
    ["Data", ["PostgreSQL", "Redis", "Prisma", "Supabase"]],
    ["Payments", ["Paygate", "Semoa", "CinetPay", "Stripe", "Webhooks"]],
    ["Architecture", ["Multi-tenant", "RLS/RBAC", "Idempotence", "Caching", "Design system"]],
    ["DevOps & QA", ["Docker", "GitHub Actions", "Sentry", "Jest"]],
  ];
  const FONT = 13;
  const CHIP_H = 30;
  const CHIP_GAP = 8;
  const ROW_GAP = 14;
  const LABEL_X = 32;
  const CHIPS_X = 176;
  const RIGHT = WIDTH - 28;

  let y = 28;
  let chipIndex = 0;
  const rows = groups.map(([label, items]) => {
    const rowY = y;
    let x = CHIPS_X;
    const chips = items.map((item) => {
      const w = Math.ceil(item.length * FONT * MONO_CHAR_RATIO) + 24;
      if (x + w > RIGHT) {
        x = CHIPS_X;
        y += CHIP_H + CHIP_GAP;
      }
      const chip = `<g ${reveal(0.1 + chipIndex++ * 0.035)}><rect x="${x}" y="${y}" width="${w}" height="${CHIP_H}" rx="7" fill="${color.panel}" stroke="${color.border}"/><text class="mono" x="${x + w / 2}" y="${y + 19.5}" text-anchor="middle" font-size="${FONT}" fill="${color.text}">${esc(item)}</text></g>`;
      x += w + CHIP_GAP;
      return chip;
    });
    y += CHIP_H + ROW_GAP;
    return `<text class="sans" x="${LABEL_X}" y="${rowY + 20}" font-size="14" font-weight="600" fill="${color.muted}">${esc(label)}</text>\n${chips.join("\n")}`;
  });

  const summary = groups.map(([label, items]) => `${label}: ${items.join(", ")}`).join(". ");
  return svg(y + 28 - ROW_GAP, `Tech stack. ${summary}.`, "", rows.join("\n"));
}

async function fetchStats(token) {
  const query = `query($login:String!,$after:String){
    user(login:$login){
      contributionsCollection{
        contributionCalendar{
          totalContributions
          weeks{contributionDays{date contributionCount}}
        }
      }
      repositories(first:100,after:$after,isFork:false,ownerAffiliations:[OWNER,COLLABORATOR,ORGANIZATION_MEMBER]){
        pageInfo{hasNextPage endCursor}
        nodes{primaryLanguage{name}}
      }
    }
  }`;

  // Counting repositories keeps one large repository with vendored code from skewing the shares.
  const counts = new Map();
  let repositories = 0;
  let contributions;
  let after = null;
  do {
    const response = await fetch("https://api.github.com/graphql", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ query, variables: { login: LOGIN, after } }),
    });
    if (!response.ok) throw new Error(`GitHub API returned ${response.status}`);
    const { data, errors } = await response.json();
    if (errors) throw new Error(errors.map((e) => e.message).join("; "));

    contributions = data.user.contributionsCollection;
    for (const repo of data.user.repositories.nodes) {
      repositories++;
      const name = repo.primaryLanguage?.name;
      if (name) counts.set(name, (counts.get(name) ?? 0) + 1);
    }
    const { hasNextPage, endCursor } = data.user.repositories.pageInfo;
    after = hasNextPage ? endCursor : null;
  } while (after);

  const days = contributions.contributionCalendar.weeks.flatMap((week) => week.contributionDays);
  const total = [...counts.values()].reduce((sum, count) => sum + count, 0);
  const languages = [...counts]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, count]) => ({ name, share: count / total }));

  return {
    contributions: contributions.contributionCalendar.totalContributions,
    repositories,
    ...streaks(days),
    languages,
  };
}

// Today does not break the current streak while it is still empty.
function streaks(days) {
  let longest = 0;
  let run = 0;
  for (const day of days) {
    run = day.contributionCount > 0 ? run + 1 : 0;
    longest = Math.max(longest, run);
  }
  let current = 0;
  for (let i = days.length - 1; i >= 0; i--) {
    if (days[i].contributionCount > 0) current++;
    else if (i !== days.length - 1) break;
  }
  return { currentStreak: current, longestStreak: longest };
}

function statsCard(stats) {
  const number = (value) => value.toLocaleString("en-US");
  const metrics = [
    [number(stats.contributions), "contributions, 12 months"],
    [number(stats.repositories), "repositories"],
    [`${stats.currentStreak}d`, "current streak"],
    [`${stats.longestStreak}d`, "longest streak"],
  ];
  const metricBody = metrics
    .map(([value, label], i) => {
      const x = 32 + (i % 2) * 190;
      const y = 62 + Math.floor(i / 2) * 84;
      return `<g ${reveal(0.1 + i * 0.12)}><text class="sans" x="${x}" y="${y}" font-size="30" font-weight="700" fill="${color.text}">${esc(value)}</text><text class="sans" x="${x}" y="${y + 24}" font-size="13" fill="${color.muted}">${esc(label)}</text></g>`;
    })
    .join("\n");

  const BAR_X = 610;
  const BAR_W = 220;
  const languageBody = stats.languages
    .map(({ name, share }, i) => {
      const y = 44 + i * 30;
      const percent = (share * 100).toFixed(1);
      return `<g ${reveal(0.2 + i * 0.1)}><text class="mono" x="462" y="${y + 9}" font-size="13" fill="${color.text}">${esc(name)}</text><rect x="${BAR_X}" y="${y}" width="${BAR_W}" height="8" rx="4" fill="${color.panel}"/><rect class="bar" style="animation-delay:${0.4 + i * 0.1}s" x="${BAR_X}" y="${y}" width="${Math.max(BAR_W * share, 8).toFixed(1)}" height="8" rx="4" fill="${color.accent}"/><text class="mono" x="${WIDTH - 24}" y="${y + 9}" text-anchor="end" font-size="12" fill="${color.muted}">${percent}%</text></g>`;
    })
    .join("\n");

  const updated = new Date().toISOString().slice(0, 10);
  const style = `
  .bar{transform-box:fill-box;transform-origin:left;animation:bar 1s cubic-bezier(.2,.7,.2,1) both}
  @keyframes bar{from{transform:scaleX(0)}to{transform:scaleX(1)}}`;
  const body = `${metricBody}
<line x1="430" y1="28" x2="430" y2="192" stroke="${color.border}"/>
${languageBody}
<text class="mono" x="462" y="204" font-size="11" fill="${color.muted}">Primary language per repo · Private repos included · ${updated}</text>`;

  const languages = stats.languages.map((l) => `${l.name} ${(l.share * 100).toFixed(1)}%`).join(", ");
  return svg(
    222,
    `GitHub activity: ${stats.contributions} contributions over 12 months, ${stats.repositories} repositories, ${stats.currentStreak} day current streak, ${stats.longestStreak} day longest streak. Primary language per repository: ${languages}.`,
    style,
    body,
  );
}

mkdirSync(OUT, { recursive: true });
const write = (name, content) => {
  writeFileSync(new URL(name, OUT), content);
  console.log(`wrote assets/${name}`);
};

write("banner.svg", banner());
write("impact.svg", impact());
write("stack.svg", stack());

const token = process.env.STATS_TOKEN;
if (token) {
  write("stats.svg", statsCard(await fetchStats(token)));
} else {
  console.log("STATS_TOKEN not set: keeping the existing stats card");
}
