/**
 * The football arithmetic behind the playable game-day demo.
 *
 * This is a second implementation of rules that already exist in Kotlin — `GameSituation`,
 * `LiveGame`, `ResultDraft`, `AnalyticsPolicy`, `OffenseAnalytics` and `DefenseAnalytics` in
 * the app's `core` module. It is duplicated rather than shared because the app has no web
 * build and is not getting one, and a marketing demo is not worth a cross-language build
 * step. The cost is real and worth stating plainly: a rule that changes in the app has to be
 * changed here too, or the website starts quietly telling visitors something the product no
 * longer does. Every rule lives in this one file and keeps the Kotlin's names so the two can
 * be read side by side.
 *
 * The doctrine the demo has to keep, because it is the product's whole argument:
 *
 * - **The event log is the source of truth.** Nothing is accumulated between calls. Delete
 *   or correct an entry and `derive` re-files every entry after it.
 * - **The spot is entered, the yardage is derived.** Never the other way round.
 * - **A result carries an outcome only for what the yardage cannot say.** Most snaps carry
 *   none, and the outcome row opening with nothing selected is the ordinary case.
 * - **Defense records left, middle or right — never a hole.** Offense records the designed
 *   hole.
 * - **Override beats precision.** The chains, the score and possession can each be
 *   overwritten by hand; the correction is a new event on top, never a rewrite of history.
 */

export const GOAL_LINE = 100;
export const MIDFIELD = 50;
export const FIRST_DOWN_DISTANCE = 10;

/** Where a receiving team takes over after a score. Their own 25, in whichever frame. */
export const TOUCHBACK = 25;

/** Timeouts a side carries into a half. The demo never reaches a half, so never refills. */
export const TIMEOUTS_PER_HALF = 3;

export type TeamRef = "OURS" | "THEIRS";
export type SideOfBall = "OFFENSE" | "DEFENSE";
export type Category = "RUN" | "PASS";

/**
 * The outcomes that say something the yardage cannot. Mirrors `ResultKind`.
 *
 * PLAY has no chip of its own — it is what the outcome row means when none of them is lit.
 */
export type ResultKind =
  | "PLAY"
  | "BROKEN"
  | "TOUCHDOWN"
  | "INCOMPLETE_PASS"
  | "TURNOVER"
  | "SACK"
  | "PENALTY";

/** Which third of the field a run or a throw went to. Mirrors `RunLocation`. */
export type Location = "LEFT" | "MIDDLE" | "RIGHT";

/** Mirrors `RunGap`, ordered left to right as the offense faces the defense. */
export type Gap =
  | "LEFT_D"
  | "LEFT_C"
  | "LEFT_B"
  | "LEFT_A"
  | "RIGHT_A"
  | "RIGHT_B"
  | "RIGHT_C"
  | "RIGHT_D";

/**
 * The eight holes under the app's default numbering — odd left, even right, counting out.
 * A coach's own scheme is a setting in the app; the demo does not offer the choice.
 */
export const GAPS: readonly { id: Gap; hole: number; side: Location }[] = [
  { id: "LEFT_D", hole: 7, side: "LEFT" },
  { id: "LEFT_C", hole: 5, side: "LEFT" },
  { id: "LEFT_B", hole: 3, side: "LEFT" },
  { id: "LEFT_A", hole: 1, side: "MIDDLE" },
  { id: "RIGHT_A", hole: 2, side: "MIDDLE" },
  { id: "RIGHT_B", hole: 4, side: "RIGHT" },
  { id: "RIGHT_C", hole: 6, side: "RIGHT" },
  { id: "RIGHT_D", hole: 8, side: "RIGHT" },
];

/**
 * Who blocks each seam, drawn between the holes on the placement diagram.
 *
 * Seven markers for eight holes: the front is a picture of the line, so the outside holes
 * sit beyond the last man rather than between two of them.
 */
export const LINE_POSITIONS = ["TE", "LT", "LG", "C", "RG", "RT", "TE"] as const;

export function gapInfo(gap: Gap) {
  // Non-null by construction: GAPS covers every member of the union.
  return GAPS.find((entry) => entry.id === gap)!;
}

export type Situation = { down: number; distance: number; yardLine: number };

// ---------------------------------------------------------------------------- the log

export type Penalty = { onUs: boolean; yards: number; accepted: boolean };

/**
 * How a turnover happened. Interception and fumble only: the app already knows a turnover
 * on downs from the chains, and putting it on a chip would let a coach contradict them —
 * a second spelling of a fact that is derived.
 */
export type TurnoverType = "INTERCEPTION" | "FUMBLE";

export const TURNOVER_LABELS: Record<TurnoverType, string> = {
  INTERCEPTION: "Interception",
  FUMBLE: "Fumble lost",
};

/**
 * One recorded snap, entered on one side's sheet.
 *
 * It carries no down, distance or field position, and that absence is the whole point: the
 * situation a play happened in is derived by replaying the log, so deleting an earlier entry
 * re-files every entry after it instead of leaving them describing a game that no longer
 * happened.
 */
export type SnapEvent = {
  t: "SNAP";
  id: number;
  side: SideOfBall;
  playId: string;
  playLabel: string;
  formationLabel: string;
  /** Null only while a draft is unfinished; a saved snap always says run or pass. */
  executedAs: Category | null;
  kind: ResultKind;
  /** Our own carry is placed by hole. Theirs never is. */
  gap: Gap | null;
  /** A throw, or their carry. Never our own carry. */
  location: Location | null;
  penalty: Penalty | null;
  turnoverType: TurnoverType | null;
  /**
   * A takeaway run home — their pick-six off our snap, or ours off theirs. It stays a
   * Turnover, because the outcome is still a turnover; this only says whose end zone it
   * reached, which leaves the spot with nothing to describe.
   */
  returnedForTouchdown: boolean;
  /** Where the ball ended, as a signed distance from the snap, for whoever had it. */
  yards: number;
};

export type TryEvent = {
  t: "TRY";
  id: number;
  ours: boolean;
  kind: "EXTRA_POINT" | "TWO_POINT";
  good: boolean;
  executedAs: Category | null;
};

export type SpecialEvent = {
  t: "SPECIAL";
  id: number;
  ours: boolean;
  unit: "PUNT" | "FIELD_GOAL";
  /** Field goals only. */
  good: boolean | null;
  /** Punts only: where the receiving team takes over, in our frame. */
  endYardLine: number | null;
};

export type TimeoutEvent = { t: "TIMEOUT"; id: number; ours: boolean };
export type QuarterEvent = { t: "QUARTER"; id: number };

/** The three confirm-first doors. Each is a new event on top, never a rewrite. */
export type ChainsEvent = { t: "CHAINS"; id: number } & Situation;
export type ScoreEvent = { t: "SCORE"; id: number; us: number; them: number };
export type PossessionEvent = { t: "POSSESSION"; id: number; possession: TeamRef };

export type GameEvent =
  | SnapEvent
  | TryEvent
  | SpecialEvent
  | TimeoutEvent
  | QuarterEvent
  | ChainsEvent
  | ScoreEvent
  | PossessionEvent;

// ------------------------------------------------------------------------- the labels

/** "Own 25", "Midfield", "Opp 18" — always read from our goal line, whoever has the ball. */
export function yardLineLabel(yardLine: number): string {
  if (yardLine <= 0) return "Own goal";
  if (yardLine >= GOAL_LINE) return "Their goal";
  if (yardLine === MIDFIELD) return "Midfield";
  return yardLine < MIDFIELD ? `Own ${yardLine}` : `Opp ${GOAL_LINE - yardLine}`;
}

function ordinal(down: number): string {
  if (down === 1) return "1st";
  if (down === 2) return "2nd";
  if (down === 3) return "3rd";
  return `${down}th`;
}

/** How far the team with the ball is from the line it is attacking. */
export function toGoal(situation: Situation, possession: TeamRef): number {
  return possession === "THEIRS" ? situation.yardLine : GOAL_LINE - situation.yardLine;
}

/** True when the goal line is closer than the line to gain. */
export function isGoalToGo(situation: Situation, possession: TeamRef): boolean {
  return situation.distance >= toGoal(situation, possession);
}

/** "3rd & 8", or "3rd & Goal" inside the goal-to-go situation. */
export function downAndDistanceLabel(situation: Situation, possession: TeamRef = "OURS"): string {
  const distance = isGoalToGo(situation, possession) ? "Goal" : situation.distance;
  return `${ordinal(situation.down)} & ${distance}`;
}

/** "1st & 10 · Own 25", or "Their 3rd & 4 · Opp 12". */
export function chainsLabel(situation: Situation, possession: TeamRef): string {
  const stem = `${downAndDistanceLabel(situation, possession)} · ${yardLineLabel(situation.yardLine)}`;
  return possession === "THEIRS" ? `Their ${stem}` : stem;
}

// -------------------------------------------------------------------------- the rules

/**
 * The situation the next snap starts in after gaining `yards`.
 *
 * Null when the possession is over — the ball crossed the goal line it was attacking, or a
 * fourth down came up short. Ported from `GameSituation.advancedBy`. Their offense runs the
 * other way down the same field, so their gain subtracts from the yard line rather than
 * adding to it, and everything else is symmetric.
 */
export function advancedBy(
  situation: Situation,
  yards: number,
  possession: TeamRef,
): Situation | null {
  const advance = possession === "THEIRS" ? -1 : 1;
  const yardLine = situation.yardLine + yards * advance;

  // Off either end is a score or a safety. Both end the possession, and both leave what
  // happens next to a kickoff nobody records.
  if (yardLine >= GOAL_LINE || yardLine <= 0) return null;

  const next = { ...situation, yardLine };
  if (yards >= situation.distance) {
    return { down: 1, distance: Math.min(FIRST_DOWN_DISTANCE, toGoal(next, possession)), yardLine };
  }
  if (situation.down >= 4) return null;
  return { down: situation.down + 1, distance: situation.distance - yards, yardLine };
}

/** Yardage is meaningless on an incomplete pass, so it is forced to zero. */
export function effectiveYards(event: SnapEvent): number {
  return event.kind === "INCOMPLETE_PASS" ? 0 : event.yards;
}

/**
 * Whether a play did its job: half the distance on first down, 70% on second, all of it on
 * third and fourth. Ported from `AnalyticsPolicy.isSuccess`.
 */
export function isSuccess(situation: Situation, yards: number, kind: ResultKind): boolean {
  if (kind === "TOUCHDOWN") return true;
  if (situation.distance <= 0) return yards > 0;
  const required = ({ 1: 50, 2: 70, 3: 100, 4: 100 } as Record<number, number>)[situation.down] ?? 100;
  // Integer comparison, so no rounding decision creeps into the definition.
  return yards * 100 >= situation.distance * required;
}

/** Ported from `AnalyticsPolicy`: a run of 12 is explosive, a completion of 16. */
export function isExplosive(executedAs: Category | null, yards: number): boolean {
  if (executedAs === "RUN") return yards >= 12;
  if (executedAs === "PASS") return yards >= 16;
  return false;
}

export type SampleTier = "Trending" | "Emerging" | "Established";

/** Ported from `AnalyticsPolicy.tierFor`: 5 attempts established, 3 emerging, below that trending. */
export function tierFor(attempts: number): SampleTier {
  if (attempts >= 5) return "Established";
  if (attempts >= 3) return "Emerging";
  return "Trending";
}

// ------------------------------------------------------------------- the result draft

export const RESULT_KIND_LABELS: Record<ResultKind, string> = {
  PLAY: "Play",
  BROKEN: "Broken",
  TOUCHDOWN: "Touchdown",
  INCOMPLETE_PASS: "Incomplete",
  TURNOVER: "Turnover",
  SACK: "Sack",
  PENALTY: "Penalty",
};

/**
 * The outcome chips offered, given what run-or-pass says. Ported from `resultKindsFor`.
 *
 * Before the category is answered every outcome shows, because two of them *are* the
 * answer: nobody is sacked on a handoff and nothing falls incomplete on one either, so
 * tapping Sack or Incomplete settles run-or-pass at the same time.
 */
export function resultKindsFor(executedAs: Category | null): ResultKind[] {
  if (executedAs === "RUN") return ["BROKEN", "TOUCHDOWN", "TURNOVER", "PENALTY"];
  if (executedAs === "PASS")
    return ["INCOMPLETE_PASS", "SACK", "BROKEN", "TOUCHDOWN", "TURNOVER", "PENALTY"];
  return ["INCOMPLETE_PASS", "SACK", "BROKEN", "TOUCHDOWN", "TURNOVER", "PENALTY"];
}

/** Run or pass, when the outcome can only have happened on one of them. */
export function impliedCategory(kind: ResultKind): Category | null {
  if (kind === "SACK" || kind === "INCOMPLETE_PASS") return "PASS";
  // A broken play is a rush by rule: nobody blocked a designed hole, and the yards the
  // scramble gained are rushing yards.
  if (kind === "BROKEN") return "RUN";
  return null;
}

export type Draft = {
  executedAs: Category | null;
  kind: ResultKind;
  gap: Gap | null;
  location: Location | null;
  penalty: Penalty | null;
  turnoverType: TurnoverType | null;
  returnedForTouchdown: boolean;
  /** Null while the spot has not been moved, which saves as a no-gain. */
  yards: number | null;
  /** True while the hole is still the one the play was designed for. */
  gapWasAssumed: boolean;
};

/**
 * Enough entered to be worth saving. Ported from `ResultDraft.canSave`.
 *
 * A branch, not a conjunction: a broken play is asked nothing about where it went, because
 * nobody followed the design and there is no side to record and no hole either.
 *
 * There is deliberately no yardage clause: an untouched spot parks on the snap, which says
 * the ball ended where it started, and demanding a drag-away-and-back to record an ordinary
 * stuffed run would be entry for entry's sake.
 */
export function canSave(draft: Draft, isOffense: boolean): boolean {
  if (draft.kind === "PENALTY") return draft.penalty !== null;
  if (draft.executedAs === null) return false;
  if (draft.kind === "TURNOVER" && draft.turnoverType === null) return false;
  if (draft.kind === "BROKEN") return true;
  // Our own carry owes its hole before the details save; theirs owes a third of the field,
  // because nobody can call a gap on somebody else's front from a sideline.
  if (draft.executedAs === "RUN") {
    return isOffense ? draft.gap !== null : draft.location !== null;
  }
  if (draft.kind === "SACK") return true;
  return draft.location !== null;
}

// ------------------------------------------------------------------------- derivation

export type QuickStatSplit = { plays: number; yards: number };

export type RunSplits = {
  total: QuickStatSplit;
  left: QuickStatSplit;
  middle: QuickStatSplit;
  right: QuickStatSplit;
  broken: QuickStatSplit;
};

function emptySplit(): QuickStatSplit {
  return { plays: 0, yards: 0 };
}

function emptyRunSplits(): RunSplits {
  return {
    total: emptySplit(),
    left: emptySplit(),
    middle: emptySplit(),
    right: emptySplit(),
    broken: emptySplit(),
  };
}

export type QuickStats = {
  offensivePlays: QuickStatSplit;
  defensivePlays: QuickStatSplit;
  penalties: QuickStatSplit;
  ourRun: RunSplits;
  ourPass: QuickStatSplit;
  yardsPerPlay: number | null;
  successRate: number | null;
  playsJudged: number;
  firstDowns: number;
  turnovers: number;
  explosivePlays: number;
  negativePlays: number;
  theirRun: RunSplits;
  theirPass: QuickStatSplit;
  yardsPerPlayAllowed: number | null;
  stops: number;
  takeaways: number;
  explosiveAllowed: number;
  tdsAllowed: number;
};

export type HoleRow = { gap: Gap; hole: number; carries: number; yards: number; average: number | null };
export type SideRow = {
  side: Location;
  label: string;
  carries: number;
  yards: number;
  successes: number;
  average: number | null;
};

export type Insight = {
  title: string;
  subject: string;
  metric: string;
  detail: string;
  tier: SampleTier;
};

export type CallShare = { id: string; label: string; calls: number; percent: number };

export type Analytics = {
  hasPlays: boolean;
  insights: Insight[];
  holes: HoleRow[];
  sides: SideRow[];
  callShares: CallShare[];
  runShare: number;
  passShare: number;
  /** Best of `holes`, used to shade the diagram relative to it. */
  bestHoleAverage: number | null;
  bestSideAverage: number | null;
};

export type LogRow = {
  event: SnapEvent;
  situation: Situation;
  possession: TeamRef;
  yards: number;
  success: boolean;
};

export type Live = {
  situation: Situation;
  possession: TeamRef;
  quarter: number;
  quarterLabel: string;
  us: number;
  them: number;
  ourTimeouts: number;
  theirTimeouts: number;
  /** Set while a touchdown is owed its try; the game bar says so and nothing else records. */
  tryOwed: TeamRef | null;
  /** What the game bar's status line reads, before " · waiting on the result" is appended. */
  statusLine: string;
};

export type Derived = {
  live: Live;
  rows: LogRow[];
  quickStats: QuickStats;
  offense: Analytics;
  defense: Analytics;
  /** Our own offensive formations, by how often each has been called. */
  formationCalls: Map<string, number>;
  /** Our defensive fronts, the same way. */
  defenseFormationCalls: Map<string, number>;
  playCalls: Map<string, number>;
  playAverages: Map<string, { attempts: number; yards: number }>;
};

const FRESH: Situation = { down: 1, distance: FIRST_DOWN_DISTANCE, yardLine: TOUCHBACK };

function quarterLabel(quarter: number): string {
  if (quarter <= 4) return `Q${quarter}`;
  return quarter === 5 ? "OT" : `OT${quarter - 4}`;
}

/** The receiving team takes over on their own 25, expressed in our frame. */
function kickoffTo(receiver: TeamRef): Situation {
  return {
    down: 1,
    distance: FIRST_DOWN_DISTANCE,
    yardLine: receiver === "OURS" ? TOUCHBACK : GOAL_LINE - TOUCHBACK,
  };
}

function addTo(split: QuickStatSplit, yards: number) {
  split.plays += 1;
  split.yards += yards;
}

/**
 * Which bin a recorded run falls into on the Quick Stats panel.
 *
 * Ours is placed by hole and read back as a side; theirs is placed as a side already. A
 * broken play is neither: nobody followed the design, so it gets its own line rather than
 * being filed under a hole that was not hit.
 */
function runBin(event: SnapEvent): keyof Omit<RunSplits, "total"> {
  if (event.kind === "BROKEN") return "broken";
  const side = event.gap ? gapInfo(event.gap).side : event.location;
  if (side === "LEFT") return "left";
  if (side === "RIGHT") return "right";
  return "middle";
}

/**
 * Replay the whole log and hand back everything the screen shows.
 *
 * One pass produces the live situation, the log read-back, Quick Stats and both analytics
 * screens, so none of them can disagree about what happened. Nothing is accumulated between
 * calls — delete an entry and the next call re-derives the game without it, which is exactly
 * what the app does with a corrected event.
 */
export function derive(events: GameEvent[]): Derived {
  let situation: Situation = { ...FRESH };
  let possession: TeamRef = "OURS";
  let quarter = 1;
  let us = 0;
  let them = 0;
  let ourTimeouts = TIMEOUTS_PER_HALF;
  let theirTimeouts = TIMEOUTS_PER_HALF;
  let tryOwed: TeamRef | null = null;

  const rows: LogRow[] = [];
  const stats: QuickStats = {
    offensivePlays: emptySplit(),
    defensivePlays: emptySplit(),
    penalties: emptySplit(),
    ourRun: emptyRunSplits(),
    ourPass: emptySplit(),
    yardsPerPlay: null,
    successRate: null,
    playsJudged: 0,
    firstDowns: 0,
    turnovers: 0,
    explosivePlays: 0,
    negativePlays: 0,
    theirRun: emptyRunSplits(),
    theirPass: emptySplit(),
    yardsPerPlayAllowed: null,
    stops: 0,
    takeaways: 0,
    explosiveAllowed: 0,
    tdsAllowed: 0,
  };

  let successes = 0;
  const formationCalls = new Map<string, number>();
  const playCalls = new Map<string, number>();
  const byPlay = new Map<string, { label: string; formation: string; attempts: number; yards: number; successes: number }>();
  const byFormation = new Map<string, { plays: number; yards: number; successes: number }>();
  const ourHoles = new Map<Gap, { carries: number; yards: number }>();
  const ourSides = new Map<Location, { carries: number; yards: number; successes: number }>();
  const theirSides = new Map<Location, { carries: number; yards: number; successes: number }>();
  const theirPassSides = new Map<Location, { throws: number; yards: number }>();
  const theirFormationCalls = new Map<string, number>();
  const theirByPlay = new Map<string, { label: string; attempts: number; yards: number }>();

  for (const event of events) {
    switch (event.t) {
      case "QUARTER":
        quarter += 1;
        continue;
      case "TIMEOUT":
        if (event.ours) ourTimeouts = Math.max(0, ourTimeouts - 1);
        else theirTimeouts = Math.max(0, theirTimeouts - 1);
        continue;
      case "CHAINS":
        situation = { down: event.down, distance: event.distance, yardLine: event.yardLine };
        continue;
      case "SCORE":
        // The scoreboard is set, not adjusted: scores recorded from here add on top of it,
        // and the plays already in the log keep their story.
        us = event.us;
        them = event.them;
        continue;
      case "POSSESSION":
        possession = event.possession;
        continue;
      case "TRY": {
        const points = event.good ? (event.kind === "EXTRA_POINT" ? 1 : 2) : 0;
        if (event.ours) us += points;
        else them += points;
        tryOwed = null;
        situation = kickoffTo(event.ours ? "THEIRS" : "OURS");
        possession = event.ours ? "THEIRS" : "OURS";
        continue;
      }
      case "SPECIAL": {
        if (event.unit === "FIELD_GOAL") {
          if (event.good) {
            if (event.ours) us += 3;
            else them += 3;
            possession = event.ours ? "THEIRS" : "OURS";
            situation = kickoffTo(possession);
          } else {
            // A miss is a turnover on downs at the spot: the other side takes over where
            // the kick was tried from.
            possession = event.ours ? "THEIRS" : "OURS";
            situation = { down: 1, distance: FIRST_DOWN_DISTANCE, yardLine: situation.yardLine };
          }
        } else {
          possession = event.ours ? "THEIRS" : "OURS";
          const spot = event.endYardLine ?? situation.yardLine;
          situation = {
            down: 1,
            distance: Math.min(
              FIRST_DOWN_DISTANCE,
              toGoal({ ...situation, yardLine: spot }, possession),
            ),
            yardLine: spot,
          };
        }
        continue;
      }
      case "SNAP":
        break;
    }

    // ------------------------------------------------------------------ a recorded snap
    const snap = event;
    const ours = snap.side === "OFFENSE";
    const calledIn = situation;
    const yards = effectiveYards(snap);
    const success = isSuccess(calledIn, yards, snap.kind);

    if (snap.kind === "PENALTY" && snap.penalty) {
      // An accepted flag walks the ball and replays the down. Declined, nothing moves and
      // the snap is only a note in the totals.
      const flag = snap.penalty;
      addTo(stats.penalties, flag.accepted ? flag.yards : 0);
      rows.push({ event: snap, situation: calledIn, possession, yards: 0, success: false });
      if (flag.accepted) {
        // Against us the ball goes back toward our own goal; against them it comes forward.
        const advance = flag.onUs ? -1 : 1;
        const yardLine = Math.min(
          GOAL_LINE - 1,
          Math.max(1, calledIn.yardLine + flag.yards * advance),
        );
        situation = { ...calledIn, yardLine };
      }
      continue;
    }

    if (ours) {
      addTo(stats.offensivePlays, yards);
      if (snap.executedAs === "RUN" || snap.kind === "BROKEN") {
        addTo(stats.ourRun.total, yards);
        addTo(stats.ourRun[runBin(snap)], yards);
        if (snap.gap && snap.kind !== "BROKEN") {
          const hole = ourHoles.get(snap.gap) ?? { carries: 0, yards: 0 };
          hole.carries += 1;
          hole.yards += yards;
          ourHoles.set(snap.gap, hole);
          const side = gapInfo(snap.gap).side;
          const bucket = ourSides.get(side) ?? { carries: 0, yards: 0, successes: 0 };
          bucket.carries += 1;
          bucket.yards += yards;
          if (success) bucket.successes += 1;
          ourSides.set(side, bucket);
        }
      } else {
        addTo(stats.ourPass, yards);
      }
      stats.playsJudged += 1;
      if (success) successes += 1;
      if (isExplosive(snap.executedAs, yards)) stats.explosivePlays += 1;
      if (yards < 0) stats.negativePlays += 1;
      if (snap.kind === "TURNOVER") stats.turnovers += 1;

      formationCalls.set(snap.formationLabel, (formationCalls.get(snap.formationLabel) ?? 0) + 1);
      playCalls.set(snap.playId, (playCalls.get(snap.playId) ?? 0) + 1);
      const tally = byPlay.get(snap.playId) ?? {
        label: snap.playLabel,
        formation: snap.formationLabel,
        attempts: 0,
        yards: 0,
        successes: 0,
      };
      tally.attempts += 1;
      tally.yards += yards;
      if (success) tally.successes += 1;
      byPlay.set(snap.playId, tally);
      const form = byFormation.get(snap.formationLabel) ?? { plays: 0, yards: 0, successes: 0 };
      form.plays += 1;
      form.yards += yards;
      if (success) form.successes += 1;
      byFormation.set(snap.formationLabel, form);
    } else {
      addTo(stats.defensivePlays, yards);
      if (snap.executedAs === "RUN" || snap.kind === "BROKEN") {
        addTo(stats.theirRun.total, yards);
        addTo(stats.theirRun[runBin(snap)], yards);
        if (snap.location && snap.kind !== "BROKEN") {
          const bucket = theirSides.get(snap.location) ?? { carries: 0, yards: 0, successes: 0 };
          bucket.carries += 1;
          bucket.yards += yards;
          if (success) bucket.successes += 1;
          theirSides.set(snap.location, bucket);
        }
      } else {
        addTo(stats.theirPass, yards);
        if (snap.location) {
          const bucket = theirPassSides.get(snap.location) ?? { throws: 0, yards: 0 };
          bucket.throws += 1;
          bucket.yards += yards;
          theirPassSides.set(snap.location, bucket);
        }
      }
      // A sack or a snap that gained no yards counts as a stop.
      if (yards <= 0) stats.stops += 1;
      if (snap.kind === "TURNOVER") stats.takeaways += 1;
      if (isExplosive(snap.executedAs, yards)) stats.explosiveAllowed += 1;
      if (snap.kind === "TOUCHDOWN") stats.tdsAllowed += 1;
      theirFormationCalls.set(
        snap.formationLabel,
        (theirFormationCalls.get(snap.formationLabel) ?? 0) + 1,
      );
      const tally = theirByPlay.get(snap.playId) ?? { label: snap.playLabel, attempts: 0, yards: 0 };
      tally.attempts += 1;
      tally.yards += yards;
      theirByPlay.set(snap.playId, tally);
    }

    rows.push({ event: snap, situation: calledIn, possession, yards, success });

    // ------------------------------------------------------------- what happens next
    if (snap.kind === "TOUCHDOWN") {
      if (possession === "OURS") us += 6;
      else them += 6;
      tryOwed = possession;
      // The situation stays where it is until the try is answered; the bar says so.
      continue;
    }
    if (snap.kind === "TURNOVER") {
      const takingSide: TeamRef = possession === "OURS" ? "THEIRS" : "OURS";
      if (snap.returnedForTouchdown) {
        // Six for whoever took it away, and the try it owes. There is no takeover spot to
        // file, because the ball finished in an end zone rather than on the field.
        if (takingSide === "OURS") us += 6;
        else them += 6;
        possession = takingSide;
        tryOwed = takingSide;
        continue;
      }
      possession = takingSide;
      situation = {
        down: 1,
        distance: Math.min(
          FIRST_DOWN_DISTANCE,
          toGoal({ ...calledIn, yardLine: calledIn.yardLine }, possession),
        ),
        yardLine: calledIn.yardLine,
      };
      continue;
    }

    const next = advancedBy(calledIn, yards, possession);
    if (next === null) {
      // Fourth down came up short. The other side takes over at the spot.
      const advance = possession === "THEIRS" ? -1 : 1;
      const yardLine = Math.min(
        GOAL_LINE - 1,
        Math.max(1, calledIn.yardLine + yards * advance),
      );
      possession = possession === "OURS" ? "THEIRS" : "OURS";
      situation = {
        down: 1,
        distance: Math.min(FIRST_DOWN_DISTANCE, toGoal({ ...calledIn, yardLine }, possession)),
        yardLine,
      };
      continue;
    }
    // A first down is the replay resetting the down, never a separate thing anybody enters.
    if (next.down === 1 && possession === "OURS") stats.firstDowns += 1;
    situation = next;
  }

  stats.yardsPerPlay =
    stats.offensivePlays.plays > 0 ? stats.offensivePlays.yards / stats.offensivePlays.plays : null;
  stats.yardsPerPlayAllowed =
    stats.defensivePlays.plays > 0 ? stats.defensivePlays.yards / stats.defensivePlays.plays : null;
  stats.successRate = stats.playsJudged > 0 ? successes / stats.playsJudged : null;

  // ------------------------------------------------------------------------ analytics
  const holes: HoleRow[] = GAPS.map((gap) => {
    const tally = ourHoles.get(gap.id);
    return {
      gap: gap.id,
      hole: gap.hole,
      carries: tally?.carries ?? 0,
      yards: tally?.yards ?? 0,
      average: tally && tally.carries > 0 ? tally.yards / tally.carries : null,
    };
  });

  const sideRows = (
    source: Map<Location, { carries: number; yards: number; successes: number }>,
  ): SideRow[] =>
    (["LEFT", "MIDDLE", "RIGHT"] as Location[]).map((side) => {
      const tally = source.get(side);
      return {
        side,
        label: side === "LEFT" ? "Left" : side === "MIDDLE" ? "Middle" : "Right",
        carries: tally?.carries ?? 0,
        yards: tally?.yards ?? 0,
        successes: tally?.successes ?? 0,
        average: tally && tally.carries > 0 ? tally.yards / tally.carries : null,
      };
    });

  const ourSideRows = sideRows(ourSides);
  const theirSideRows = sideRows(theirSides);

  const oneDecimal = (value: number) => value.toFixed(1);
  const percent = (value: number) => `${Math.round(value * 100)}%`;
  const carryWord = (count: number) => (count === 1 ? "carry" : "carries");
  const playWord = (count: number) => (count === 1 ? "play" : "plays");

  const offenseInsights: Insight[] = [];
  let bestPlay: { id: string; label: string; attempts: number; yards: number; successes: number } | null = null;
  for (const [id, tally] of byPlay) {
    // Ties go to the play that has done it more often, so a single long run cannot outrank
    // something the offense has actually established.
    const average = tally.yards / tally.attempts;
    const bestAverage = bestPlay ? bestPlay.yards / bestPlay.attempts : -Infinity;
    if (average > bestAverage || (average === bestAverage && tally.attempts > (bestPlay?.attempts ?? 0))) {
      bestPlay = { id, ...tally };
    }
  }
  if (bestPlay) {
    offenseInsights.push({
      title: "Best play",
      subject: bestPlay.label,
      metric: `${oneDecimal(bestPlay.yards / bestPlay.attempts)} yds/play`,
      detail: `${bestPlay.attempts} ${bestPlay.attempts === 1 ? "attempt" : "attempts"} · ${percent(
        bestPlay.successes / bestPlay.attempts,
      )} success`,
      tier: tierFor(bestPlay.attempts),
    });
  }
  let bestFormation: { label: string; plays: number; yards: number; successes: number } | null = null;
  for (const [label, tally] of byFormation) {
    const average = tally.yards / tally.plays;
    const bestAverage = bestFormation ? bestFormation.yards / bestFormation.plays : -Infinity;
    if (average > bestAverage || (average === bestAverage && tally.plays > (bestFormation?.plays ?? 0))) {
      bestFormation = { label, ...tally };
    }
  }
  if (bestFormation) {
    offenseInsights.push({
      title: "Best formation",
      subject: bestFormation.label,
      metric: `${oneDecimal(bestFormation.yards / bestFormation.plays)} yds/play`,
      detail: `${bestFormation.plays} ${playWord(bestFormation.plays)} · ${percent(
        bestFormation.successes / bestFormation.plays,
      )} success`,
      tier: tierFor(bestFormation.plays),
    });
  }
  const bestSide = ourSideRows
    .filter((row) => row.carries > 0)
    .sort((a, b) => b.average! - a.average! || b.carries - a.carries)[0];
  if (bestSide) {
    offenseInsights.push({
      title: "Best attack area",
      subject: `${bestSide.label} side`,
      metric: `${oneDecimal(bestSide.average!)} yds/carry`,
      detail: `${bestSide.carries} ${carryWord(bestSide.carries)} · ${percent(
        bestSide.successes / bestSide.carries,
      )} success`,
      tier: tierFor(bestSide.carries),
    });
  }

  const defenseInsights: Insight[] = [];
  const theirBestSide = theirSideRows
    .filter((row) => row.carries > 0)
    .sort((a, b) => b.average! - a.average! || b.carries - a.carries)[0];
  if (theirBestSide) {
    defenseInsights.push({
      title: "They run at",
      subject: `${theirBestSide.label} side`,
      metric: `${oneDecimal(theirBestSide.average!)} yds/carry`,
      detail: `${theirBestSide.carries} ${carryWord(theirBestSide.carries)} that way`,
      tier: tierFor(theirBestSide.carries),
    });
  }
  let theirBestPlay: { label: string; attempts: number; yards: number } | null = null;
  for (const tally of theirByPlay.values()) {
    const average = tally.yards / tally.attempts;
    const bestAverage = theirBestPlay ? theirBestPlay.yards / theirBestPlay.attempts : -Infinity;
    if (average > bestAverage) theirBestPlay = tally;
  }
  if (theirBestPlay) {
    defenseInsights.push({
      title: "Hurting us most",
      subject: theirBestPlay.label,
      metric: `${oneDecimal(theirBestPlay.yards / theirBestPlay.attempts)} yds/play`,
      detail: `${theirBestPlay.attempts} ${playWord(theirBestPlay.attempts)} against this front`,
      tier: tierFor(theirBestPlay.attempts),
    });
  }

  const shares = (calls: Map<string, number>): CallShare[] => {
    const total = [...calls.values()].reduce((sum, count) => sum + count, 0);
    return [...calls.entries()].map(([label, count]) => ({
      id: label,
      label,
      calls: count,
      percent: total > 0 ? Math.round((count / total) * 100) : 0,
    }));
  };

  const ourRunPlays = stats.ourRun.total.plays;
  const ourPassPlays = stats.ourPass.plays;
  const ourTotal = ourRunPlays + ourPassPlays;
  const theirTotal = stats.theirRun.total.plays + stats.theirPass.plays;

  const best = (values: (number | null)[]) => {
    const real = values.filter((value): value is number => value !== null);
    return real.length > 0 ? Math.max(...real) : null;
  };

  const offense: Analytics = {
    hasPlays: stats.offensivePlays.plays > 0,
    insights: offenseInsights,
    holes,
    sides: ourSideRows,
    callShares: shares(formationCalls),
    runShare: ourTotal > 0 ? Math.round((ourRunPlays / ourTotal) * 100) : 0,
    passShare: ourTotal > 0 ? 100 - Math.round((ourRunPlays / ourTotal) * 100) : 0,
    bestHoleAverage: best(holes.map((hole) => hole.average)),
    bestSideAverage: best(ourSideRows.map((row) => row.average)),
  };

  const defense: Analytics = {
    hasPlays: stats.defensivePlays.plays > 0,
    insights: defenseInsights,
    holes: [],
    sides: theirSideRows,
    callShares: shares(theirFormationCalls),
    runShare: theirTotal > 0 ? Math.round((stats.theirRun.total.plays / theirTotal) * 100) : 0,
    passShare:
      theirTotal > 0 ? 100 - Math.round((stats.theirRun.total.plays / theirTotal) * 100) : 0,
    bestHoleAverage: null,
    bestSideAverage: best(theirSideRows.map((row) => row.average)),
  };

  const playAverages = new Map<string, { attempts: number; yards: number }>();
  for (const [id, tally] of byPlay) {
    playAverages.set(id, { attempts: tally.attempts, yards: tally.yards });
  }

  return {
    live: {
      situation,
      possession,
      quarter,
      quarterLabel: quarterLabel(quarter),
      us,
      them,
      ourTimeouts,
      theirTimeouts,
      tryOwed,
      statusLine: tryOwed
        ? tryOwed === "OURS"
          ? "Touchdown · the try is owed"
          : "Their touchdown · the try is owed"
        : chainsLabel(situation, possession),
    },
    rows,
    quickStats: stats,
    offense,
    defense,
    formationCalls,
    defenseFormationCalls: theirFormationCalls,
    playCalls,
    playAverages,
  };
}

// ------------------------------------------------------------------- suggest a play

export type Suggestion = {
  playId: string;
  formationLabel: string;
  playLabel: string;
  calls: number;
  average: number | null;
  tier: SampleTier;
};

export type SuggestionSet = {
  /** The honest lead sentence: what these numbers actually are. */
  lead: string;
  suggestions: Suggestion[];
};

/**
 * What the app offers when a coach asks for help, and — more importantly — what it refuses
 * to pretend.
 *
 * With nothing called twice there is nothing to compare, and the app says so rather than
 * ranking single attempts against each other. Ported from `PlaySuggestions`.
 */
export function suggestPlays(
  derived: Derived,
  catalogue: { playId: string; playLabel: string; formationLabel: string }[],
): SuggestionSet {
  const scored: Suggestion[] = catalogue.map((play) => {
    const tally = derived.playAverages.get(play.playId);
    const calls = derived.playCalls.get(play.playId) ?? 0;
    return {
      playId: play.playId,
      playLabel: play.playLabel,
      formationLabel: play.formationLabel,
      calls,
      average: tally && tally.attempts > 0 ? tally.yards / tally.attempts : null,
      tier: tierFor(calls),
    };
  });

  const comparable = scored.filter((play) => play.calls >= 2);
  if (comparable.length === 0) {
    return {
      lead:
        "No play has been called twice yet, so there is nothing to compare. These are your " +
        "most-used plays — most-used, not best.",
      suggestions: scored
        .filter((play) => play.calls > 0)
        .sort((a, b) => b.calls - a.calls)
        .slice(0, 3),
    };
  }
  return {
    lead: "Ranked by yards a play, with the sample each one rests on.",
    suggestions: comparable.sort((a, b) => (b.average ?? 0) - (a.average ?? 0)).slice(0, 3),
  };
}
