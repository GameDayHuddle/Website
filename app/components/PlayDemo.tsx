"use client";

import { useMemo, useState } from "react";
import {
  canSave,
  derive,
  downAndDistanceLabel,
  gapInfo,
  GAPS,
  GOAL_LINE,
  impliedCategory,
  outcomesFor,
  OUTCOME_LABELS,
  yardLineLabel,
  type Category,
  type Gap,
  type Location,
  type Outcome,
  type PlayEvent,
  type TurnoverType,
} from "./demoFootball";

/**
 * A playable slice of the game-day screen.
 *
 * It records our own offense and nothing else, and every number beside it is derived from
 * the entries below it rather than counted up as they arrive — which is the point of the
 * thing. Deleting an entry re-derives the whole game, because that is what the app does.
 *
 * What this demo deliberately leaves out is listed in the copy beside it on the page: the
 * defensive sheet, special teams, penalties, the try after a touchdown, and the confirm-first
 * doors that correct the chains, the score and possession. A demo that mimed those would be
 * making promises the visitor could not check.
 */

type Play = {
  id: string;
  label: string;
  category: Category;
  /** The hole the play is designed to hit. Runs only. */
  gap: Gap | null;
};

type Formation = { id: string; label: string; plays: Play[] };

/** The playbook a coach starts with in the app, before they have authored their own. */
const PLAYBOOK: Formation[] = [
  {
    id: "off-trips-right",
    label: "Trips Right",
    plays: [
      { id: "power-right", label: "Power Right", category: "RUN", gap: "RIGHT_B" },
      { id: "counter-right", label: "Counter Right", category: "RUN", gap: "RIGHT_C" },
      { id: "slant", label: "Slant", category: "PASS", gap: null },
      { id: "play-action-deep", label: "Play Action Deep", category: "PASS", gap: null },
      { id: "bootleg", label: "Bootleg", category: "PASS", gap: null },
    ],
  },
  {
    id: "off-stack-right",
    label: "Stack Right",
    plays: [
      { id: "inside-zone", label: "Inside Zone", category: "RUN", gap: "LEFT_A" },
      { id: "outside-zone-right", label: "Outside Zone Right", category: "RUN", gap: "RIGHT_D" },
    ],
  },
  {
    id: "off-jumbo-left",
    label: "Jumbo Left",
    plays: [
      { id: "power-left", label: "Power Left", category: "RUN", gap: "LEFT_B" },
      { id: "dive", label: "Dive", category: "RUN", gap: "RIGHT_A" },
    ],
  },
  {
    id: "off-trips-left",
    label: "Trips Left",
    plays: [
      { id: "counter-left", label: "Counter Left", category: "RUN", gap: "LEFT_C" },
      { id: "sweep-left", label: "Sweep Left", category: "RUN", gap: "LEFT_D" },
      { id: "quick-out", label: "Quick Out", category: "PASS", gap: null },
    ],
  },
];

const DIRECTIONS: { id: Location; label: string }[] = [
  { id: "LEFT", label: "Left" },
  { id: "MIDDLE", label: "Middle" },
  { id: "RIGHT", label: "Right" },
];

type Draft = {
  category: Category | null;
  outcome: Outcome;
  gap: Gap | null;
  location: Location | null;
  turnoverType: TurnoverType | null;
  /** Null while the spot slider has not been moved, which saves as a no-gain. */
  yards: number | null;
  /** True while the hole is still the one the play was designed for. */
  gapWasAssumed: boolean;
};

function draftFor(play: Play): Draft {
  return {
    // On offense the call describes the play we ran, so opening on it saves a tap and is
    // right nearly every time.
    category: play.category,
    outcome: "PLAY",
    gap: play.category === "RUN" ? play.gap : null,
    location: null,
    turnoverType: null,
    yards: null,
    gapWasAssumed: play.category === "RUN" && play.gap !== null,
  };
}

function Chip({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button type="button" className="demo-chip" aria-pressed={selected} onClick={onClick}>
      {label}
    </button>
  );
}

export function PlayDemo() {
  const [events, setEvents] = useState<PlayEvent[]>([]);
  const [nextId, setNextId] = useState(1);
  const [called, setCalled] = useState<Play | null>(null);
  const [recording, setRecording] = useState(false);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [pickingHole, setPickingHole] = useState(false);

  const { live, rows, stats } = useMemo(() => derive(events), [events]);
  const situation = live.situation;

  function callPlay(play: Play) {
    setCalled(play);
    setDraft(draftFor(play));
    setPickingHole(false);
    setRecording(false);
  }

  function undoCall() {
    setCalled(null);
    setDraft(null);
    setRecording(false);
  }

  function save() {
    if (!called || !draft || !canSave(draft)) return;
    const event: PlayEvent = {
      id: nextId,
      playId: called.id,
      playLabel: called.label,
      formationLabel: PLAYBOOK.find((f) => f.plays.some((p) => p.id === called.id))?.label ?? "",
      category: draft.category!,
      outcome: draft.outcome,
      gap: draft.category === "RUN" ? draft.gap : null,
      location: draft.category === "PASS" ? draft.location : null,
      turnoverType: draft.outcome === "TURNOVER" ? draft.turnoverType : null,
      yards: draft.yards ?? 0,
    };
    setEvents((current) => [...current, event]);
    setNextId((id) => id + 1);
    setCalled(null);
    setDraft(null);
    setRecording(false);
    setPickingHole(false);
  }

  function remove(id: number) {
    setEvents((current) => current.filter((event) => event.id !== id));
  }

  function reset() {
    setEvents([]);
    setCalled(null);
    setDraft(null);
    setRecording(false);
    setPickingHole(false);
  }

  const endedLabel =
    live.justEnded === "touchdown"
      ? "Touchdown. Six on the board, and the next drive starts at Own 25."
      : live.justEnded === "turnover"
        ? "Turnover. Their ball — in the app the defensive sheet takes over here."
        : live.justEnded === "downs"
          ? "Fourth down came up short. Their ball, and a new drive starts at Own 25."
          : null;

  return (
    <div className="demo-shell">
      <div className="demo-tablet">
        <div className="demo-bar">
          <div className="demo-score">
            <b>Riverside {live.ourScore}</b>
            <span aria-hidden="true">·</span>
            <em>Q1</em>
            <span aria-hidden="true">·</span>
            <b>0 Northgate</b>
          </div>
          <div className="demo-situation">
            <b>{downAndDistanceLabel(situation)}</b>
            <span>{yardLineLabel(situation.yardLine)}</span>
          </div>
          <div className="demo-bar-action">
            {called && !recording ? (
              <>
                <button type="button" className="demo-text-button" onClick={undoCall}>
                  Undo call
                </button>
                <button type="button" className="demo-primary" onClick={() => setRecording(true)}>
                  Record result
                </button>
              </>
            ) : (
              <span className="demo-drive-tag">
                Drive {live.driveNumber} · {live.drivePlays} {live.drivePlays === 1 ? "play" : "plays"}
              </span>
            )}
          </div>
        </div>

        <div className="demo-body">
          <aside className="demo-quick" aria-label="Quick Stats">
            <h3>Quick Stats</h3>
            {stats.plays === 0 ? (
              <p className="demo-empty">Nothing recorded yet.</p>
            ) : (
              <>
                <section>
                  <b>Total plays</b>
                  <p>
                    <span>Offensive plays</span>
                    <strong>
                      {stats.plays} <small>({stats.yards} yds)</small>
                    </strong>
                  </p>
                  <p>
                    <span>Yards / play</span>
                    <strong>{stats.yardsPerPlay.toFixed(1)}</strong>
                  </p>
                  <p>
                    <span>First downs</span>
                    <strong>{stats.firstDowns}</strong>
                  </p>
                </section>
                <section>
                  <b>Offense</b>
                  <small>Our team</small>
                  <p>
                    <span>Run plays</span>
                    <strong>
                      {stats.run.plays} <small>({stats.run.yards} yds)</small>
                    </strong>
                  </p>
                  <p>
                    <span>Pass plays</span>
                    <strong>
                      {stats.pass.plays} <small>({stats.pass.yards} yds)</small>
                    </strong>
                  </p>
                  {stats.attempts > 0 && (
                    <p>
                      <span>Completions</span>
                      <strong>
                        {stats.completions}/{stats.attempts}
                      </strong>
                    </p>
                  )}
                </section>
                <section>
                  <b>How it went</b>
                  <small>From the sign of the yardage</small>
                  <p>
                    <span>Gains</span>
                    <strong>{stats.gains}</strong>
                  </p>
                  <p>
                    <span>No gain</span>
                    <strong>{stats.noGain}</strong>
                  </p>
                  <p>
                    <span>Losses</span>
                    <strong>{stats.losses}</strong>
                  </p>
                </section>
              </>
            )}
            <p className="demo-quick-note">
              The app shows a defense section here too. This demo only records our offense.
            </p>
          </aside>

          <div className="demo-main">
            {recording && called && draft ? (
              <ResultSheet
                play={called}
                draft={draft}
                setDraft={setDraft}
                startYardLine={situation.yardLine}
                situationLabel={`${downAndDistanceLabel(situation)} · ${yardLineLabel(situation.yardLine)}`}
                pickingHole={pickingHole}
                setPickingHole={setPickingHole}
                onBack={() => setRecording(false)}
                onSave={save}
              />
            ) : (
              <div className="demo-playbook">
                {endedLabel && !called && <p className="demo-banner">{endedLabel}</p>}
                <p className="demo-prompt">
                  {called ? (
                    <>
                      <b>{called.label}</b> is called. Record the result when the snap is over.
                    </>
                  ) : (
                    <>
                      It is <b>{downAndDistanceLabel(situation)}</b> at{" "}
                      <b>{yardLineLabel(situation.yardLine)}</b>. Tap a play to call it.
                    </>
                  )}
                </p>
                {PLAYBOOK.map((formation) => (
                  <div className="demo-formation" key={formation.id}>
                    <h4>{formation.label}</h4>
                    <div className="demo-tiles">
                      {formation.plays.map((play) => (
                        <button
                          type="button"
                          key={play.id}
                          className="demo-tile"
                          aria-pressed={called?.id === play.id}
                          onClick={() => callPlay(play)}
                        >
                          <b>{play.label}</b>
                          <span>
                            {play.category === "RUN"
                              ? `Run · ${gapInfo(play.gap!).hole} hole`
                              : "Pass"}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <aside className="demo-aside">
        <div className="demo-panel">
          <div className="demo-panel-head">
            <div>
              <span>THE EVENT LOG</span>
              <b>Every number above comes from this list</b>
            </div>
            {events.length > 0 && (
              <button type="button" className="demo-text-button" onClick={reset}>
                Clear
              </button>
            )}
          </div>
          {events.length === 0 ? (
            <p className="demo-empty">
              Nothing recorded yet. Call a play, record where the ball ended, and it lands here.
            </p>
          ) : (
            <>
              <ul className="demo-log">
                {[...rows].reverse().map((row) => (
                  <li key={row.event.id}>
                    <span className="demo-log-drive">D{row.driveNumber}</span>
                    <span className="demo-log-play">
                      <b>{row.event.playLabel}</b>
                      <small>
                        {downAndDistanceLabel(row.situation)} · {yardLineLabel(row.situation.yardLine)}
                      </small>
                    </span>
                    <span className="demo-log-result">
                      <b
                        className={
                          row.yards > 0 ? "is-gain" : row.yards < 0 ? "is-loss" : "is-flat"
                        }
                      >
                        {row.yards > 0 ? `+${row.yards}` : row.yards}
                      </b>
                      {row.event.outcome !== "PLAY" && (
                        <small>{OUTCOME_LABELS[row.event.outcome]}</small>
                      )}
                    </span>
                    <button
                      type="button"
                      className="demo-remove"
                      onClick={() => remove(row.event.id)}
                      aria-label={`Delete ${row.event.playLabel} on ${downAndDistanceLabel(row.situation)}`}
                    >
                      <span aria-hidden="true">×</span>
                    </button>
                  </li>
                ))}
              </ul>
              <p className="demo-panel-note">
                Delete any entry and watch every number re-derive — including the down, the
                distance and the plays that came after it.
              </p>
            </>
          )}
        </div>

        <div className="demo-panel">
          <div className="demo-panel-head">
            <div>
              <span>WHERE WE RUN</span>
              <b>Carries by hole</b>
            </div>
          </div>
          {stats.run.plays === 0 ? (
            <p className="demo-empty">Nothing recorded yet.</p>
          ) : (
            <>
              <div className="demo-hole-grid">
                {stats.holes.map((hole) => (
                  <div key={hole.gap} className={`demo-hole ${heatClass(hole.average)}`}>
                    <span>{hole.hole}</span>
                    <b>{hole.average === null ? "—" : hole.average.toFixed(1)}</b>
                    <small>{hole.carries === 0 ? "no carries" : `${hole.carries} car`}</small>
                  </div>
                ))}
              </div>
              <p className="demo-panel-note">
                {stats.run.plays} {stats.run.plays === 1 ? "carry" : "carries"} · {stats.run.yards}{" "}
                yards · {(stats.run.yards / stats.run.plays).toFixed(1)} average. Holes are
                numbered odd-left, even-right — the app follows your program&rsquo;s convention.
              </p>
            </>
          )}
        </div>

        <div className="demo-panel">
          <div className="demo-panel-head">
            <div>
              <span>BEST PLAY</span>
              <b>What is actually working</b>
            </div>
          </div>
          {stats.bestPlay === null ? (
            <p className="demo-empty">Nothing recorded yet.</p>
          ) : (
            <div className="demo-observation">
              <b>{stats.bestPlay.label}</b>
              <strong>{stats.bestPlay.yardsPerPlay.toFixed(1)} yds/play</strong>
              <small>
                {stats.bestPlay.attempts}{" "}
                {stats.bestPlay.attempts === 1 ? "attempt" : "attempts"} ·{" "}
                {Math.round(stats.bestPlay.successRate * 100)}% success
              </small>
              <i>{stats.bestPlay.tier.toUpperCase()}</i>
              <p>
                The app labels how much evidence is behind a number instead of hiding it. One
                carry for twelve yards is <b>Trending</b>, not proof.
              </p>
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}

/**
 * The colour ramp on the hole grid is the website's own presentation choice, not a rule from
 * the app — the printed average is the fact, and the shading only makes it scannable.
 */
function heatClass(average: number | null): string {
  if (average === null) return "is-empty";
  if (average < 0) return "is-cold";
  if (average < 3) return "is-low";
  if (average < 6) return "is-mid";
  return "is-hot";
}

function ResultSheet({
  play,
  draft,
  setDraft,
  startYardLine,
  situationLabel,
  pickingHole,
  setPickingHole,
  onBack,
  onSave,
}: {
  play: Play;
  draft: Draft;
  setDraft: (draft: Draft) => void;
  startYardLine: number;
  situationLabel: string;
  pickingHole: boolean;
  setPickingHole: (picking: boolean) => void;
  onBack: () => void;
  onSave: () => void;
}) {
  const isRun = draft.category === "RUN";
  const isPass = draft.category === "PASS";

  // Every throw is placed beside run-or-pass. Our own carry is placed by hole instead, which
  // is a different question and a wider control, so it keeps its own section further down.
  const placementLabel =
    draft.category === null || isRun ? null : draft.outcome === "SACK" ? null : "Where we threw it";

  function chooseCategory(category: Category) {
    const nowRun = category === "RUN";
    const allowed = outcomesFor(category);
    setDraft({
      ...draft,
      category,
      // An outcome picked under the other category may not be on this one's list — Sack is
      // not offered on a run — and a chip nobody can see selected would still save.
      outcome: allowed.includes(draft.outcome) ? draft.outcome : "PLAY",
      gap: nowRun ? play.gap : null,
      gapWasAssumed: nowRun && play.gap !== null,
      // On offense the third of the field never survives the switch: our carry is placed by
      // hole, so a direction picked under "Where we threw it" would be invisible on a run's
      // form yet still satisfy the save check.
      location: null,
    });
    setPickingHole(false);
  }

  function chooseOutcome(picked: Outcome) {
    // Tapping the lit chip puts it out. Every chip here claims something specific happened,
    // so a mis-tapped Touchdown needs a way back that is not "pick a different wrong one".
    const chosen: Outcome = draft.outcome === picked ? "PLAY" : picked;
    const implied = impliedCategory(chosen) ?? draft.category;
    const nowRun = implied === "RUN";
    setDraft({
      ...draft,
      outcome: chosen,
      category: implied,
      // The Touchdown chip moves the spot itself: a score ends at the goal line, and
      // dragging a thumb the length of the field to say so is entry the chip already
      // answered. Leaving the chip takes the fill back out rather than parking the ball on
      // a goal line nobody observed.
      yards:
        chosen === "TOUCHDOWN"
          ? GOAL_LINE - startYardLine
          : draft.outcome === "TOUCHDOWN"
            ? null
            : draft.yards,
      turnoverType: chosen === "TURNOVER" ? draft.turnoverType : null,
      // Nothing was thrown on a sack, so a third of the field picked a moment ago is no
      // longer an answer to anything.
      location: chosen === "SACK" ? null : draft.location,
      gap: draft.gap ?? (nowRun ? play.gap : null),
      gapWasAssumed: draft.gapWasAssumed || (draft.gap === null && nowRun && play.gap !== null),
    });
  }

  const assumed = draft.gapWasAssumed && !pickingHole && draft.gap !== null;
  const saveable = canSave(draft);

  return (
    <div className="demo-sheet">
      <header className="demo-sheet-head">
        <b>{play.label}</b>
        <span>{situationLabel}</span>
      </header>

      <div className="demo-sheet-row">
        <div className="demo-field">
          <span className="demo-field-label">Run or pass</span>
          <div className="demo-chips">
            <Chip label="Run" selected={isRun} onClick={() => chooseCategory("RUN")} />
            <Chip label="Pass" selected={isPass} onClick={() => chooseCategory("PASS")} />
          </div>
        </div>

        {placementLabel && (
          <div className="demo-field">
            <span className="demo-field-label">{placementLabel}</span>
            <div className="demo-chips">
              {DIRECTIONS.map((direction) => (
                <Chip
                  key={direction.id}
                  label={direction.label}
                  selected={draft.location === direction.id}
                  onClick={() => setDraft({ ...draft, location: direction.id })}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="demo-field">
        <span className="demo-field-label">Outcome</span>
        <div className="demo-chips">
          {outcomesFor(draft.category).map((outcome) => (
            <Chip
              key={outcome}
              label={OUTCOME_LABELS[outcome]}
              selected={draft.outcome === outcome}
              onClick={() => chooseOutcome(outcome)}
            />
          ))}
        </div>
        <small className="demo-hint">
          Most snaps carry none of these. The row opening with nothing selected is the
          ordinary case — the yardage says the rest.
        </small>
      </div>

      {draft.outcome === "TURNOVER" && (
        <div className="demo-field">
          <span className="demo-field-label">How it was lost</span>
          <div className="demo-chips">
            {(["INTERCEPTION", "FUMBLE"] as TurnoverType[]).map((type) => (
              <Chip
                key={type}
                label={type === "INTERCEPTION" ? "Interception" : "Fumble"}
                selected={draft.turnoverType === type}
                onClick={() => setDraft({ ...draft, turnoverType: type })}
              />
            ))}
          </div>
          {draft.turnoverType === null && (
            <small className="demo-hint">Pick how it was lost to save.</small>
          )}
        </div>
      )}

      {draft.outcome !== "INCOMPLETE_PASS" && (
        <div className="demo-field">
          <span className="demo-field-label">Where the ball ended</span>
          <EndSpot
            startYardLine={startYardLine}
            yards={draft.yards}
            onChange={(yards) => setDraft({ ...draft, yards })}
          />
        </div>
      )}

      {isRun && (
        <div className="demo-field">
          <span className="demo-field-label">Hole</span>
          {assumed ? (
            <>
              <div className="demo-chips">
                <Chip
                  label={`${gapInfo(draft.gap!).hole} hole`}
                  selected
                  onClick={() => setPickingHole(true)}
                />
                <button
                  type="button"
                  className="demo-text-button"
                  onClick={() => setPickingHole(true)}
                >
                  Went somewhere else
                </button>
              </div>
              <small className="demo-hint">
                The hole this play is designed for. Only change it if you actually saw the back
                go elsewhere.
              </small>
            </>
          ) : (
            <div className="demo-chips">
              {GAPS.map((gap) => (
                <Chip
                  key={gap.id}
                  label={`${gap.hole}`}
                  selected={draft.gap === gap.id}
                  onClick={() => setDraft({ ...draft, gap: gap.id, gapWasAssumed: false })}
                />
              ))}
            </div>
          )}
        </div>
      )}

      <footer className="demo-sheet-foot">
        <button type="button" className="demo-text-button" onClick={onBack}>
          ‹ Back
        </button>
        <button type="button" className="demo-primary" disabled={!saveable} onClick={onSave}>
          Save
        </button>
      </footer>
    </div>
  );
}

/**
 * Where the ball ended, entered as a spot rather than typed as a number. The gain is derived
 * from it, never the other way round.
 *
 * The thumb parks on the snap and a parked thumb is a real answer — the ball ended where it
 * started, which is most stuffed runs. The readout owns the honesty: an untouched slider
 * reads the snap spot and says "no gain", never a dash over a Save that would quietly write
 * one.
 */
function EndSpot({
  startYardLine,
  yards,
  onChange,
}: {
  startYardLine: number;
  yards: number | null;
  onChange: (yards: number) => void;
}) {
  const entered = yards !== null;
  const endYardLine = Math.min(GOAL_LINE, Math.max(0, startYardLine + (yards ?? 0)));
  const gained = endYardLine - startYardLine;

  const subtitle =
    gained > 0
      ? `+${gained} yards`
      : gained < 0
        ? `${gained} yards`
        : entered
          ? "no gain"
          : "no gain — move it if the ball moved";

  return (
    <div className="demo-spot">
      <div className="demo-spot-head">
        <button
          type="button"
          className="demo-step"
          onClick={() => onChange(Math.max(1, endYardLine - 1) - startYardLine)}
          aria-label="One yard toward our goal"
        >
          <span aria-hidden="true">←</span>
        </button>
        <div className="demo-spot-read">
          <b>{yardLineLabel(endYardLine)}</b>
          <span>
            {subtitle} · from {yardLineLabel(startYardLine)}
          </span>
        </div>
        <button
          type="button"
          className="demo-step"
          onClick={() => onChange(Math.min(GOAL_LINE - 1, endYardLine + 1) - startYardLine)}
          aria-label="One yard toward their goal"
        >
          <span aria-hidden="true">→</span>
        </button>
      </div>
      <input
        type="range"
        className="demo-slider"
        // The goal line is not draggable: a touchdown is one of the things the yardage
        // cannot say on its own, so it is the outcome chip that puts the ball there.
        min={1}
        max={GOAL_LINE - 1}
        step={1}
        value={Math.min(GOAL_LINE - 1, Math.max(1, endYardLine))}
        onChange={(change) => onChange(Number(change.target.value) - startYardLine)}
        aria-label="Where the ball ended"
        aria-valuetext={`${yardLineLabel(endYardLine)}, ${subtitle}`}
      />
      <div className="demo-spot-scale" aria-hidden="true">
        <span>Own goal</span>
        <span>Midfield</span>
        <span>Their goal</span>
      </div>
    </div>
  );
}
