import type { Category, GameEvent, Gap, Location, ResultKind, SideOfBall, SnapEvent } from "./demoFootball";

/**
 * The sample team, its playbook, and the game already under way when a visitor arrives.
 *
 * The app itself opens blank — a fresh install has no seeded data, on purpose. The website
 * is the opposite case: a visitor who lands on an empty screen has to record six plays
 * before the analytics say anything, and most of them will not. So the demo opens partway
 * through a scrimmage, with a log they can delete from, which is the same argument made
 * with evidence already on the table.
 */

export const OUR_TEAM = "Riverside";
export const OPPONENT = "Northgate";

export type Play = {
  id: string;
  label: string;
  category: Category;
  /** The hole the play is designed to hit. Our runs only. */
  gap: Gap | null;
};

export type Formation = { id: string; label: string; note?: string; plays: Play[] };

/** The offense a coach has authored in Play Maker, as the game-day sheet reads it back. */
export const OFFENSE: Formation[] = [
  {
    id: "i-form",
    label: "I Form",
    plays: [
      { id: "blast-24", label: "Blast 24", category: "RUN", gap: "RIGHT_B" },
      { id: "power-26", label: "Power 26", category: "RUN", gap: "RIGHT_C" },
      { id: "iso-21", label: "Iso 21", category: "RUN", gap: "LEFT_A" },
      { id: "play-action-deep", label: "Play Action Deep", category: "PASS", gap: null },
      { id: "boot-right", label: "Boot Right", category: "PASS", gap: null },
    ],
  },
  {
    id: "trips-right",
    label: "Trips Right",
    plays: [
      { id: "slant-right", label: "Slant Right", category: "PASS", gap: null },
      { id: "quick-out", label: "Quick Out", category: "PASS", gap: null },
      { id: "jet-28", label: "Jet 28", category: "RUN", gap: "RIGHT_D" },
      { id: "draw-23", label: "Draw 23", category: "RUN", gap: "LEFT_B" },
    ],
  },
  {
    id: "spread",
    label: "Spread",
    plays: [
      { id: "inside-zone-25", label: "Inside Zone 25", category: "RUN", gap: "LEFT_C" },
      { id: "bubble-screen", label: "Bubble Screen", category: "PASS", gap: null },
      { id: "four-verts", label: "Four Verts", category: "PASS", gap: null },
    ],
  },
  {
    id: "goal-line",
    label: "Goal Line",
    plays: [
      { id: "dive-22", label: "Dive 22", category: "RUN", gap: "RIGHT_A" },
      { id: "wedge-21", label: "Wedge 21", category: "RUN", gap: "LEFT_A" },
      { id: "toss-27", label: "Toss 27", category: "RUN", gap: "LEFT_D" },
    ],
  },
];

/** The fronts. A defensive call is a front, and a front has no plays under it. */
export const DEFENSE: Formation[] = [
  { id: "4-3", label: "4-3", note: "Default", plays: [] },
  { id: "5-2", label: "5-2", plays: [] },
  { id: "nickel", label: "Nickel", plays: [] },
];

/** Every offensive play, flattened — what Suggest a play ranks over. */
export const CATALOGUE = OFFENSE.flatMap((formation) =>
  formation.plays.map((play) => ({
    playId: play.id,
    playLabel: play.label,
    formationLabel: formation.label,
  })),
);

function findPlay(playId: string): { play: Play; formation: Formation } {
  for (const formation of OFFENSE) {
    const play = formation.plays.find((entry) => entry.id === playId);
    if (play) return { play, formation };
  }
  throw new Error(`no such play in the sample playbook: ${playId}`);
}

let seq = 0;
function nextId(): number {
  seq += 1;
  return seq;
}

/**
 * One of our snaps. The hole comes off the called play unless the sample says otherwise,
 * which is exactly how the result sheet fills it in.
 */
function ours(
  playId: string,
  yards: number,
  extra: { kind?: ResultKind; location?: Location; gap?: Gap; executedAs?: Category } = {},
): SnapEvent {
  const { play, formation } = findPlay(playId);
  const executedAs = extra.executedAs ?? play.category;
  const kind = extra.kind ?? "PLAY";
  return {
    t: "SNAP",
    id: nextId(),
    side: "OFFENSE",
    playId,
    playLabel: play.label,
    formationLabel: formation.label,
    executedAs,
    kind,
    gap: executedAs === "RUN" && kind !== "BROKEN" ? (extra.gap ?? play.gap) : null,
    location: executedAs === "PASS" && kind !== "SACK" ? (extra.location ?? "MIDDLE") : null,
    penalty: null,
    turnoverType: null,
    returnedForTouchdown: false,
    yards,
  };
}

/** One of theirs, entered on our defensive sheet: a front, and left, middle or right. */
function theirs(
  front: string,
  executedAs: Category,
  location: Location | null,
  yards: number,
  kind: ResultKind = "PLAY",
): SnapEvent {
  return {
    t: "SNAP",
    id: nextId(),
    side: "DEFENSE" as SideOfBall,
    playId: front,
    playLabel: front,
    formationLabel: front,
    executedAs,
    kind,
    gap: null,
    location: kind === "SACK" || kind === "BROKEN" ? null : location,
    penalty: null,
    turnoverType: null,
    returnedForTouchdown: false,
    yards,
  };
}

/**
 * A scrimmage already in progress: two of our drives around one of theirs.
 *
 * Sized so the analytics have something honest to say the moment the page opens. Blast 24
 * carries five times, which is what it takes to reach Established, so the headline card is
 * a claim with real evidence rather than whichever call got lucky once — and the thinner
 * numbers beside it still carry Trending, which is the point of the labels.
 *
 * It leaves the visitor on 4th and 4 near midfield, where the punt, the field goal and
 * Suggest a play are all live questions rather than buttons with nothing behind them.
 */
export const SAMPLE_GAME: GameEvent[] = [
  // --- our opening drive, from the 25 ------------------------------------------------
  ours("blast-24", 6),
  ours("power-26", 5),
  ours("slant-right", 9, { location: "MIDDLE" }),
  ours("inside-zone-25", 4),
  ours("four-verts", 0, { kind: "INCOMPLETE_PASS", location: "RIGHT" }),
  ours("iso-21", 2),
  ours("quick-out", 12, { location: "LEFT" }),
  ours("blast-24", 8),
  ours("jet-28", -3),
  ours("bubble-screen", 7, { location: "RIGHT" }),
  ours("power-26", 6, { kind: "TOUCHDOWN" }),
  { t: "TRY", id: nextId(), ours: true, kind: "EXTRA_POINT", good: true, executedAs: null },

  // --- theirs, from their own 25 -----------------------------------------------------
  theirs("4-3", "RUN", "LEFT", 4),
  theirs("4-3", "PASS", "MIDDLE", 8),
  theirs("5-2", "RUN", "MIDDLE", 3),
  theirs("4-3", "PASS", "RIGHT", 0, "INCOMPLETE_PASS"),
  theirs("4-3", "RUN", "LEFT", 9),
  theirs("nickel", "PASS", "RIGHT", 17),
  theirs("5-2", "RUN", "RIGHT", 2),
  theirs("nickel", "PASS", null, -6, "SACK"),
  theirs("4-3", "RUN", "MIDDLE", 3),
  // Fourth and long from our end of the field: they pin us on the 9.
  { t: "SPECIAL", id: nextId(), ours: false, unit: "PUNT", good: null, endYardLine: 9 },

  // --- ours again --------------------------------------------------------------------
  ours("blast-24", 4),
  ours("toss-27", 13),
  ours("iso-21", 1),
  ours("draw-23", 5),
  ours("slant-right", 7, { location: "MIDDLE" }),
  ours("blast-24", 3),
  ours("play-action-deep", -6, { kind: "SACK" }),
  ours("blast-24", 9),

  { t: "QUARTER", id: nextId() },
];
