/**
 * The football arithmetic behind the playable demo on the home page.
 *
 * This is a second implementation of rules that already exist in Kotlin — `GameSituation`,
 * `ResultDraft` and `AnalyticsPolicy` in the app's `core` module. It is duplicated rather
 * than shared because the app has no web build and is not getting one, and a marketing demo
 * is not worth a cross-language build step. The cost is real and worth stating plainly: a
 * rule that changes in the app has to be changed here too, or the website starts quietly
 * telling visitors something the product no longer does. Every rule lives in this one file
 * and keeps the Kotlin's names so the two can be read side by side.
 *
 * The demo is our own offense and nothing else, so the advance sign the app carries for the
 * opponent coming down our frame is always +1 here and never appears.
 */

export const GOAL_LINE = 100;
export const MIDFIELD = 50;
export const FIRST_DOWN_DISTANCE = 10;

/**
 * Where a drive starts in the demo.
 *
 * The app records a drive start and never the kickoff that produced it, so this is a
 * starting spot rather than a returned kick.
 */
export const DRIVE_START = 25;

export type Category = "RUN" | "PASS";

/** The outcomes that say something the yardage cannot. Mirrors `ResultKind`. */
export type Outcome = "PLAY" | "TOUCHDOWN" | "INCOMPLETE_PASS" | "TURNOVER" | "SACK";

export type TurnoverType = "INTERCEPTION" | "FUMBLE";

/** Which third of the field a throw went to. Mirrors `RunLocation`. */
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
export const GAPS: readonly { id: Gap; hole: number; letter: string; side: Location }[] = [
  { id: "LEFT_D", hole: 7, letter: "D", side: "LEFT" },
  { id: "LEFT_C", hole: 5, letter: "C", side: "LEFT" },
  { id: "LEFT_B", hole: 3, letter: "B", side: "LEFT" },
  { id: "LEFT_A", hole: 1, letter: "A", side: "MIDDLE" },
  { id: "RIGHT_A", hole: 2, letter: "A", side: "MIDDLE" },
  { id: "RIGHT_B", hole: 4, letter: "B", side: "RIGHT" },
  { id: "RIGHT_C", hole: 6, letter: "C", side: "RIGHT" },
  { id: "RIGHT_D", hole: 8, letter: "D", side: "RIGHT" },
];

export function gapInfo(gap: Gap) {
  // Non-null by construction: GAPS covers every member of the union.
  return GAPS.find((entry) => entry.id === gap)!;
}

export type Situation = {
  down: number;
  distance: number;
  yardLine: number;
};

/**
 * One recorded snap.
 *
 * It carries no down, distance or field position, and that absence is the whole point: the
 * situation a play happened in is derived by replaying the log, so deleting an earlier entry
 * re-files every entry after it instead of leaving them describing a game that no longer
 * happened.
 */
export type PlayEvent = {
  id: number;
  playId: string;
  playLabel: string;
  formationLabel: string;
  category: Category;
  outcome: Outcome;
  gap: Gap | null;
  location: Location | null;
  turnoverType: TurnoverType | null;
  /** Where the ball ended, as a signed distance from the snap. */
  yards: number;
};

/** "Own 25", "Midfield", "Opp 18". */
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

/** True when the goal line is closer than the line to gain. */
export function isGoalToGo(situation: Situation): boolean {
  return situation.yardLine + situation.distance >= GOAL_LINE;
}

/** "3rd & 8", or "3rd & Goal" inside the goal-to-go situation. */
export function downAndDistanceLabel(situation: Situation): string {
  return `${ordinal(situation.down)} & ${isGoalToGo(situation) ? "Goal" : situation.distance}`;
}

/**
 * The situation the next snap starts in after gaining `yards`.
 *
 * Null when the possession is over — the ball crossed a goal line, or a fourth down came up
 * short. Ported from `GameSituation.advancedBy`.
 */
export function advancedBy(situation: Situation, yards: number): Situation | null {
  const newYardLine = situation.yardLine + yards;
  // Off either end is a score or a safety. Both end the possession, and both leave what
  // happens next to a kickoff nobody records.
  if (newYardLine >= GOAL_LINE || newYardLine <= 0) return null;

  if (yards >= situation.distance) {
    return {
      down: 1,
      distance: Math.min(FIRST_DOWN_DISTANCE, GOAL_LINE - newYardLine),
      yardLine: newYardLine,
    };
  }
  if (situation.down >= 4) return null;
  return {
    down: situation.down + 1,
    distance: situation.distance - yards,
    yardLine: newYardLine,
  };
}

/** Yardage is meaningless on an incomplete pass, so it is forced to zero. */
export function effectiveYards(event: PlayEvent): number {
  return event.outcome === "INCOMPLETE_PASS" ? 0 : event.yards;
}

/**
 * Whether a play did its job: half the distance on first down, 70% on second, all of it on
 * third and fourth. Ported from `AnalyticsPolicy.isSuccess`.
 */
export function isSuccess(situation: Situation, yards: number, outcome: Outcome): boolean {
  if (outcome === "TOUCHDOWN") return true;
  if (situation.distance <= 0) return yards > 0;
  const required = { 1: 50, 2: 70, 3: 100, 4: 100 }[situation.down] ?? 100;
  // Integer comparison, so no rounding decision creeps into the definition.
  return yards * 100 >= situation.distance * required;
}

export type SampleTier = "Trending" | "Emerging" | "Established";

/** Ported from `AnalyticsPolicy.tierFor`: 5 attempts established, 3 emerging, below that trending. */
export function tierFor(attempts: number): SampleTier {
  if (attempts >= 5) return "Established";
  if (attempts >= 3) return "Emerging";
  return "Trending";
}

export type DriveEndReason = "touchdown" | "turnover" | "downs";

/** One entry as the log reads it back, in the situation the replay puts it in. */
export type LogRow = {
  event: PlayEvent;
  situation: Situation;
  yards: number;
  driveNumber: number;
  endedDrive: DriveEndReason | null;
  success: boolean;
};

export type Live = {
  situation: Situation;
  driveNumber: number;
  driveStart: number;
  drivePlays: number;
  driveYards: number;
  driveFirstDowns: number;
  ourScore: number;
  /** Set only when the most recent entry closed a drive, so the screen can say so. */
  justEnded: DriveEndReason | null;
};

export type Split = { plays: number; yards: number };

export type HoleRow = {
  gap: Gap;
  hole: number;
  letter: string;
  carries: number;
  yards: number;
  average: number | null;
};

export type BestPlay = {
  playId: string;
  label: string;
  attempts: number;
  yardsPerPlay: number;
  successRate: number;
  tier: SampleTier;
};

export type Stats = {
  plays: number;
  yards: number;
  run: Split;
  pass: Split;
  gains: number;
  noGain: number;
  losses: number;
  firstDowns: number;
  touchdowns: number;
  turnovers: number;
  completions: number;
  attempts: number;
  yardsPerPlay: number;
  successes: number;
  holes: HoleRow[];
  bestPlay: BestPlay | null;
};

export type Derived = {
  live: Live;
  rows: LogRow[];
  stats: Stats;
};

const FRESH_DRIVE: Situation = {
  down: 1,
  distance: FIRST_DOWN_DISTANCE,
  yardLine: DRIVE_START,
};

/**
 * Replay the whole log and hand back everything the screen shows.
 *
 * One pass produces the live situation, the log read-back and every derived number, so the
 * three cannot disagree about what happened. Nothing here is accumulated between calls —
 * delete an entry and the next call re-derives the game without it, which is exactly what
 * the app does with a corrected event.
 */
export function derive(events: PlayEvent[]): Derived {
  let situation: Situation = { ...FRESH_DRIVE };
  let driveNumber = 1;
  let drivePlays = 0;
  let driveYards = 0;
  let driveFirstDowns = 0;
  let ourScore = 0;
  let justEnded: DriveEndReason | null = null;

  const rows: LogRow[] = [];
  const stats: Stats = {
    plays: 0,
    yards: 0,
    run: { plays: 0, yards: 0 },
    pass: { plays: 0, yards: 0 },
    gains: 0,
    noGain: 0,
    losses: 0,
    firstDowns: 0,
    touchdowns: 0,
    turnovers: 0,
    completions: 0,
    attempts: 0,
    yardsPerPlay: 0,
    successes: 0,
    holes: GAPS.map((gap) => ({
      gap: gap.id,
      hole: gap.hole,
      letter: gap.letter,
      carries: 0,
      yards: 0,
      average: null,
    })),
    bestPlay: null,
  };

  const byPlay = new Map<string, { label: string; attempts: number; yards: number; successes: number }>();

  for (const event of events) {
    const yards = effectiveYards(event);
    const calledIn = situation;
    const success = isSuccess(calledIn, yards, event.outcome);

    stats.plays += 1;
    stats.yards += yards;
    if (success) stats.successes += 1;
    if (yards > 0) stats.gains += 1;
    else if (yards < 0) stats.losses += 1;
    else stats.noGain += 1;

    if (event.category === "RUN") {
      stats.run.plays += 1;
      stats.run.yards += yards;
      if (event.gap) {
        const row = stats.holes.find((hole) => hole.gap === event.gap);
        if (row) {
          row.carries += 1;
          row.yards += yards;
        }
      }
    } else {
      stats.pass.plays += 1;
      stats.pass.yards += yards;
      // A sack is neither a completion nor an attempt: the ball never left his hand, and
      // counting it as an incompletion would put a snap in the denominator of the
      // completion rate that nobody ever threw.
      if (event.outcome !== "SACK") {
        stats.attempts += 1;
        const caught =
          event.outcome !== "INCOMPLETE_PASS" &&
          !(event.outcome === "TURNOVER" && event.turnoverType === "INTERCEPTION");
        if (caught) stats.completions += 1;
      }
    }

    const tally = byPlay.get(event.playId) ?? {
      label: event.playLabel,
      attempts: 0,
      yards: 0,
      successes: 0,
    };
    tally.attempts += 1;
    tally.yards += yards;
    if (success) tally.successes += 1;
    byPlay.set(event.playId, tally);

    drivePlays += 1;
    driveYards += yards;

    let endedDrive: DriveEndReason | null = null;
    let next: Situation | null = null;
    if (event.outcome === "TURNOVER") {
      endedDrive = "turnover";
    } else {
      next = advancedBy(calledIn, yards);
      if (next === null) {
        // The score is read off the spot rather than off the outcome chip, so there is one
        // fact behind it. The chip is what puts the ball on the goal line — the same thing
        // it does in the app — and dragging the thumb there by hand scores identically.
        endedDrive = calledIn.yardLine + yards >= GOAL_LINE ? "touchdown" : "downs";
      }
    }

    rows.push({
      event,
      situation: calledIn,
      yards,
      driveNumber,
      endedDrive,
      success,
    });

    if (endedDrive) {
      if (endedDrive === "touchdown") {
        stats.touchdowns += 1;
        // Six. The app asks for the try as its own entry; the demo does not, so a
        // two-point conversion never shows up in this score.
        ourScore += 6;
      }
      if (endedDrive === "turnover") stats.turnovers += 1;
      justEnded = endedDrive;
      driveNumber += 1;
      drivePlays = 0;
      driveYards = 0;
      driveFirstDowns = 0;
      situation = { ...FRESH_DRIVE };
    } else {
      // A first down is the replay resetting the down, never a separate thing anybody enters.
      if (next && next.down === 1) {
        stats.firstDowns += 1;
        driveFirstDowns += 1;
      }
      justEnded = null;
      situation = next!;
    }
  }

  stats.yardsPerPlay = stats.plays > 0 ? stats.yards / stats.plays : 0;
  for (const hole of stats.holes) {
    hole.average = hole.carries > 0 ? hole.yards / hole.carries : null;
  }

  let best: BestPlay | null = null;
  for (const [playId, tally] of byPlay) {
    const yardsPerPlay = tally.yards / tally.attempts;
    // Ties go to the play that has done it more often, so a single long run cannot
    // outrank something the offense has actually established.
    const better =
      best === null ||
      yardsPerPlay > best.yardsPerPlay ||
      (yardsPerPlay === best.yardsPerPlay && tally.attempts > best.attempts);
    if (better) {
      best = {
        playId,
        label: tally.label,
        attempts: tally.attempts,
        yardsPerPlay,
        successRate: tally.successes / tally.attempts,
        tier: tierFor(tally.attempts),
      };
    }
  }
  stats.bestPlay = best;

  return {
    live: {
      situation,
      driveNumber,
      driveStart: DRIVE_START,
      drivePlays,
      driveYards,
      driveFirstDowns,
      ourScore,
      justEnded,
    },
    rows,
    stats,
  };
}

/**
 * Enough entered to be worth saving. Ported from `ResultDraft.canSave`, minus the penalty
 * clauses — the demo does not record flags.
 *
 * There is deliberately no yardage clause: an untouched spot slider parks on the snap, which
 * says the ball ended where it started, and demanding a drag-away-and-back to record an
 * ordinary stuffed run would be entry for entry's sake.
 */
export function canSave(draft: {
  category: Category | null;
  outcome: Outcome;
  gap: Gap | null;
  turnoverType: TurnoverType | null;
}): boolean {
  if (draft.category === null) return false;
  if (draft.category === "RUN" && draft.gap === null) return false;
  if (draft.outcome === "TURNOVER" && draft.turnoverType === null) return false;
  return true;
}

/** The outcomes offered for how a play was run. Ported from `resultKindsFor`. */
export function outcomesFor(category: Category | null): Outcome[] {
  if (category === "PASS") return ["INCOMPLETE_PASS", "SACK", "TOUCHDOWN", "TURNOVER"];
  // No sack on a carry, and nothing falls incomplete on one either, which leaves the two
  // outcomes that end the drive. Everything else about a run is the yardage.
  if (category === "RUN") return ["TOUCHDOWN", "TURNOVER"];
  return ["INCOMPLETE_PASS", "SACK", "TOUCHDOWN", "TURNOVER"];
}

/** Run or pass, when the outcome can only have happened on one of them. */
export function impliedCategory(outcome: Outcome): Category | null {
  return outcome === "SACK" || outcome === "INCOMPLETE_PASS" ? "PASS" : null;
}

export const OUTCOME_LABELS: Record<Outcome, string> = {
  PLAY: "Play",
  TOUCHDOWN: "Touchdown",
  INCOMPLETE_PASS: "Incomplete",
  TURNOVER: "Turnover",
  SACK: "Sack",
};
