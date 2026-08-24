import assert from "node:assert/strict";
import test from "node:test";

import {
  advancedBy,
  canSave,
  chainsLabel,
  derive,
  downAndDistanceLabel,
  impliedCategory,
  isExplosive,
  isSuccess,
  resultKindsFor,
  suggestPlays,
  tierFor,
  toGoal,
  yardLineLabel,
} from "../app/components/demoFootball.ts";
import { CATALOGUE, OFFENSE, SAMPLE_GAME } from "../app/components/demoPlaybook.ts";

/**
 * The demo re-implements football rules that live in Kotlin in the app. These tests pin the
 * ported arithmetic so the website cannot start telling visitors something the product does
 * not do without a red test.
 */

let nextId = 0;

function snap({
  side = "OFFENSE",
  label = "Blast 24",
  id = "blast-24",
  formation = "I Form",
  executedAs = "RUN",
  kind = "PLAY",
  gap = "RIGHT_B",
  location = null,
  penalty = null,
  turnoverType = null,
  returnedForTouchdown = false,
  yards = 0,
} = {}) {
  nextId += 1;
  return {
    t: "SNAP",
    id: nextId,
    side,
    playId: id,
    playLabel: label,
    formationLabel: formation,
    executedAs,
    kind,
    gap: side === "OFFENSE" && executedAs === "RUN" && kind !== "BROKEN" ? gap : null,
    location,
    penalty,
    turnoverType: kind === 'TURNOVER' ? (turnoverType ?? 'FUMBLE') : null,
    returnedForTouchdown,
    yards,
  };
}

function control(event) {
  nextId += 1;
  return { id: nextId, ...event };
}

test("yard lines read in the Own/Opp convention, whoever has the ball", () => {
  assert.equal(yardLineLabel(25), "Own 25");
  assert.equal(yardLineLabel(50), "Midfield");
  assert.equal(yardLineLabel(82), "Opp 18");
  assert.equal(yardLineLabel(100), "Their goal");
  assert.equal(yardLineLabel(0), "Own goal");
});

test("down and distance says Goal inside the goal-to-go situation, for either offense", () => {
  assert.equal(downAndDistanceLabel({ down: 3, distance: 8, yardLine: 48 }, "OURS"), "3rd & 8");
  assert.equal(downAndDistanceLabel({ down: 1, distance: 10, yardLine: 95 }, "OURS"), "1st & Goal");
  // Theirs runs the other way: on our 6 they are six yards from the goal they are attacking.
  assert.equal(downAndDistanceLabel({ down: 1, distance: 10, yardLine: 6 }, "THEIRS"), "1st & Goal");
  assert.equal(downAndDistanceLabel({ down: 1, distance: 10, yardLine: 94 }, "THEIRS"), "1st & 10");
});

test("their chains are labelled as theirs", () => {
  assert.equal(chainsLabel({ down: 2, distance: 6, yardLine: 41 }, "OURS"), "2nd & 6 · Own 41");
  assert.equal(chainsLabel({ down: 2, distance: 6, yardLine: 41 }, "THEIRS"), "Their 2nd & 6 · Own 41");
});

test("distance to the goal is measured against the line each side attacks", () => {
  assert.equal(toGoal({ down: 1, distance: 10, yardLine: 30 }, "OURS"), 70);
  assert.equal(toGoal({ down: 1, distance: 10, yardLine: 30 }, "THEIRS"), 30);
});

test("the chains advance, reset and run out exactly as the app's do", () => {
  assert.deepEqual(advancedBy({ down: 1, distance: 10, yardLine: 25 }, 6, "OURS"), {
    down: 2,
    distance: 4,
    yardLine: 31,
  });
  assert.deepEqual(advancedBy({ down: 2, distance: 4, yardLine: 31 }, 4, "OURS"), {
    down: 1,
    distance: 10,
    yardLine: 35,
  });
  // Fourth down short ends the possession.
  assert.equal(advancedBy({ down: 4, distance: 2, yardLine: 40 }, 1, "OURS"), null);
  // Crossing the goal line ends it too, whichever way the ball is going.
  assert.equal(advancedBy({ down: 1, distance: 10, yardLine: 95 }, 6, "OURS"), null);
  assert.equal(advancedBy({ down: 1, distance: 10, yardLine: 5 }, 6, "THEIRS"), null);
});

test("their offense runs the other way down the same field", () => {
  assert.deepEqual(advancedBy({ down: 1, distance: 10, yardLine: 70 }, 4, "THEIRS"), {
    down: 2,
    distance: 6,
    yardLine: 66,
  });
});

test("inside the ten, a fresh first down is capped at the goal line", () => {
  assert.deepEqual(advancedBy({ down: 2, distance: 5, yardLine: 88 }, 5, "OURS"), {
    down: 1,
    distance: 7,
    yardLine: 93,
  });
});

test("success is half the distance on first, 70% on second, all of it after", () => {
  assert.equal(isSuccess({ down: 1, distance: 10, yardLine: 25 }, 5, "PLAY"), true);
  assert.equal(isSuccess({ down: 1, distance: 10, yardLine: 25 }, 4, "PLAY"), false);
  assert.equal(isSuccess({ down: 2, distance: 10, yardLine: 25 }, 7, "PLAY"), true);
  assert.equal(isSuccess({ down: 3, distance: 10, yardLine: 25 }, 9, "PLAY"), false);
  // A touchdown is a success whatever the distance was.
  assert.equal(isSuccess({ down: 3, distance: 10, yardLine: 25 }, 0, "TOUCHDOWN"), true);
});

test("explosive is 12 on a run and 16 on a completion", () => {
  assert.equal(isExplosive("RUN", 12), true);
  assert.equal(isExplosive("RUN", 11), false);
  assert.equal(isExplosive("PASS", 16), true);
  assert.equal(isExplosive("PASS", 15), false);
});

test("sample tiers are 5 established, 3 emerging, below that trending", () => {
  assert.equal(tierFor(1), "Trending");
  assert.equal(tierFor(2), "Trending");
  assert.equal(tierFor(3), "Emerging");
  assert.equal(tierFor(4), "Emerging");
  assert.equal(tierFor(5), "Established");
});

test("two outcomes settle run-or-pass by themselves, and a broken play is a rush", () => {
  assert.equal(impliedCategory("SACK"), "PASS");
  assert.equal(impliedCategory("INCOMPLETE_PASS"), "PASS");
  assert.equal(impliedCategory("BROKEN"), "RUN");
  assert.equal(impliedCategory("TOUCHDOWN"), null);
});

test("a carry is never offered a sack or an incompletion", () => {
  assert.deepEqual(resultKindsFor("RUN"), ["BROKEN", "TOUCHDOWN", "TURNOVER", "PENALTY"]);
  assert.deepEqual(resultKindsFor("PASS"), [
    "INCOMPLETE_PASS",
    "SACK",
    "BROKEN",
    "TOUCHDOWN",
    "TURNOVER",
    "PENALTY",
  ]);
  // Before the category is answered every outcome shows, because two of them are the answer.
  assert.equal(resultKindsFor(null).length, 6);
});

test("our carry owes a hole, theirs owes a side, and a broken play owes neither", () => {
  const base = {
    executedAs: "RUN",
    kind: "PLAY",
    gap: null,
    location: null,
    penalty: null,
    turnoverType: null,
    returnedForTouchdown: false,
    yards: null,
    gapWasAssumed: false,
  };
  assert.equal(canSave({ ...base, executedAs: null }, true), false);
  assert.equal(canSave(base, true), false);
  assert.equal(canSave({ ...base, gap: "RIGHT_B" }, true), true);
  // Nobody can call a gap on somebody else's front from a sideline.
  assert.equal(canSave({ ...base, gap: "RIGHT_B" }, false), false);
  assert.equal(canSave({ ...base, location: "LEFT" }, false), true);
  // A broken play is asked nothing about where it went.
  assert.equal(canSave({ ...base, kind: "BROKEN" }, true), true);
  // A throw needs the third of the field it went to; a sack was never thrown.
  assert.equal(canSave({ ...base, executedAs: "PASS" }, true), false);
  assert.equal(canSave({ ...base, executedAs: "PASS", location: "MIDDLE" }, true), true);
  assert.equal(canSave({ ...base, executedAs: "PASS", kind: "SACK" }, true), true);
  // An untouched spot saves as a no-gain, so nothing gates on yardage.
  assert.equal(canSave({ ...base, executedAs: "PASS", location: "LEFT", yards: null }, true), true);
});

test("a turnover owes how it was lost before it saves", () => {
  const lost = {
    executedAs: "PASS",
    kind: "TURNOVER",
    gap: null,
    location: "LEFT",
    penalty: null,
    turnoverType: null,
    returnedForTouchdown: false,
    yards: null,
    gapWasAssumed: false,
  };
  assert.equal(canSave(lost, true), false);
  assert.equal(canSave({ ...lost, turnoverType: "INTERCEPTION" }, true), true);
});

test("a takeaway run home scores for whoever took it, and still files as a turnover", () => {
  const { live, quickStats } = derive([
    snap({
      executedAs: "PASS",
      kind: "TURNOVER",
      gap: null,
      location: "MIDDLE",
      turnoverType: "INTERCEPTION",
      returnedForTouchdown: true,
    }),
  ]);
  // Their pick-six off our snap: six on their board, and the try is theirs to answer.
  assert.equal(live.them, 6);
  assert.equal(live.us, 0);
  assert.equal(live.tryOwed, "THEIRS");
  assert.equal(live.possession, "THEIRS");
  // The outcome is still a turnover, so it is still counted as one.
  assert.equal(quickStats.turnovers, 1);
});

test("a penalty saves on the flag alone", () => {
  const flagged = {
    executedAs: null,
    kind: "PENALTY",
    gap: null,
    location: null,
    penalty: null,
    turnoverType: null,
    returnedForTouchdown: false,
    yards: null,
    gapWasAssumed: false,
  };
  assert.equal(canSave(flagged, true), false);
  assert.equal(
    canSave({ ...flagged, penalty: { onUs: true, yards: 5, accepted: true } }, true),
    true,
  );
});

test("the log is replayed, so every entry is filed in the situation it happened in", () => {
  const { live, rows } = derive([
    snap({ yards: 6 }),
    snap({ id: "power-26", label: "Power 26", gap: "RIGHT_C", yards: 5 }),
  ]);
  assert.deepEqual(rows[0].situation, { down: 1, distance: 10, yardLine: 25 });
  assert.deepEqual(rows[1].situation, { down: 2, distance: 4, yardLine: 31 });
  assert.deepEqual(live.situation, { down: 1, distance: 10, yardLine: 36 });
  assert.equal(live.statusLine, "1st & 10 · Own 36");
});

test("deleting an entry re-files every entry after it", () => {
  const first = snap({ yards: 6 });
  const second = snap({ id: "power-26", label: "Power 26", gap: "RIGHT_C", yards: 5 });
  const without = derive([second]);
  // Without the six in front of it, the same play is a first-down snap from the 25.
  assert.deepEqual(without.rows[0].situation, { down: 1, distance: 10, yardLine: 25 });
  assert.deepEqual(without.live.situation, { down: 2, distance: 5, yardLine: 30 });
  // And nothing was accumulated: the full log still derives the longer version.
  assert.deepEqual(derive([first, second]).rows[1].situation, { down: 2, distance: 4, yardLine: 31 });
});

test("a touchdown puts six up and owes a try before anything else", () => {
  const { live } = derive([snap({ kind: "TOUCHDOWN", yards: 75 })]);
  assert.equal(live.us, 6);
  assert.equal(live.tryOwed, "OURS");
  assert.equal(live.statusLine, "Touchdown · the try is owed");
});

test("the try adds its own point and kicks off to the other side", () => {
  const { live } = derive([
    snap({ kind: "TOUCHDOWN", yards: 75 }),
    control({ t: "TRY", ours: true, kind: "EXTRA_POINT", good: true, executedAs: null }),
  ]);
  assert.equal(live.us, 7);
  assert.equal(live.tryOwed, null);
  assert.equal(live.possession, "THEIRS");
  // Their own 25 is our 75.
  assert.equal(live.situation.yardLine, 75);
});

test("a missed try is recorded as loudly as a good one", () => {
  const { live } = derive([
    snap({ kind: "TOUCHDOWN", yards: 75 }),
    control({ t: "TRY", ours: true, kind: "EXTRA_POINT", good: false, executedAs: null }),
  ]);
  assert.equal(live.us, 6);
  assert.equal(live.tryOwed, null);
});

test("a turnover hands the ball over at the spot", () => {
  const { live } = derive([snap({ kind: "TURNOVER", yards: 3 })]);
  assert.equal(live.possession, "THEIRS");
  assert.equal(live.situation.yardLine, 25);
  assert.equal(live.situation.down, 1);
  assert.equal(derive([snap({ kind: "TURNOVER", yards: 3 })]).quickStats.turnovers, 1);
});

test("fourth down short hands the ball over where it stopped", () => {
  const { live } = derive([
    control({ t: "CHAINS", down: 4, distance: 5, yardLine: 40 }),
    snap({ yards: 2 }),
  ]);
  assert.equal(live.possession, "THEIRS");
  assert.equal(live.situation.yardLine, 42);
});

test("a defensive snap fills the defensive rows and never a hole", () => {
  const { quickStats } = derive([
    control({ t: "POSSESSION", possession: "THEIRS" }),
    snap({ side: "DEFENSE", formation: "4-3", label: "4-3", id: "4-3", location: "LEFT", yards: 7 }),
  ]);
  assert.deepEqual(quickStats.defensivePlays, { plays: 1, yards: 7 });
  assert.deepEqual(quickStats.theirRun.left, { plays: 1, yards: 7 });
  assert.deepEqual(quickStats.offensivePlays, { plays: 0, yards: 0 });
  assert.equal(quickStats.stops, 0);
});

test("a stop is no gain or less, and a takeaway is their turnover", () => {
  const { quickStats } = derive([
    control({ t: "POSSESSION", possession: "THEIRS" }),
    snap({ side: "DEFENSE", label: "4-3", id: "4-3", location: "MIDDLE", yards: -2 }),
    control({ t: "POSSESSION", possession: "THEIRS" }),
    snap({ side: "DEFENSE", label: "4-3", id: "4-3", location: "RIGHT", kind: "TURNOVER", yards: 0 }),
  ]);
  assert.equal(quickStats.stops, 2);
  assert.equal(quickStats.takeaways, 1);
});

test("a broken play files as a rush, in its own bin, with no hole", () => {
  const { quickStats } = derive([snap({ kind: "BROKEN", executedAs: "RUN", yards: 9 })]);
  assert.deepEqual(quickStats.ourRun.total, { plays: 1, yards: 9 });
  assert.deepEqual(quickStats.ourRun.broken, { plays: 1, yards: 9 });
  assert.deepEqual(quickStats.ourRun.right, { plays: 0, yards: 0 });
  // And it never lands on the hole diagram.
  const { offense } = derive([snap({ kind: "BROKEN", executedAs: "RUN", yards: 9 })]);
  assert.equal(offense.holes.every((hole) => hole.carries === 0), true);
});

test("an incompletion is worth nothing however far the slider was dragged", () => {
  const { quickStats } = derive([
    snap({ executedAs: "PASS", kind: "INCOMPLETE_PASS", location: "LEFT", yards: 30 }),
  ]);
  assert.deepEqual(quickStats.ourPass, { plays: 1, yards: 0 });
});

test("an accepted flag walks the ball and replays the down; declined, nothing moves", () => {
  const accepted = derive([
    snap({ kind: "PENALTY", penalty: { onUs: true, yards: 10, accepted: true }, yards: 0 }),
  ]);
  assert.equal(accepted.live.situation.yardLine, 15);
  assert.equal(accepted.live.situation.down, 1);
  assert.deepEqual(accepted.quickStats.penalties, { plays: 1, yards: 10 });

  const declined = derive([
    snap({ kind: "PENALTY", penalty: { onUs: true, yards: 10, accepted: false }, yards: 0 }),
  ]);
  assert.equal(declined.live.situation.yardLine, 25);
  assert.deepEqual(declined.quickStats.penalties, { plays: 1, yards: 0 });
});

test("the correction doors overwrite the answer without rewriting the log", () => {
  const events = [
    snap({ yards: 6 }),
    control({ t: "CHAINS", down: 1, distance: 10, yardLine: 50 }),
    control({ t: "SCORE", us: 14, them: 7 }),
    control({ t: "POSSESSION", possession: "THEIRS" }),
  ];
  const { live, quickStats } = derive(events);
  assert.deepEqual(live.situation, { down: 1, distance: 10, yardLine: 50 });
  assert.equal(live.us, 14);
  assert.equal(live.them, 7);
  assert.equal(live.possession, "THEIRS");
  // The play already recorded keeps its story.
  assert.deepEqual(quickStats.offensivePlays, { plays: 1, yards: 6 });
});

test("quarters and timeouts come off the same log", () => {
  const { live } = derive([
    control({ t: "QUARTER" }),
    control({ t: "QUARTER" }),
    control({ t: "TIMEOUT", ours: true }),
  ]);
  assert.equal(live.quarterLabel, "Q3");
  assert.equal(live.ourTimeouts, 2);
  assert.equal(live.theirTimeouts, 3);
  assert.equal(derive([control({ t: "QUARTER" })].concat([control({ t: "QUARTER" }), control({ t: "QUARTER" }), control({ t: "QUARTER" })])).live.quarterLabel, "OT");
});

test("a field goal is worth three and hands off; a miss hands off at the spot", () => {
  const good = derive([
    control({ t: "CHAINS", down: 4, distance: 5, yardLine: 70 }),
    control({ t: "SPECIAL", ours: true, unit: "FIELD_GOAL", good: true, endYardLine: null }),
  ]);
  assert.equal(good.live.us, 3);
  assert.equal(good.live.possession, "THEIRS");
  assert.equal(good.live.situation.yardLine, 75);

  const missed = derive([
    control({ t: "CHAINS", down: 4, distance: 5, yardLine: 70 }),
    control({ t: "SPECIAL", ours: true, unit: "FIELD_GOAL", good: false, endYardLine: null }),
  ]);
  assert.equal(missed.live.us, 0);
  assert.equal(missed.live.possession, "THEIRS");
  assert.equal(missed.live.situation.yardLine, 70);
});

test("a punt is only a spot, because the kick itself is never recorded", () => {
  const { live } = derive([
    control({ t: "SPECIAL", ours: true, unit: "PUNT", good: null, endYardLine: 72 }),
  ]);
  assert.equal(live.possession, "THEIRS");
  assert.equal(live.situation.yardLine, 72);
  assert.equal(live.situation.down, 1);
});

test("the hole diagram counts only carries that named a hole", () => {
  const { offense } = derive([
    snap({ gap: "RIGHT_B", yards: 6 }),
    snap({ gap: "RIGHT_B", yards: 4 }),
    snap({ id: "iso-21", label: "Iso 21", gap: "LEFT_A", yards: 1 }),
  ]);
  const four = offense.holes.find((hole) => hole.hole === 4);
  assert.deepEqual({ carries: four.carries, yards: four.yards, average: four.average }, {
    carries: 2,
    yards: 10,
    average: 5,
  });
  assert.equal(offense.bestHoleAverage, 5);
  // Odd left, even right, counting out from the centre.
  assert.deepEqual(offense.holes.map((hole) => hole.hole), [7, 5, 3, 1, 2, 4, 6, 8]);
});

test("every observation carries the sample it rests on", () => {
  const { offense } = derive([
    snap({ yards: 6 }),
    snap({ yards: 4 }),
    snap({ yards: 8 }),
  ]);
  const best = offense.insights.find((insight) => insight.title === "Best play");
  assert.equal(best.subject, "Blast 24");
  assert.equal(best.metric, "6.0 yds/play");
  assert.equal(best.tier, "Emerging");
});

test("suggest-a-play refuses to rank single attempts against each other", () => {
  const catalogue = [
    { playId: "blast-24", playLabel: "Blast 24", formationLabel: "I Form" },
    { playId: "power-26", playLabel: "Power 26", formationLabel: "I Form" },
  ];
  const once = suggestPlays(derive([snap({ yards: 20 })]), catalogue);
  assert.match(once.lead, /nothing to compare/);
  assert.match(once.lead, /most-used, not best/);
  assert.equal(once.suggestions.length, 1);

  const twice = suggestPlays(derive([snap({ yards: 20 }), snap({ yards: 2 })]), catalogue);
  assert.match(twice.lead, /Ranked by yards a play/);
  assert.equal(twice.suggestions[0].playId, "blast-24");
  assert.equal(twice.suggestions[0].calls, 2);
});

/**
 * The demo opens partway through a scrimmage rather than blank, so these pin the thing a
 * visitor actually lands on: the analytics have to say something, and they have to say it
 * with enough evidence behind them to be worth showing.
 */
test("the sample game leaves the visitor somewhere worth arriving", () => {
  const { live } = derive(SAMPLE_GAME);
  // Our ball, a live down, and nothing owed that would block the first tap.
  assert.equal(live.possession, "OURS");
  assert.equal(live.tryOwed, null);
  assert.equal(live.statusLine, "4th & 4 · Own 45");
  assert.equal(live.quarterLabel, "Q2");
  assert.equal(live.us, 7);
  assert.equal(live.them, 0);
});

test("the sample game fills every Quick Stats section, both sides of the ball", () => {
  const { quickStats } = derive(SAMPLE_GAME);
  assert.ok(quickStats.offensivePlays.plays > 10);
  assert.ok(quickStats.defensivePlays.plays > 5);
  assert.ok(quickStats.firstDowns > 0);
  // The rows most likely to sit at zero on a thin sample, which is why they are seeded.
  assert.ok(quickStats.explosivePlays > 0);
  assert.ok(quickStats.explosiveAllowed > 0);
  assert.ok(quickStats.negativePlays > 0);
  assert.ok(quickStats.stops > 0);
  assert.ok(quickStats.ourRun.left.plays > 0);
  assert.ok(quickStats.ourRun.middle.plays > 0);
  assert.ok(quickStats.ourRun.right.plays > 0);
  assert.ok(quickStats.theirRun.left.plays > 0);
  assert.ok(quickStats.theirRun.middle.plays > 0);
  assert.ok(quickStats.theirRun.right.plays > 0);
});

test("the sample game's headline claim is Established, not a lucky one-off", () => {
  const { offense, defense } = derive(SAMPLE_GAME);
  const bestPlay = offense.insights.find((insight) => insight.title === "Best play");
  assert.equal(bestPlay.subject, "Blast 24");
  assert.equal(bestPlay.tier, "Established");
  assert.match(bestPlay.detail, /^5 attempts · \d+% success$/);
  // Both analytics screens have all their cards.
  assert.deepEqual(
    offense.insights.map((insight) => insight.title),
    ["Best play", "Best formation", "Best attack area"],
  );
  assert.deepEqual(
    defense.insights.map((insight) => insight.title),
    ["They run at", "Hurting us most", "Best front"],
  );
  // Seven of the eight holes have a carry; the empty one proves the "no carries" state.
  assert.equal(offense.holes.filter((hole) => hole.carries > 0).length, 7);
});

test("sample-size beats rate: a lucky one-off never takes the headline", () => {
  // One carry for twenty yards against five for six a carry. The app ranks tier first.
  const lucky = [
    ...Array.from({ length: 5 }, () => snap({ yards: 6 })),
    snap({ id: "toss-27", label: "Toss 27", gap: "LEFT_D", yards: 20 }),
  ];
  const best = derive(lucky).offense.insights.find((insight) => insight.title === "Best play");
  assert.equal(best.subject, "Blast 24");
  assert.equal(best.tier, "Established");
});

test("every play the sample game calls exists in the sample playbook", () => {
  const known = new Set(CATALOGUE.map((play) => play.playId));
  const called = SAMPLE_GAME.filter((event) => event.t === "SNAP" && event.side === "OFFENSE");
  assert.ok(called.length > 0);
  for (const snapEvent of called) assert.ok(known.has(snapEvent.playId), snapEvent.playId);
  // And Suggest a play can rank over it without inventing anything.
  const suggested = suggestPlays(derive(SAMPLE_GAME), CATALOGUE);
  assert.ok(suggested.suggestions.length > 0);
  for (const play of suggested.suggestions) assert.ok(known.has(play.playId), play.playId);
});

test("a run in the sample playbook always names the hole it is designed for", () => {
  for (const formation of OFFENSE) {
    for (const play of formation.plays) {
      if (play.category === "RUN") assert.ok(play.gap, `${play.label} has no designed hole`);
      else assert.equal(play.gap, null, `${play.label} is a pass and should have no hole`);
    }
  }
});
