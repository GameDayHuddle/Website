import assert from "node:assert/strict";
import test from "node:test";

import {
  advancedBy,
  canSave,
  derive,
  downAndDistanceLabel,
  isSuccess,
  outcomesFor,
  yardLineLabel,
} from "../app/components/demoFootball.ts";

/**
 * The demo re-implements football rules that live in Kotlin in the app. These tests pin the
 * ported arithmetic so the website cannot start telling visitors something the product does
 * not do without a red test.
 */

let nextId = 0;
function play({ label = "Power Right", id = "power-right", category = "RUN", outcome = "PLAY", gap = "RIGHT_B", yards = 0, turnoverType = null }) {
  nextId += 1;
  return {
    id: nextId,
    playId: id,
    playLabel: label,
    formationLabel: "Trips Right",
    category,
    outcome,
    gap: category === "RUN" ? gap : null,
    location: null,
    turnoverType,
    yards,
  };
}

test("yard lines read in the Own/Opp convention", () => {
  assert.equal(yardLineLabel(25), "Own 25");
  assert.equal(yardLineLabel(50), "Midfield");
  assert.equal(yardLineLabel(82), "Opp 18");
  assert.equal(yardLineLabel(100), "Their goal");
  assert.equal(yardLineLabel(0), "Own goal");
});

test("down and distance says Goal inside the goal-to-go situation", () => {
  assert.equal(downAndDistanceLabel({ down: 3, distance: 8, yardLine: 48 }), "3rd & 8");
  assert.equal(downAndDistanceLabel({ down: 1, distance: 10, yardLine: 95 }), "1st & Goal");
  assert.equal(downAndDistanceLabel({ down: 4, distance: 1, yardLine: 60 }), "4th & 1");
});

test("the chains advance, reset and run out exactly as the app's do", () => {
  assert.deepEqual(advancedBy({ down: 1, distance: 10, yardLine: 25 }, 6), {
    down: 2,
    distance: 4,
    yardLine: 31,
  });
  assert.deepEqual(advancedBy({ down: 2, distance: 4, yardLine: 31 }, 4), {
    down: 1,
    distance: 10,
    yardLine: 35,
  });
  // A first down inside the ten shortens to the goal line rather than staying at ten.
  assert.deepEqual(advancedBy({ down: 2, distance: 4, yardLine: 89 }, 4), {
    down: 1,
    distance: 7,
    yardLine: 93,
  });
  // Fourth down short ends the possession, and so does crossing either goal line.
  assert.equal(advancedBy({ down: 4, distance: 7, yardLine: 28 }, 1), null);
  assert.equal(advancedBy({ down: 1, distance: 10, yardLine: 95 }, 5), null);
  assert.equal(advancedBy({ down: 1, distance: 10, yardLine: 4 }, -5), null);
});

test("a drive replays into the situation, the splits and the first downs", () => {
  const events = [
    play({ yards: 6 }),
    play({ id: "slant", label: "Slant", category: "PASS", yards: 4 }),
    play({ id: "dive", label: "Dive", gap: "RIGHT_A", yards: -2 }),
    play({ id: "play-action-deep", label: "Play Action Deep", category: "PASS", outcome: "INCOMPLETE_PASS", yards: 0 }),
    play({ id: "bootleg", label: "Bootleg", category: "PASS", yards: 12 }),
  ];
  const { live, stats, rows } = derive(events);

  assert.deepEqual(live.situation, { down: 1, distance: 10, yardLine: 45 });
  assert.equal(live.driveNumber, 1);
  assert.equal(live.ourScore, 0);

  assert.equal(stats.plays, 5);
  assert.equal(stats.yards, 20);
  assert.equal(stats.yardsPerPlay, 4);
  assert.deepEqual(stats.run, { plays: 2, yards: 4 });
  assert.deepEqual(stats.pass, { plays: 3, yards: 16 });
  assert.equal(stats.gains, 3);
  assert.equal(stats.noGain, 1);
  assert.equal(stats.losses, 1);
  assert.equal(stats.firstDowns, 2);
  // An incompletion is an attempt that was not caught; nothing here was a sack.
  assert.equal(stats.attempts, 3);
  assert.equal(stats.completions, 2);

  // Each entry reads back in the situation the replay puts it in.
  assert.deepEqual(rows[2].situation, { down: 1, distance: 10, yardLine: 35 });
  assert.equal(rows[1].endedDrive, null);
});

test("a sack is neither a completion nor an attempt", () => {
  const { stats } = derive([
    play({ id: "slant", label: "Slant", category: "PASS", outcome: "SACK", yards: -7 }),
    play({ id: "slant", label: "Slant", category: "PASS", yards: 9 }),
  ]);
  assert.equal(stats.attempts, 1);
  assert.equal(stats.completions, 1);
  assert.equal(stats.pass.plays, 2);
  assert.equal(stats.pass.yards, 2);
});

test("an interception is an attempt that was not completed", () => {
  const { stats } = derive([
    play({ id: "slant", label: "Slant", category: "PASS", outcome: "TURNOVER", turnoverType: "INTERCEPTION", yards: 3 }),
  ]);
  assert.equal(stats.attempts, 1);
  assert.equal(stats.completions, 0);
  assert.equal(stats.turnovers, 1);
});

test("the ball reaching the end zone scores six and starts the next drive", () => {
  const { live, stats } = derive([play({ outcome: "TOUCHDOWN", yards: 75 })]);
  assert.equal(stats.touchdowns, 1);
  assert.equal(live.ourScore, 6);
  assert.equal(live.justEnded, "touchdown");
  assert.equal(live.driveNumber, 2);
  assert.deepEqual(live.situation, { down: 1, distance: 10, yardLine: 25 });
});

test("four downs that come up short hand the ball over", () => {
  const { live, rows } = derive([
    play({ yards: 1 }),
    play({ yards: 1 }),
    play({ yards: 1 }),
    play({ yards: 1 }),
  ]);
  assert.equal(rows[3].endedDrive, "downs");
  assert.equal(live.justEnded, "downs");
  assert.equal(live.driveNumber, 2);
  assert.equal(live.ourScore, 0);
});

test("a turnover ends the drive without scoring", () => {
  const { live, stats } = derive([
    play({ yards: 8 }),
    play({ outcome: "TURNOVER", turnoverType: "FUMBLE", yards: 2 }),
  ]);
  assert.equal(stats.turnovers, 1);
  assert.equal(live.driveNumber, 2);
  assert.equal(live.ourScore, 0);
});

test("deleting an entry re-derives every entry after it", () => {
  const events = [play({ yards: 6 }), play({ yards: 4 }), play({ yards: 3 })];
  const before = derive(events);
  assert.deepEqual(before.rows[2].situation, { down: 1, distance: 10, yardLine: 35 });
  assert.deepEqual(before.live.situation, { down: 2, distance: 7, yardLine: 38 });

  // Take the middle snap out. The third play is now the second snap of the drive, in a
  // situation it was never entered in, and the log has to say so.
  const after = derive(events.filter((event) => event.id !== events[1].id));
  assert.deepEqual(after.rows[1].situation, { down: 2, distance: 4, yardLine: 31 });
  assert.deepEqual(after.live.situation, { down: 3, distance: 1, yardLine: 34 });
  assert.equal(after.stats.firstDowns, 0);
  assert.equal(after.stats.yards, 9);
});

test("run placement rolls up by hole", () => {
  const { stats } = derive([
    play({ gap: "RIGHT_B", yards: 6 }),
    play({ gap: "RIGHT_B", yards: 4 }),
    play({ gap: "LEFT_A", yards: -1 }),
  ]);
  const four = stats.holes.find((hole) => hole.hole === 4);
  const one = stats.holes.find((hole) => hole.hole === 1);
  const seven = stats.holes.find((hole) => hole.hole === 7);
  assert.equal(four.carries, 2);
  assert.equal(four.average, 5);
  assert.equal(one.carries, 1);
  assert.equal(one.average, -1);
  assert.equal(seven.carries, 0);
  assert.equal(seven.average, null);
});

test("the best play is ranked by yards per play and labelled by sample size", () => {
  const { stats } = derive([
    play({ id: "power-right", label: "Power Right", yards: 5 }),
    play({ id: "power-right", label: "Power Right", yards: 7 }),
    play({ id: "power-right", label: "Power Right", yards: 6 }),
    play({ id: "dive", label: "Dive", gap: "RIGHT_A", yards: 2 }),
  ]);
  assert.equal(stats.bestPlay.label, "Power Right");
  assert.equal(stats.bestPlay.attempts, 3);
  assert.equal(stats.bestPlay.yardsPerPlay, 6);
  assert.equal(stats.bestPlay.tier, "Emerging");
});

test("success is judged against the share of the distance the down demands", () => {
  // Half the distance on first down, 70% on second, all of it on third and fourth.
  assert.equal(isSuccess({ down: 1, distance: 10, yardLine: 25 }, 5, "PLAY"), true);
  assert.equal(isSuccess({ down: 1, distance: 10, yardLine: 25 }, 4, "PLAY"), false);
  assert.equal(isSuccess({ down: 2, distance: 10, yardLine: 25 }, 7, "PLAY"), true);
  assert.equal(isSuccess({ down: 3, distance: 10, yardLine: 25 }, 9, "PLAY"), false);
  // A touchdown did its job whatever the down said.
  assert.equal(isSuccess({ down: 3, distance: 10, yardLine: 25 }, 0, "TOUCHDOWN"), true);
});

test("a run needs a hole and a turnover needs a cause, but no snap needs yardage", () => {
  assert.equal(canSave({ category: null, outcome: "PLAY", gap: null, turnoverType: null }), false);
  assert.equal(canSave({ category: "RUN", outcome: "PLAY", gap: null, turnoverType: null }), false);
  assert.equal(canSave({ category: "RUN", outcome: "PLAY", gap: "RIGHT_B", turnoverType: null }), true);
  assert.equal(canSave({ category: "PASS", outcome: "TURNOVER", gap: null, turnoverType: null }), false);
  assert.equal(
    canSave({ category: "PASS", outcome: "TURNOVER", gap: null, turnoverType: "INTERCEPTION" }),
    true,
  );
  // An untouched spot slider saves as a no-gain, so nothing gates on yardage.
  assert.equal(canSave({ category: "PASS", outcome: "PLAY", gap: null, turnoverType: null }), true);
});

test("a carry is never offered a sack or an incompletion", () => {
  assert.deepEqual(outcomesFor("RUN"), ["TOUCHDOWN", "TURNOVER"]);
  assert.deepEqual(outcomesFor("PASS"), ["INCOMPLETE_PASS", "SACK", "TOUCHDOWN", "TURNOVER"]);
});
