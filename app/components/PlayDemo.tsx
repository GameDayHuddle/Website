"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  canSave,
  chainsLabel,
  derive,
  downAndDistanceLabel,
  FIRST_DOWN_DISTANCE,
  gapInfo,
  GAPS,
  GOAL_LINE,
  impliedCategory,
  isGoalToGo,
  LINE_POSITIONS,
  RESULT_KIND_LABELS,
  resultKindsFor,
  suggestPlays,
  TIMEOUTS_PER_HALF,
  toGoal,
  TURNOVER_LABELS,
  yardLineLabel,
  type Category,
  type Draft,
  type GameEvent,
  type Gap,
  type Insight,
  type Location,
  type ResultKind,
  type SideOfBall,
  type Situation,
  type SnapEvent,
  type TeamRef,
  type TurnoverType,
} from "./demoFootball";

/**
 * The game-day screen, running in a browser.
 *
 * This is the app's recording screen rebuilt in HTML, not an illustration of it: the same
 * game bar, the same six destinations, the same two-step call (a formation tile, then its
 * plays), the same result dialog, the same Quick Stats rows in the same order, the same
 * hole diagram drawn across the front, and the same confirm-first doors on the chains, the
 * score and possession. Every number is derived from the log by `demoFootball.derive`.
 *
 * What it is not is a screenshot. The layout follows the app's own breakpoint — Quick Stats
 * is a pinned 280dp column above 840dp and collapses to a header below it — so a visitor on
 * a phone sees what a coach on a narrow tablet sees.
 *
 * Deliberately left out, and named in the copy beside it rather than mimed: the second
 * tablet, the Play Keeper seat, the jamboree, and the season that adds up behind the game.
 */

const OUR_TEAM = "Riverside";
const OPPONENT = "Northgate";

type Play = {
  id: string;
  label: string;
  category: Category;
  /** The hole the play is designed to hit. Our runs only. */
  gap: Gap | null;
};

type Formation = { id: string; label: string; note?: string; plays: Play[] };

/** The offense a coach has authored in Play Maker, as the game-day sheet reads it back. */
const OFFENSE: Formation[] = [
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
const DEFENSE: Formation[] = [
  { id: "4-3", label: "4-3", note: "Default", plays: [] },
  { id: "5-2", label: "5-2", plays: [] },
  { id: "nickel", label: "Nickel", plays: [] },
];

const DIRECTIONS: { id: Location; label: string }[] = [
  { id: "LEFT", label: "Left" },
  { id: "MIDDLE", label: "Middle" },
  { id: "RIGHT", label: "Right" },
];

type Destination =
  | "HOME"
  | "OFFENSE_PLAYBOOK"
  | "OFFENSIVE_ANALYTICS"
  | "DEFENSE_PLAYBOOK"
  | "DEFENSE_ANALYTICS"
  | "WHITE_BOARD";

const DESTINATIONS: { id: Destination; label: string; icon: string }[] = [
  { id: "HOME", label: "Home", icon: "◻" },
  { id: "OFFENSE_PLAYBOOK", label: "Offense Playbook", icon: "»" },
  { id: "OFFENSIVE_ANALYTICS", label: "Offensive Analytics", icon: "▮▮" },
  { id: "DEFENSE_PLAYBOOK", label: "Defense Playbook", icon: "«" },
  { id: "DEFENSE_ANALYTICS", label: "Defense Analytics", icon: "▮▮" },
  { id: "WHITE_BOARD", label: "White Board", icon: "▤" },
];

/** A call that has been made and is waiting on its result. */
type Call = {
  side: SideOfBall;
  playId: string;
  playLabel: string;
  formationLabel: string;
  designedGap: Gap | null;
  designedCategory: Category | null;
};

function draftFor(call: Call): Draft {
  const isOffense = call.side === "OFFENSE";
  return {
    // On offense the call describes the play we ran, so opening on it saves a tap and is
    // right nearly every time. A front says nothing about what they did with the ball.
    executedAs: isOffense ? call.designedCategory : null,
    kind: "PLAY",
    gap: isOffense && call.designedCategory === "RUN" ? call.designedGap : null,
    location: null,
    penalty: null,
    turnoverType: null,
    returnedForTouchdown: false,
    yards: null,
    gapWasAssumed: isOffense && call.designedCategory === "RUN" && call.designedGap !== null,
  };
}

export function PlayDemo() {
  const [events, setEvents] = useState<GameEvent[]>([]);
  const [destination, setDestination] = useState<Destination>("HOME");
  const [call, setCall] = useState<Call | null>(null);
  const [openFormation, setOpenFormation] = useState<Formation | null>(null);
  const [recording, setRecording] = useState(false);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [pickingHole, setPickingHole] = useState(false);
  const [blitzArmed, setBlitzArmed] = useState(false);
  const [dialog, setDialog] = useState<
    null | "SUGGEST" | "CHAINS" | "SCORE" | "POSSESSION" | "PUNT" | "FIELD_GOAL" | "NOT_OURS" | "NOT_THEIRS"
  >(null);
  const [notice, setNotice] = useState<string | null>(null);

  const derived = useMemo(() => derive(events), [events]);
  const { live, quickStats, offense, defense } = derived;
  const ourBall = live.possession === "OURS";

  /**
   * A touchdown owes its try before anything else can be recorded, exactly as on the tablet.
   * Derived rather than raised by an effect: the try being owed IS the condition, so there is
   * no second piece of state that could disagree with the log about whether one is pending.
   */
  const tryOwed = live.tryOwed !== null && !recording;

  const push = useCallback((make: (id: number) => GameEvent) => {
    setEvents((current) => {
      const id = current.length === 0 ? 1 : Math.max(...current.map((event) => event.id)) + 1;
      return [...current, make(id)];
    });
  }, []);

  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(null), 4200);
    return () => window.clearTimeout(timer);
  }, [notice]);

  function callPlay(side: SideOfBall, formation: Formation, play: Play | null) {
    setCall({
      side,
      playId: play?.id ?? formation.id,
      playLabel: play?.label ?? formation.label,
      formationLabel: formation.label,
      designedGap: play?.gap ?? null,
      designedCategory: play?.category ?? null,
    });
    setDraft(
      draftFor({
        side,
        playId: play?.id ?? formation.id,
        playLabel: play?.label ?? formation.label,
        formationLabel: formation.label,
        designedGap: play?.gap ?? null,
        designedCategory: play?.category ?? null,
      }),
    );
    setOpenFormation(null);
    setPickingHole(false);
    setRecording(true);
  }

  function undoCall() {
    setCall(null);
    setDraft(null);
    setRecording(false);
  }

  function save() {
    if (!call || !draft || !canSave(draft, call.side === "OFFENSE")) return;
    const isOffense = call.side === "OFFENSE";
    push((id) => {
      const snap: SnapEvent = {
        t: "SNAP",
        id,
        side: call.side,
        playId: call.playId,
        playLabel: call.playLabel,
        formationLabel: call.formationLabel,
        executedAs: draft.executedAs,
        kind: draft.kind,
        // Our own carry is placed by hole; a broken play is placed by neither.
        gap: isOffense && draft.executedAs === "RUN" && draft.kind !== "BROKEN" ? draft.gap : null,
        location: draft.kind === "BROKEN" ? null : draft.location,
        penalty: draft.kind === "PENALTY" ? draft.penalty : null,
        turnoverType: draft.kind === "TURNOVER" ? draft.turnoverType : null,
        returnedForTouchdown: draft.kind === "TURNOVER" && draft.returnedForTouchdown,
        yards: draft.yards ?? 0,
      };
      return snap;
    });
    setCall(null);
    setDraft(null);
    setRecording(false);
    setPickingHole(false);
    setBlitzArmed(false);
  }

  function removeEvent(id: number) {
    setEvents((current) => current.filter((event) => event.id !== id));
  }

  function reset() {
    setEvents([]);
    setCall(null);
    setDraft(null);
    setRecording(false);
    setPickingHole(false);
    setDialog(null);
    setDestination("HOME");
  }

  const totalsLine = `${quickStats.offensivePlays.plays} off · ${quickStats.defensivePlays.plays} def · ${quickStats.penalties.plays} pen`;

  const catalogue = OFFENSE.flatMap((formation) =>
    formation.plays.map((play) => ({
      playId: play.id,
      playLabel: play.label,
      formationLabel: formation.label,
    })),
  );

  const focused = destination !== "HOME";
  const screenName = DESTINATIONS.find((entry) => entry.id === destination)!.label;

  return (
    <div className="gd-wrap">
      <div className="gd">
        {/* ------------------------------------------------------------------ game bar */}
        <div className="gd-topbar">
          <button type="button" className="gd-leave" onClick={reset}>
            ‹&nbsp;&nbsp;Leave game
          </button>
          <div className="gd-bar">
            <span className="gd-quarter">{live.quarterLabel}</span>
            <button
              type="button"
              className="gd-status"
              onClick={() => setDialog("CHAINS")}
              aria-label="Set the down, distance and spot by hand"
            >
              {live.statusLine}
              {recording && <span className="gd-status-tail"> · waiting on the result</span>}
            </button>
            <div className="gd-scores">
              <Scoreboard
                name={OUR_TEAM}
                points={live.us}
                timeouts={live.ourTimeouts}
                hasBall={ourBall}
                onScore={() => setDialog("SCORE")}
                onTimeout={() => push((id) => ({ t: "TIMEOUT", id, ours: true }))}
              />
              <Scoreboard
                name={OPPONENT}
                points={live.them}
                timeouts={live.theirTimeouts}
                hasBall={!ourBall}
                onScore={() => setDialog("SCORE")}
                onTimeout={() => push((id) => ({ t: "TIMEOUT", id, ours: false }))}
              />
            </div>
            <div className="gd-actions">
              {recording ? (
                <>
                  <button type="button" className="gd-text" onClick={undoCall}>
                    Undo call
                  </button>
                  <button type="button" className="gd-primary" onClick={() => setRecording(true)}>
                    Record result
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    className="gd-text"
                    onClick={() => push((id) => ({ t: "QUARTER", id }))}
                  >
                    Next quarter
                  </button>
                  <button type="button" className="gd-text" onClick={reset}>
                    End game
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* --------------------------------------------------------------------- body */}
        {focused ? (
          <>
            <div className="gd-backrow">
              <button type="button" className="gd-text" onClick={() => setDestination("HOME")}>
                ‹&nbsp;Back
              </button>
              <b>{screenName}</b>
              <div className="gd-backrow-mid">
                {destination === "OFFENSE_PLAYBOOK" && (
                  <button
                    type="button"
                    className="gd-suggest"
                    onClick={() => setDialog("SUGGEST")}
                  >
                    Suggest a play
                  </button>
                )}
                {destination === "DEFENSE_PLAYBOOK" && (
                  <div className="gd-blitz">
                    <button
                      type="button"
                      className="gd-blitz-chip"
                      aria-pressed={blitzArmed}
                      onClick={() => setBlitzArmed(true)}
                    >
                      Blitz
                    </button>
                    <button
                      type="button"
                      className="gd-blitz-chip"
                      aria-pressed={!blitzArmed}
                      onClick={() => setBlitzArmed(false)}
                    >
                      Off
                    </button>
                  </div>
                )}
                {destination === "OFFENSIVE_ANALYTICS" && (
                  <span className="gd-split">
                    Run <b>{offense.runShare}%</b> · Pass <b>{offense.passShare}%</b>
                  </span>
                )}
                {destination === "DEFENSE_ANALYTICS" && (
                  <span className="gd-split">
                    Run <b>{defense.runShare}%</b> · Pass <b>{defense.passShare}%</b>
                  </span>
                )}
              </div>
              <div className="gd-backrow-end">
                <span className="gd-totals">{totalsLine}</span>
                {(destination === "OFFENSE_PLAYBOOK" || destination === "DEFENSE_PLAYBOOK") && (
                  <button
                    type="button"
                    className="gd-text"
                    onClick={() =>
                      setDestination(
                        destination === "OFFENSE_PLAYBOOK"
                          ? "OFFENSIVE_ANALYTICS"
                          : "DEFENSE_ANALYTICS",
                      )
                    }
                  >
                    Analytics
                  </button>
                )}
              </div>
            </div>
            <div className="gd-content">
              {destination === "OFFENSE_PLAYBOOK" && (
                <PlaybookScreen
                  side="OFFENSE"
                  formations={OFFENSE}
                  calls={derived.formationCalls}
                  pending={call?.side === "OFFENSE" ? call.formationLabel : null}
                  emptyNote="No offensive plays called yet. Percentages fill in as plays are recorded."
                  footNote={
                    call ? "Tiles show live call distribution." : "Tap a formation to see its plays and call one."
                  }
                  specialHeading="Special Teams"
                  specialNote={null}
                  specials={["Punt", "Field goal", "Fake"]}
                  onFormation={(formation) => {
                    if (!ourBall) return setDialog("NOT_OURS");
                    setOpenFormation(formation);
                  }}
                  onSpecial={(unit) => {
                    if (!ourBall) return setDialog("NOT_OURS");
                    if (unit === "Punt") setDialog("PUNT");
                    else if (unit === "Field goal") setDialog("FIELD_GOAL");
                    else setNotice("A fake is called off the playbook like any other snap — pick the play it is disguised as.");
                  }}
                />
              )}
              {destination === "DEFENSE_PLAYBOOK" && (
                <PlaybookScreen
                  side="DEFENSE"
                  formations={DEFENSE}
                  calls={derived.defenseFormationCalls}
                  pending={call?.side === "DEFENSE" ? call.formationLabel : null}
                  emptyNote="No defensive plays called yet. Percentages fill in as plays are recorded."
                  footNote="Tap a front to call it. Arm Blitz first and the same tap records the front and the blitz together."
                  specialHeading="Special Teams"
                  specialNote="Tap the unit their kicker brings out — Punt return, or Field goal block. Each opens its own question: where our drive starts, or whether their kick was good."
                  specials={["Punt return", "Field goal block"]}
                  onFormation={(formation) => {
                    if (ourBall) return setDialog("NOT_THEIRS");
                    callPlay("DEFENSE", formation, null);
                  }}
                  onSpecial={() => {
                    if (ourBall) return setDialog("NOT_THEIRS");
                    setDialog("PUNT");
                  }}
                />
              )}
              {destination === "OFFENSIVE_ANALYTICS" && (
                <AnalyticsScreen analytics={offense} side="OFFENSE" />
              )}
              {destination === "DEFENSE_ANALYTICS" && (
                <AnalyticsScreen analytics={defense} side="DEFENSE" />
              )}
              {destination === "WHITE_BOARD" && <WhiteBoard />}
            </div>
          </>
        ) : (
          <div className="gd-home">
            <QuickStatsPanel stats={quickStats} />
            <div className="gd-home-main">
              <nav className="gd-nav" aria-label="Game Day">
                {DESTINATIONS.map((entry) => (
                  <button
                    type="button"
                    key={entry.id}
                    className="gd-nav-tile"
                    aria-current={entry.id === destination ? "page" : undefined}
                    onClick={() => setDestination(entry.id)}
                  >
                    <span className="gd-nav-icon" aria-hidden="true">
                      {entry.icon}
                    </span>
                    <span className="gd-nav-label">{entry.label}</span>
                  </button>
                ))}
              </nav>
              <div className="gd-identity">
                <h3>{`${OUR_TEAM} vs ${OPPONENT}`}</h3>
                <p>Scrimmage · Home · Head Coach only</p>
                {events.length === 0 ? (
                  <p className="gd-hint">
                    Open <b>Offense Playbook</b> to call the first snap. Everything on the left
                    fills in from what you record.
                  </p>
                ) : (
                  <RecentLog
                    rows={derived.rows}
                    onRemove={removeEvent}
                  />
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {notice && (
        <p className="gd-notice" role="status">
          {notice}
        </p>
      )}

      {/* ---------------------------------------------------------------- the dialogs */}
      {openFormation && (
        <Dialog title={openFormation.label} subtitle={chainsLabel(live.situation, live.possession)} onClose={() => setOpenFormation(null)}>
          <ul className="gd-playlist">
            {openFormation.plays.map((play) => {
              const calls = derived.playCalls.get(play.id) ?? 0;
              const tally = derived.playAverages.get(play.id);
              return (
                <li key={play.id}>
                  <div>
                    <b>{play.label}</b>
                    <small>
                      {play.category === "RUN"
                        ? `Run · ${gapInfo(play.gap!).hole} hole`
                        : "Pass"}
                      {" · "}
                      {calls === 0
                        ? "not called yet"
                        : `${calls} called · usually ${Math.round(tally!.yards / tally!.attempts)} yds`}
                    </small>
                  </div>
                  <button
                    type="button"
                    className="gd-call"
                    onClick={() => callPlay("OFFENSE", openFormation, play)}
                  >
                    Call
                  </button>
                </li>
              );
            })}
          </ul>
          <DialogFoot>
            <button type="button" className="gd-text" onClick={() => setOpenFormation(null)}>
              Close
            </button>
          </DialogFoot>
        </Dialog>
      )}

      {recording && call && draft && (
        <ResultDialog
          call={call}
          draft={draft}
          setDraft={setDraft}
          situation={live.situation}
          possession={live.possession}
          pickingHole={pickingHole}
          setPickingHole={setPickingHole}
          onBack={undoCall}
          onSave={save}
        />
      )}

      {dialog === "SUGGEST" && (
        <SuggestDialog
          derived={derived}
          catalogue={catalogue}
          situation={live.situation}
          possession={live.possession}
          onClose={() => setDialog(null)}
          onCall={(playId) => {
            const formation = OFFENSE.find((entry) => entry.plays.some((play) => play.id === playId))!;
            const play = formation.plays.find((entry) => entry.id === playId)!;
            setDialog(null);
            callPlay("OFFENSE", formation, play);
          }}
        />
      )}

      {dialog === "CHAINS" && (
        <ChainsDialog
          situation={live.situation}
          possession={live.possession}
          onClose={() => setDialog(null)}
          onSet={(next) => {
            push((id) => ({ t: "CHAINS", id, ...next }));
            setDialog(null);
          }}
        />
      )}

      {dialog === "SCORE" && (
        <ScoreDialog
          us={live.us}
          them={live.them}
          onClose={() => setDialog(null)}
          onPossession={() => setDialog("POSSESSION")}
          onSet={(us, them) => {
            push((id) => ({ t: "SCORE", id, us, them }));
            setDialog(null);
          }}
        />
      )}

      {dialog === "POSSESSION" && (
        <PossessionDialog
          possession={live.possession}
          onClose={() => setDialog(null)}
          onSet={(next) => {
            push((id) => ({ t: "POSSESSION", id, possession: next }));
            setDialog(null);
          }}
        />
      )}

      {tryOwed && (
        <TryDialog
          ours={live.tryOwed === "OURS"}
          opponent={OPPONENT}
          onRecord={(kind, good) => {
            push((id) => ({
              t: "TRY",
              id,
              ours: live.tryOwed === "OURS",
              kind,
              good,
              executedAs: null,
            }));
          }}
        />
      )}

      {dialog === "PUNT" && (
        <PuntDialog
          ours={ourBall}
          situation={live.situation}
          onClose={() => setDialog(null)}
          onSet={(yardLine) => {
            push((id) => ({
              t: "SPECIAL",
              id,
              ours: ourBall,
              unit: "PUNT",
              good: null,
              endYardLine: yardLine,
            }));
            setDialog(null);
          }}
        />
      )}

      {dialog === "FIELD_GOAL" && (
        <FieldGoalDialog
          situation={live.situation}
          onClose={() => setDialog(null)}
          onSet={(good) => {
            push((id) => ({
              t: "SPECIAL",
              id,
              ours: true,
              unit: "FIELD_GOAL",
              good,
              endYardLine: null,
            }));
            setDialog(null);
          }}
        />
      )}

      {dialog === "NOT_OURS" && (
        <Dialog title="They have the ball" onClose={() => setDialog(null)}>
          <p className="gd-body">
            The ball is theirs, so an offensive play can&rsquo;t be called — call a defensive
            front. If the ball really is ours, fix possession from the game bar first.
          </p>
          <DialogFoot>
            <button type="button" className="gd-text" onClick={() => setDialog(null)}>
              Close
            </button>
            <button
              type="button"
              className="gd-primary"
              onClick={() => {
                setDialog(null);
                setDestination("DEFENSE_PLAYBOOK");
              }}
            >
              Defense Playbook
            </button>
          </DialogFoot>
        </Dialog>
      )}

      {dialog === "NOT_THEIRS" && (
        <Dialog title="We have the ball" onClose={() => setDialog(null)}>
          <p className="gd-body">
            You have possession, so a defensive play can&rsquo;t be called — call an offense
            play. If the ball really is theirs, fix possession from the game bar first.
          </p>
          <DialogFoot>
            <button type="button" className="gd-text" onClick={() => setDialog(null)}>
              Close
            </button>
            <button
              type="button"
              className="gd-primary"
              onClick={() => {
                setDialog(null);
                setDestination("OFFENSE_PLAYBOOK");
              }}
            >
              Offense Playbook
            </button>
          </DialogFoot>
        </Dialog>
      )}
    </div>
  );
}

// ------------------------------------------------------------------------ the game bar

function Scoreboard({
  name,
  points,
  timeouts,
  hasBall,
  onScore,
  onTimeout,
}: {
  name: string;
  points: number;
  timeouts: number;
  hasBall: boolean;
  onScore: () => void;
  onTimeout: () => void;
}) {
  return (
    <div className="gd-team">
      <span className="gd-team-name">{name}</span>
      <div className="gd-team-line">
        <button
          type="button"
          className="gd-pips"
          onClick={onTimeout}
          aria-label={`${name}, ${points} points, ${timeouts} timeouts left.${
            hasBall ? " Has the ball." : ""
          } Tap to use one.`}
        >
          {hasBall && (
            <span className="gd-ball" aria-hidden="true">
              <svg viewBox="0 0 22 12" width="19" height="11">
                <ellipse cx="11" cy="6" rx="10" ry="5.2" fill="none" stroke="#C7F04A" strokeWidth="1.4" />
                <path d="M8 6h6M9.5 4v4M11 3.6v4.8M12.5 4v4" stroke="#C7F04A" strokeWidth="1.1" />
              </svg>
            </span>
          )}
          {Array.from({ length: TIMEOUTS_PER_HALF }, (_, index) => (
            <i key={index} className={index < timeouts ? "is-left" : "is-used"} />
          ))}
        </button>
        <button
          type="button"
          className="gd-points"
          onClick={onScore}
          aria-label={`${name}, ${points} points. Tap to correct the score.`}
        >
          {points}
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------- Quick Stats

function StatRow({
  label,
  sub,
  value,
  indent,
}: {
  label: string;
  sub?: string;
  value: string;
  indent?: boolean;
}) {
  return (
    <p className={indent ? "gd-stat is-indent" : "gd-stat"}>
      <span>
        {label}
        {sub && <small>{sub}</small>}
      </span>
      <strong>{value}</strong>
    </p>
  );
}

function split(value: { plays: number; yards: number }): string {
  return `${value.plays} (${value.yards} yds)`;
}

/**
 * Every row the app prints, in the app's order and format.
 *
 * Plain text rows on purpose: no charts, no icons, no colour-coded numbers and nothing
 * tappable. It is the one surface a coach reads mid-series, and a chart would cost a glance.
 */
function QuickStatsPanel({ stats }: { stats: ReturnType<typeof derive>["quickStats"] }) {
  const empty = stats.offensivePlays.plays === 0 && stats.defensivePlays.plays === 0;
  return (
    <aside className="gd-quick" aria-label="Quick Stats">
      <h3>Quick Stats</h3>
      {empty && (
        <p className="gd-empty">No plays recorded yet. Totals appear here as plays are entered.</p>
      )}

      <h4>Total Plays</h4>
      <StatRow label="Offensive plays" value={split(stats.offensivePlays)} />
      <StatRow label="Defensive plays" value={split(stats.defensivePlays)} />
      <StatRow label="Penalties" sub="yards marched off" value={split(stats.penalties)} />

      <h4>
        Offense<em>Our team</em>
      </h4>
      <StatRow label="Run plays" value={split(stats.ourRun.total)} />
      <StatRow indent label="Left" value={split(stats.ourRun.left)} />
      <StatRow indent label="Middle" value={split(stats.ourRun.middle)} />
      <StatRow indent label="Right" value={split(stats.ourRun.right)} />
      <StatRow indent label="Broken" value={split(stats.ourRun.broken)} />
      <StatRow label="Pass plays" value={split(stats.ourPass)} />
      <StatRow
        label="Yards / play"
        value={stats.yardsPerPlay === null ? "—" : stats.yardsPerPlay.toFixed(1)}
      />
      <StatRow
        label="Success rate"
        sub={`${stats.playsJudged} plays judged`}
        value={stats.successRate === null ? "—" : `${Math.round(stats.successRate * 100)}%`}
      />
      <StatRow label="First downs" value={`${stats.firstDowns}`} />
      <StatRow label="Turnovers" value={`${stats.turnovers}`} />
      <StatRow label="Explosive plays" value={`${stats.explosivePlays}`} />
      <StatRow label="Negative plays" value={`${stats.negativePlays}`} />

      <h4>
        Defense<em>Opponent · yards allowed</em>
      </h4>
      <StatRow label="Opponent run plays" value={split(stats.theirRun.total)} />
      <StatRow indent label="Left" value={split(stats.theirRun.left)} />
      <StatRow indent label="Middle" value={split(stats.theirRun.middle)} />
      <StatRow indent label="Right" value={split(stats.theirRun.right)} />
      <StatRow indent label="Broken" value={split(stats.theirRun.broken)} />
      <StatRow label="Opponent pass plays" value={split(stats.theirPass)} />
      <StatRow
        label="Yards / play allowed"
        value={stats.yardsPerPlayAllowed === null ? "—" : stats.yardsPerPlayAllowed.toFixed(1)}
      />
      <StatRow label="Stops" sub="no gain or less" value={`${stats.stops}`} />
      <StatRow label="Takeaways" value={`${stats.takeaways}`} />
      <StatRow label="Explosive allowed" value={`${stats.explosiveAllowed}`} />
      <StatRow label="TDs allowed" value={`${stats.tdsAllowed}`} />
    </aside>
  );
}

/**
 * The log, which the app itself does not show on game day.
 *
 * It is here because the demo's whole argument is that the numbers are derived, and a
 * visitor cannot check that without something to delete. The app corrects a play by
 * re-entering it; the website's shortcut is a delete, and the recalculation is identical.
 */
function RecentLog({
  rows,
  onRemove,
}: {
  rows: ReturnType<typeof derive>["rows"];
  onRemove: (id: number) => void;
}) {
  return (
    <div className="gd-log">
      <div className="gd-log-head">
        <span>THE EVERY-SNAP LOG</span>
        <b>Every number on this screen is derived from this list</b>
      </div>
      <ul>
        {[...rows].reverse().map((row) => (
          <li key={row.event.id}>
            <span className={row.event.side === "OFFENSE" ? "gd-log-side is-off" : "gd-log-side is-def"}>
              {row.event.side === "OFFENSE" ? "OFF" : "DEF"}
            </span>
            <span className="gd-log-play">
              <b>{row.event.playLabel}</b>
              <small>{chainsLabel(row.situation, row.possession)}</small>
            </span>
            <span className="gd-log-result">
              <b className={row.yards > 0 ? "is-gain" : row.yards < 0 ? "is-loss" : "is-flat"}>
                {row.yards > 0 ? `+${row.yards}` : row.yards}
              </b>
              {row.event.kind !== "PLAY" && <small>{RESULT_KIND_LABELS[row.event.kind]}</small>}
            </span>
            <button
              type="button"
              className="gd-remove"
              onClick={() => onRemove(row.event.id)}
              aria-label={`Delete ${row.event.playLabel} on ${chainsLabel(row.situation, row.possession)}`}
            >
              <span aria-hidden="true">×</span>
            </button>
          </li>
        ))}
      </ul>
      <p className="gd-log-note">
        Delete any entry and watch every number re-derive — the down, the distance, the spot,
        and every play that came after it.
      </p>
    </div>
  );
}

// ------------------------------------------------------------------------- the playbook

function PlaybookScreen({
  side,
  formations,
  calls,
  pending,
  emptyNote,
  footNote,
  specialHeading,
  specialNote,
  specials,
  onFormation,
  onSpecial,
}: {
  side: SideOfBall;
  formations: Formation[];
  calls: Map<string, number>;
  /** A call waiting on its result. The tiles show live call distribution, so it counts. */
  pending: string | null;
  emptyNote: string;
  footNote: string;
  specialHeading: string;
  specialNote: string | null;
  specials: string[];
  onFormation: (formation: Formation) => void;
  onSpecial: (unit: string) => void;
}) {
  // The call is counted the moment it is made, not when its result lands — the tiles are a
  // live picture of what has been called, which is what a coach is checking mid-series.
  const total = [...calls.values()].reduce((sum, count) => sum + count, 0) + (pending ? 1 : 0);
  return (
    <div className="gd-playbook">
      {total === 0 && <p className="gd-empty">{emptyNote}</p>}
      <h4 className="gd-section">Formations</h4>
      <div className="gd-formations">
        {formations.map((formation) => {
          const count =
            (calls.get(formation.label) ?? 0) + (pending === formation.label ? 1 : 0);
          const percent = total > 0 ? Math.round((count / total) * 100) : 0;
          return (
            <div key={formation.id} className="gd-formation-slot">
              <button type="button" className="gd-formation" onClick={() => onFormation(formation)}>
                <span>{formation.label}</span>
                <b>{percent}%</b>
                <small>
                  {count} {count === 1 ? "call" : "calls"}
                </small>
              </button>
              {formation.note && <em className="gd-formation-note">{formation.note}</em>}
            </div>
          );
        })}
      </div>

      <h4 className="gd-section">{specialHeading}</h4>
      {specialNote && <p className="gd-body gd-body-tight">{specialNote}</p>}
      <div className="gd-specials">
        {specials.map((unit) => (
          <button type="button" key={unit} className="gd-special" onClick={() => onSpecial(unit)}>
            {unit}
          </button>
        ))}
      </div>

      <p className="gd-foot">{footNote}</p>
      {side === "DEFENSE" && (
        <p className="gd-foot">
          A defensive front carries no plays under it: the front is the call, and what they did
          with the ball is the result.
        </p>
      )}
    </div>
  );
}

// -------------------------------------------------------------------- the result sheet

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
    <button type="button" className="gd-chip" aria-pressed={selected} onClick={onClick}>
      {label}
    </button>
  );
}

function ResultDialog({
  call,
  draft,
  setDraft,
  situation,
  possession,
  pickingHole,
  setPickingHole,
  onBack,
  onSave,
}: {
  call: Call;
  draft: Draft;
  setDraft: (draft: Draft) => void;
  situation: Situation;
  possession: TeamRef;
  pickingHole: boolean;
  setPickingHole: (picking: boolean) => void;
  onBack: () => void;
  onSave: () => void;
}) {
  const isOffense = call.side === "OFFENSE";
  const isRun = draft.executedAs === "RUN";
  const isPass = draft.executedAs === "PASS";

  /**
   * Placement rides beside run-or-pass rather than below the yardage: it is the second
   * thing the person entering knows, so two taps at the top of the sheet settle what
   * happened and where.
   *
   * Our own carry is the one thing not placed this way — it is placed by hole, further
   * down, which the called play has usually already answered.
   */
  const placementLabel = (() => {
    // A broken play is asked nothing about where it went: nobody followed the design, so
    // there is no side to record and no hole either. The spot below is the whole entry.
    if (draft.kind === "BROKEN") return null;
    if (!isOffense && draft.executedAs === null) return "Which side of the field";
    if (draft.executedAs === null) return null;
    if (isRun) return isOffense ? null : "Which way they ran";
    if (draft.kind === "SACK") return null;
    return isOffense ? "Where we threw it" : "Where they threw it";
  })();

  function chooseCategory(category: Category) {
    const nowRun = category === "RUN";
    const kinds = resultKindsFor(category);
    // An outcome picked under the other category may not be on this one's list — Sack is
    // not offered on a run — and an outcome that settles the category itself cannot survive
    // somebody settling it the other way. Either way it falls back to nothing selected
    // rather than to the head of the new list.
    const kept =
      kinds.includes(draft.kind) && (impliedCategory(draft.kind) ?? category) === category
        ? draft.kind
        : "PLAY";
    setDraft({
      ...draft,
      executedAs: category,
      kind: kept,
      gap: nowRun && kept !== "BROKEN" ? call.designedGap : null,
      gapWasAssumed: nowRun && call.designedGap !== null && kept !== "BROKEN",
      // On defense the direction survives every switch: left is left whether it became a
      // run or a pass. On offense it never does — our carry is placed by hole, so a third
      // picked under "Where we threw it" would be invisible on a run's sheet yet still
      // satisfy the save check.
      location: isOffense ? null : draft.location,
    });
    setPickingHole(false);
  }

  function chooseKind(picked: ResultKind) {
    // Tapping the lit chip puts it out. Every chip claims something specific happened, so a
    // mis-tapped Touchdown needs a way back that is not "pick a different wrong one".
    const chosen: ResultKind = draft.kind === picked ? "PLAY" : picked;
    const implied = impliedCategory(chosen) ?? draft.executedAs;
    const nowRun = implied === "RUN";
    setDraft({
      ...draft,
      kind: chosen,
      executedAs: implied,
      // The Touchdown chip moves the spot itself: a score ends at the goal line, and
      // dragging a thumb the length of the field to say so is entry the chip already
      // answered. Leaving the chip takes the fill back out rather than parking the ball on
      // a goal line nobody observed.
      yards:
        chosen === "TOUCHDOWN"
          ? toGoal(situation, possession)
          : draft.kind === "TOUCHDOWN"
            ? null
            : draft.yards,
      penalty: chosen === "PENALTY" ? (draft.penalty ?? { onUs: false, yards: 5, accepted: true }) : null,
      turnoverType: chosen === "TURNOVER" ? draft.turnoverType : null,
      returnedForTouchdown: chosen === "TURNOVER" && draft.returnedForTouchdown,
      // Nothing was thrown on a sack, and nobody followed the design on a broken play.
      location: chosen === "SACK" || chosen === "BROKEN" ? null : draft.location,
      gap: chosen === "BROKEN" ? null : (draft.gap ?? (nowRun ? call.designedGap : null)),
      gapWasAssumed:
        chosen !== "BROKEN" &&
        (draft.gapWasAssumed || (draft.gap === null && nowRun && call.designedGap !== null)),
    });
  }

  const assumed = draft.gapWasAssumed && !pickingHole && draft.gap !== null;
  const saveable = canSave(draft, isOffense);

  return (
    <Dialog title={call.playLabel} subtitle={chainsLabel(situation, possession)} onClose={onBack} wide>
      <div className="gd-sheet-row">
        <div className="gd-field">
          <span className="gd-field-label">Run or pass</span>
          <div className="gd-chips">
            <Chip label="Run" selected={isRun} onClick={() => chooseCategory("RUN")} />
            <Chip label="Pass" selected={isPass} onClick={() => chooseCategory("PASS")} />
          </div>
        </div>
        {placementLabel && (
          <div className="gd-field">
            <span className="gd-field-label">{placementLabel}</span>
            <div className="gd-chips">
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

      {!isOffense && isRun && draft.kind !== "BROKEN" && (
        <p className="gd-hint">The way the runner went, not the side of our defense.</p>
      )}

      {draft.executedAs === null && draft.kind !== "PENALTY" && (
        <p className="gd-hint">
          Our call does not say what they did — a blitz meets a run as often as a pass. Pick
          what you saw, or pick an outcome that says it for you.
        </p>
      )}

      <div className="gd-field">
        <span className="gd-field-label">Outcome</span>
        <div className="gd-chips">
          {resultKindsFor(draft.executedAs).map((kind) => (
            <Chip
              key={kind}
              label={RESULT_KIND_LABELS[kind]}
              // Null rather than PLAY, so nothing lights up. PLAY has no chip of its own —
              // it is what this row means when none of them is lit.
              selected={draft.kind === kind}
              onClick={() => chooseKind(kind)}
            />
          ))}
        </div>
      </div>

      {draft.kind === "TURNOVER" && (
        <div className="gd-field">
          <span className="gd-field-label">How it was lost</span>
          <div className="gd-chips">
            {(["INTERCEPTION", "FUMBLE"] as TurnoverType[]).map((type) => (
              <Chip
                key={type}
                label={TURNOVER_LABELS[type]}
                selected={draft.turnoverType === type}
                onClick={() => setDraft({ ...draft, turnoverType: type })}
              />
            ))}
          </div>
          {draft.turnoverType === null ? (
            <p className="gd-hint">Pick how it was lost to save.</p>
          ) : (
            <div className="gd-chips gd-chips-stacked">
              <Chip
                label="Ran it back for a touchdown"
                selected={draft.returnedForTouchdown}
                onClick={() => {
                  const on = !draft.returnedForTouchdown;
                  setDraft({
                    ...draft,
                    returnedForTouchdown: on,
                    // Any spot already picked stops describing anything — the ball is in an
                    // end zone — and turning the toggle back off returns the slider
                    // untouched rather than parked on a stale guess.
                    yards: on ? null : draft.yards,
                  });
                }}
              />
            </div>
          )}
        </div>
      )}

      {draft.kind === "PENALTY" && draft.penalty && (
        <div className="gd-field">
          <span className="gd-field-label">Penalty</span>
          <div className="gd-chips">
            <Chip
              label="On us"
              selected={draft.penalty.onUs}
              onClick={() => setDraft({ ...draft, penalty: { ...draft.penalty!, onUs: true } })}
            />
            <Chip
              label="On them"
              selected={!draft.penalty.onUs}
              onClick={() => setDraft({ ...draft, penalty: { ...draft.penalty!, onUs: false } })}
            />
            {[5, 10, 15].map((yards) => (
              <Chip
                key={yards}
                label={`${yards} yards`}
                selected={draft.penalty!.yards === yards}
                onClick={() => setDraft({ ...draft, penalty: { ...draft.penalty!, yards } })}
              />
            ))}
            <Chip
              label={draft.penalty.accepted ? "Accepted" : "Declined"}
              selected={draft.penalty.accepted}
              onClick={() =>
                setDraft({
                  ...draft,
                  penalty: { ...draft.penalty!, accepted: !draft.penalty!.accepted },
                })
              }
            />
          </div>
          <p className="gd-hint">
            An accepted flag walks the ball and replays the down. Declined, nothing moves and
            the flag is only a line in the totals.
          </p>
        </div>
      )}

      {draft.kind !== "INCOMPLETE_PASS" && draft.kind !== "PENALTY" && !draft.returnedForTouchdown && (
        <div className="gd-field">
          <span className="gd-field-label">Where the ball ended</span>
          <YardLineSlider
            situation={situation}
            possession={possession}
            yards={draft.yards}
            onChange={(yards) => setDraft({ ...draft, yards })}
          />
        </div>
      )}

      {isOffense && isRun && draft.kind !== "BROKEN" && draft.kind !== "PENALTY" && (
        <div className="gd-field">
          <span className="gd-field-label">Hole</span>
          {assumed ? (
            <>
              <div className="gd-chips">
                <Chip label={`${gapInfo(draft.gap!).hole} hole`} selected onClick={() => setPickingHole(true)} />
                <button type="button" className="gd-text" onClick={() => setPickingHole(true)}>
                  Went somewhere else
                </button>
              </div>
              <p className="gd-hint">
                The hole this play is designed for. Only change it if you actually saw the back
                go elsewhere.
              </p>
            </>
          ) : (
            <div className="gd-chips">
              {GAPS.map((gap) => (
                <Chip
                  key={gap.id}
                  label={`${gap.hole} hole`}
                  selected={draft.gap === gap.id}
                  onClick={() => setDraft({ ...draft, gap: gap.id, gapWasAssumed: false })}
                />
              ))}
            </div>
          )}
        </div>
      )}

      <DialogFoot>
        <button type="button" className="gd-text" onClick={onBack}>
          ‹&nbsp;Back
        </button>
        <button type="button" className="gd-text is-strong" disabled={!saveable} onClick={onSave}>
          Save
        </button>
      </DialogFoot>
    </Dialog>
  );
}

/**
 * Where the ball ended, entered as a spot rather than typed as a number.
 *
 * The thumb parks on the snap, and a parked thumb is a real answer — the ball ended where it
 * started, which is most stuffed runs. The readout owns the honesty: an untouched slider
 * reads the snap spot and says "no gain", never a dash over a Save that would quietly write
 * one. The goal line is not draggable: a touchdown is one of the things the yardage cannot
 * say on its own, so it is the outcome chip that puts the ball there.
 */
function YardLineSlider({
  situation,
  possession,
  yards,
  onChange,
}: {
  situation: Situation;
  possession: TeamRef;
  yards: number | null;
  onChange: (yards: number) => void;
}) {
  const entered = yards !== null;
  const advance = possession === "THEIRS" ? -1 : 1;
  const start = situation.yardLine;
  const endYardLine = Math.min(GOAL_LINE - 1, Math.max(1, start + (yards ?? 0) * advance));
  const gained = (endYardLine - start) * advance;

  const subtitle =
    gained > 0
      ? `+${gained} yards`
      : gained < 0
        ? `${gained} yards`
        : entered
          ? "no gain"
          : "no gain — move it if the ball moved";

  return (
    <div className="gd-spot">
      <div className="gd-spot-head">
        <button
          type="button"
          className="gd-step"
          onClick={() => onChange((Math.max(1, endYardLine - 1) - start) * advance)}
          aria-label="Back one yard"
        >
          <span aria-hidden="true">←</span>
        </button>
        <div className="gd-spot-read">
          <b className={entered ? undefined : "is-unset"}>{yardLineLabel(endYardLine)}</b>
          <span>
            {subtitle} · from {yardLineLabel(start)}
          </span>
        </div>
        <button
          type="button"
          className="gd-step"
          onClick={() => onChange((Math.min(GOAL_LINE - 1, endYardLine + 1) - start) * advance)}
          aria-label="Forward one yard"
        >
          <span aria-hidden="true">→</span>
        </button>
      </div>
      <input
        type="range"
        className={entered ? "gd-slider" : "gd-slider is-unset"}
        min={1}
        max={GOAL_LINE - 1}
        step={1}
        value={endYardLine}
        onChange={(change) => onChange((Number(change.target.value) - start) * advance)}
        aria-label="Where the ball ended"
        aria-valuetext={`${yardLineLabel(endYardLine)}, ${subtitle}`}
      />
      <div className="gd-spot-scale" aria-hidden="true">
        <span>Own goal</span>
        <span>Their goal</span>
      </div>
    </div>
  );
}

// --------------------------------------------------------------------------- analytics

function TierChip({ tier }: { tier: Insight["tier"] }) {
  return <i className={`gd-tier is-${tier.toLowerCase()}`}>{tier}</i>;
}

function heat(average: number | null, best: number | null): string {
  if (average === null) return "is-empty";
  if (average < 0) return "is-cold";
  if (best === null || best <= 0) return "is-low";
  const ratio = average / best;
  if (ratio >= 0.999) return "is-best";
  if (ratio >= 0.66) return "is-high";
  if (ratio >= 0.33) return "is-mid";
  return "is-low";
}

function AnalyticsScreen({
  analytics,
  side,
}: {
  analytics: ReturnType<typeof derive>["offense"];
  side: SideOfBall;
}) {
  const isOffense = side === "OFFENSE";
  if (!analytics.hasPlays) {
    return (
      <p className="gd-body">
        {isOffense
          ? "No offensive plays recorded yet. Observations appear here as plays are entered, and the totals build on Home's Quick Stats panel."
          : "No defensive snaps recorded yet. Observations appear here as the opponent's plays are entered, and the totals build on Home's Quick Stats panel."}
      </p>
    );
  }

  return (
    <div className="gd-analytics">
      <h4 className="gd-section">What the game is telling you</h4>
      <p className="gd-body gd-body-tight">Every claim shows the sample it rests on.</p>
      <div className="gd-insights">
        {analytics.insights.map((insight) => (
          <article key={insight.title} className="gd-insight">
            <header>
              <span>{insight.title}</span>
              <TierChip tier={insight.tier} />
            </header>
            <b>{insight.subject}</b>
            <strong>{insight.metric}</strong>
            <small>{insight.detail}</small>
          </article>
        ))}
      </div>

      {isOffense && (
        <>
          <h5 className="gd-subsection">Every hole · Odd left, even right</h5>
          <div className="gd-front">
            <div className="gd-front-row">
              {analytics.holes.map((hole, index) => (
                <div className="gd-front-cell" key={hole.gap}>
                  <div className={`gd-hole ${heat(hole.average, analytics.bestHoleAverage)}`}>
                    <span>{hole.hole} hole</span>
                    <b>{hole.average === null ? "—" : hole.average.toFixed(1)}</b>
                    {hole.average !== null && <em>avg</em>}
                    <small>
                      {hole.carries === 0
                        ? "no carries"
                        : `${hole.carries} car`}
                    </small>
                  </div>
                  {index < LINE_POSITIONS.length && (
                    <span className="gd-lineman" aria-hidden="true">
                      {LINE_POSITIONS[index]}
                    </span>
                  )}
                </div>
              ))}
            </div>
            <p className="gd-foot">
              Shading shows yards per carry relative to the best hole here. Every hole prints
              its own numbers, so nothing depends on the shading alone.
            </p>
          </div>
        </>
      )}

      <h5 className="gd-subsection">{isOffense ? "Left · Middle · Right" : "Where they run"}</h5>
      <div className="gd-thirds">
        <span className="gd-ball-pill">Ball</span>
        <div className="gd-thirds-row">
          {analytics.sides.map((row) => (
            <div key={row.side} className={`gd-third ${heat(row.average, analytics.bestSideAverage)}`}>
              <span>{row.label}</span>
              <b>{row.average === null ? "—" : row.average.toFixed(1)}</b>
              {row.average !== null && <em>avg</em>}
              <small>{row.carries === 0 ? "no carries" : `${row.carries} car`}</small>
            </div>
          ))}
        </div>
        <p className="gd-foot">
          {isOffense
            ? "The same carries as above, gathered into three. Drawn as equal thirds because the geometry of the front is the picture above this one, not this one."
            : "The opponent's runs against us, as left, middle or right. Which gap the back hit on somebody else's front is not something anyone can call from a sideline, so it is not asked for and not shown."}
        </p>
      </div>
    </div>
  );
}

// ------------------------------------------------------------------------- white board

/** Draw something on the fly. Nothing is saved — the app's own promise, kept here too. */
function WhiteBoard() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const drawing = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const scale = window.devicePixelRatio || 1;
    canvas.width = canvas.clientWidth * scale;
    canvas.height = canvas.clientHeight * scale;
    const context = canvas.getContext("2d");
    if (!context) return;
    context.scale(scale, scale);
    context.strokeStyle = "#EAEEF4";
    context.lineWidth = 2.5;
    context.lineCap = "round";
    context.lineJoin = "round";
  }, []);

  function point(event: React.PointerEvent<HTMLCanvasElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  }

  return (
    <div className="gd-board">
      <canvas
        ref={canvasRef}
        onPointerDown={(event) => {
          drawing.current = true;
          event.currentTarget.setPointerCapture(event.pointerId);
          const context = event.currentTarget.getContext("2d");
          const { x, y } = point(event);
          context?.beginPath();
          context?.moveTo(x, y);
        }}
        onPointerMove={(event) => {
          if (!drawing.current) return;
          const context = event.currentTarget.getContext("2d");
          const { x, y } = point(event);
          context?.lineTo(x, y);
          context?.stroke();
        }}
        onPointerUp={() => {
          drawing.current = false;
        }}
      />
      <div className="gd-board-foot">
        <p className="gd-foot">Draw something on the fly. Nothing is saved.</p>
        <button
          type="button"
          className="gd-text"
          onClick={() => {
            const canvas = canvasRef.current;
            const context = canvas?.getContext("2d");
            if (canvas && context) context.clearRect(0, 0, canvas.width, canvas.height);
          }}
        >
          Clear
        </button>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------------- dialogs

function Dialog({
  title,
  subtitle,
  children,
  onClose,
  wide,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  onClose: () => void;
  wide?: boolean;
}) {
  // Escape is bound on the document rather than on the dialog, so it closes whether or not
  // focus has landed inside yet. The backdrop is a real button rather than a clickable div,
  // so tapping outside is an affordance a keyboard can reach too.
  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="gd-scrim">
      <button type="button" className="gd-scrim-back" aria-label="Close" onClick={onClose} />
      <div className={wide ? "gd-dialog is-wide" : "gd-dialog"} role="dialog" aria-modal="true" aria-label={title}>
        <h4>{title}</h4>
        {subtitle && <p className="gd-dialog-sub">{subtitle}</p>}
        {children}
      </div>
    </div>
  );
}

function DialogFoot({ children }: { children: React.ReactNode }) {
  return <div className="gd-dialog-foot">{children}</div>;
}

function Stepper({
  label,
  value,
  onChange,
  min = 0,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
}) {
  return (
    <div className="gd-stepper">
      <span className="gd-field-label">{label}</span>
      <div className="gd-stepper-row">
        <b>{value}</b>
        <button type="button" onClick={() => onChange(Math.max(min, value - 1))} aria-label={`${label} down`}>
          −
        </button>
        <button type="button" onClick={() => onChange(value + 1)} aria-label={`${label} up`}>
          +
        </button>
      </div>
    </div>
  );
}

/**
 * Down, distance and spot, set by hand.
 *
 * The one thing worth being honest about before somebody leans on this all afternoon: it
 * fixes the down, not the statistics behind it.
 */
function ChainsDialog({
  situation,
  possession,
  onClose,
  onSet,
}: {
  situation: Situation;
  possession: TeamRef;
  onClose: () => void;
  onSet: (situation: Situation) => void;
}) {
  const [draft, setDraft] = useState<Situation>(situation);
  const goal = toGoal(draft, possession);
  return (
    <Dialog
      title="Down and distance"
      subtitle={`Now: ${chainsLabel(situation, possession)}`}
      onClose={onClose}
    >
      <p className="gd-dialog-lead">
        {downAndDistanceLabel(draft, possession)} at {yardLineLabel(draft.yardLine)}
      </p>
      <p className="gd-body gd-body-tight">
        This sets the chains only. A play entered wrong still counts wrong in the totals until
        the play itself is re-entered.
      </p>
      <button
        type="button"
        className="gd-primary gd-primary-block"
        onClick={() =>
          setDraft({ ...draft, down: 1, distance: Math.min(FIRST_DOWN_DISTANCE, goal) })
        }
      >
        1st &amp; 10 here
      </button>
      <div className="gd-field">
        <span className="gd-field-label">Down</span>
        <div className="gd-chips">
          {[1, 2, 3, 4].map((down) => (
            <Chip
              key={down}
              label={down === 1 ? "1st" : down === 2 ? "2nd" : down === 3 ? "3rd" : "4th"}
              selected={draft.down === down}
              onClick={() => setDraft({ ...draft, down })}
            />
          ))}
        </div>
      </div>
      <Stepper
        label="To go"
        value={draft.distance}
        onChange={(distance) => setDraft({ ...draft, distance })}
      />
      <div className="gd-field">
        <span className="gd-field-label">Ball on</span>
        <div className="gd-spot-head">
          <button
            type="button"
            className="gd-step"
            onClick={() => setDraft({ ...draft, yardLine: Math.max(1, draft.yardLine - 1) })}
            aria-label="Back one yard"
          >
            <span aria-hidden="true">←</span>
          </button>
          <div className="gd-spot-read">
            <b>{yardLineLabel(draft.yardLine)}</b>
          </div>
          <button
            type="button"
            className="gd-step"
            onClick={() =>
              setDraft({ ...draft, yardLine: Math.min(GOAL_LINE - 1, draft.yardLine + 1) })
            }
            aria-label="Forward one yard"
          >
            <span aria-hidden="true">→</span>
          </button>
        </div>
        <input
          type="range"
          className="gd-slider"
          min={1}
          max={GOAL_LINE - 1}
          value={draft.yardLine}
          onChange={(change) => setDraft({ ...draft, yardLine: Number(change.target.value) })}
          aria-label="Ball on"
        />
      </div>
      <DialogFoot>
        <button type="button" className="gd-text" onClick={onClose}>
          Cancel
        </button>
        <button type="button" className="gd-text is-strong" onClick={() => onSet(draft)}>
          Set the chains
        </button>
      </DialogFoot>
    </Dialog>
  );
}

function ScoreDialog({
  us,
  them,
  onClose,
  onPossession,
  onSet,
}: {
  us: number;
  them: number;
  onClose: () => void;
  onPossession: () => void;
  onSet: (us: number, them: number) => void;
}) {
  const [ours, setOurs] = useState(us);
  const [theirs, setTheirs] = useState(them);
  return (
    <Dialog title="Correct the score" subtitle={`Now: ${OUR_TEAM} ${us} — ${OPPONENT} ${them}`} onClose={onClose}>
      <p className="gd-body gd-body-tight">
        This sets the scoreboard only. Scores recorded from here add on top of it, and the
        plays already in the log keep their story.
      </p>
      <Stepper label={OUR_TEAM} value={ours} onChange={setOurs} />
      <Stepper label={OPPONENT} value={theirs} onChange={setTheirs} />
      <button type="button" className="gd-text gd-text-block" onClick={onPossession}>
        The wrong team has the ball
      </button>
      <DialogFoot>
        <button type="button" className="gd-text" onClick={onClose}>
          Cancel
        </button>
        <button
          type="button"
          className="gd-text is-strong"
          disabled={ours === us && theirs === them}
          onClick={() => onSet(ours, theirs)}
        >
          Set the score
        </button>
      </DialogFoot>
    </Dialog>
  );
}

function PossessionDialog({
  possession,
  onClose,
  onSet,
}: {
  possession: TeamRef;
  onClose: () => void;
  onSet: (possession: TeamRef) => void;
}) {
  return (
    <Dialog title="Whose ball is it?" onClose={onClose}>
      <p className="gd-body gd-body-tight">
        This moves the ball only. Plays already recorded keep their numbers, and no kickoff or
        try question follows.
      </p>
      <div className="gd-chips">
        <Chip label={`${OUR_TEAM} — ours`} selected={possession === "OURS"} onClick={() => onSet("OURS")} />
        <Chip label={`${OPPONENT} — theirs`} selected={possession === "THEIRS"} onClick={() => onSet("THEIRS")} />
      </div>
      <DialogFoot>
        <button type="button" className="gd-text" onClick={onClose}>
          Cancel
        </button>
      </DialogFoot>
    </Dialog>
  );
}

/**
 * A missed try is recorded exactly as loudly as a good one: without it the log cannot tell a
 * miss from a question nobody has answered. Only our made kick is volt — their conversion is
 * not the answer a coach is hoping for, and leading with it would be the app cheering for
 * the wrong side.
 */
function TryDialog({
  ours,
  opponent,
  onRecord,
}: {
  ours: boolean;
  opponent: string;
  onRecord: (kind: "EXTRA_POINT" | "TWO_POINT", good: boolean) => void;
}) {
  const [twoOpen, setTwoOpen] = useState(false);
  return (
    <Dialog
      title={ours ? "Touchdown — the try" : `${opponent} scored — their try`}
      onClose={() => undefined}
    >
      <p className="gd-body gd-body-tight">
        {ours ? "Six is on the board. What happened after it?" : "Six is on their board. What happened after it?"}
      </p>
      <span className="gd-field-label">Extra point</span>
      <div className="gd-try-row">
        <button
          type="button"
          className={ours ? "gd-try is-emphasised" : "gd-try"}
          onClick={() => onRecord("EXTRA_POINT", true)}
        >
          <b>Good</b>
          <small>{ours ? "The kick is good, 1 point" : "Their kick is good, 1 point"}</small>
        </button>
        <button type="button" className="gd-try" onClick={() => onRecord("EXTRA_POINT", false)}>
          <b>No good</b>
          <small>{ours ? "The kick missed" : "Their kick missed"}</small>
        </button>
      </div>
      <span className="gd-field-label">Two-point conversion</span>
      <button type="button" className="gd-try is-block" onClick={() => setTwoOpen(!twoOpen)}>
        <b>{ours ? "Go for two" : "They went for two"}</b>
        <small>{twoOpen ? "Hide the two-point answer" : "Answer the two-point conversion"}</small>
      </button>
      {twoOpen && (
        <div className="gd-try-row">
          <button type="button" className="gd-try" onClick={() => onRecord("TWO_POINT", true)}>
            <b>Converted</b>
            <small>Two points</small>
          </button>
          <button type="button" className="gd-try" onClick={() => onRecord("TWO_POINT", false)}>
            <b>No good</b>
            <small>Nothing added</small>
          </button>
        </div>
      )}
    </Dialog>
  );
}

function PuntDialog({
  ours,
  situation,
  onClose,
  onSet,
}: {
  ours: boolean;
  situation: Situation;
  onClose: () => void;
  onSet: (yardLine: number) => void;
}) {
  const [yardLine, setYardLine] = useState(
    Math.min(GOAL_LINE - 1, Math.max(1, ours ? situation.yardLine + 35 : situation.yardLine - 35)),
  );
  return (
    <Dialog
      title={ours ? "Where did the punt end?" : "Where does our drive start?"}
      onClose={onClose}
    >
      <p className="gd-body gd-body-tight">
        The kick itself is not recorded, so this is the only part of one that matters: where
        the ball is for the next snap.
      </p>
      <div className="gd-spot-head">
        <button
          type="button"
          className="gd-step"
          onClick={() => setYardLine(Math.max(1, yardLine - 1))}
          aria-label="Back one yard"
        >
          <span aria-hidden="true">←</span>
        </button>
        <div className="gd-spot-read">
          <b>{yardLineLabel(yardLine)}</b>
        </div>
        <button
          type="button"
          className="gd-step"
          onClick={() => setYardLine(Math.min(GOAL_LINE - 1, yardLine + 1))}
          aria-label="Forward one yard"
        >
          <span aria-hidden="true">→</span>
        </button>
      </div>
      <input
        type="range"
        className="gd-slider"
        min={1}
        max={GOAL_LINE - 1}
        value={yardLine}
        onChange={(change) => setYardLine(Number(change.target.value))}
        aria-label="Where the ball ended"
      />
      <DialogFoot>
        <button type="button" className="gd-text" onClick={onClose}>
          Cancel
        </button>
        <button type="button" className="gd-text is-strong" onClick={() => onSet(yardLine)}>
          Set the spot
        </button>
      </DialogFoot>
    </Dialog>
  );
}

function FieldGoalDialog({
  situation,
  onClose,
  onSet,
}: {
  situation: Situation;
  onClose: () => void;
  onSet: (good: boolean) => void;
}) {
  const attempt = GOAL_LINE - situation.yardLine + 17;
  return (
    <Dialog title="Field goal" subtitle={`About ${attempt} yards from ${yardLineLabel(situation.yardLine)}`} onClose={onClose}>
      <p className="gd-body gd-body-tight">
        A miss is recorded as loudly as a make: without it the log cannot tell a miss from a
        question nobody answered.
      </p>
      <div className="gd-try-row">
        <button type="button" className="gd-try is-emphasised" onClick={() => onSet(true)}>
          <b>Good</b>
          <small>Three points, then they receive</small>
        </button>
        <button type="button" className="gd-try" onClick={() => onSet(false)}>
          <b>No good</b>
          <small>Their ball at the spot</small>
        </button>
      </div>
      <DialogFoot>
        <button type="button" className="gd-text" onClick={onClose}>
          Cancel
        </button>
      </DialogFoot>
    </Dialog>
  );
}

/**
 * Suggest a play, and — more importantly — what the app refuses to pretend.
 *
 * With nothing called twice there is nothing to compare, and it says so rather than ranking
 * single attempts against each other.
 */
function SuggestDialog({
  derived,
  catalogue,
  situation,
  possession,
  onClose,
  onCall,
}: {
  derived: ReturnType<typeof derive>;
  catalogue: { playId: string; playLabel: string; formationLabel: string }[];
  situation: Situation;
  possession: TeamRef;
  onClose: () => void;
  onCall: (playId: string) => void;
}) {
  const [need, setNeed] = useState<null | "FIRST_DOWN" | "TOUCHDOWN">(null);
  const set = useMemo(() => suggestPlays(derived, catalogue), [derived, catalogue]);
  const goal = toGoal(situation, possession);

  return (
    <Dialog title="Suggest a play" subtitle={chainsLabel(situation, possession)} onClose={onClose}>
      {need === null ? (
        <>
          <p className="gd-dialog-lead is-small">What do you need?</p>
          <button type="button" className="gd-need" onClick={() => setNeed("FIRST_DOWN")}>
            First down ·{" "}
            {isGoalToGo(situation, possession) ? `${goal} yards` : `${situation.distance} yards`}
          </button>
          <button type="button" className="gd-need" onClick={() => setNeed("TOUCHDOWN")}>
            Touchdown · {goal} yards
          </button>
        </>
      ) : (
        <>
          <p className="gd-body gd-body-tight">{set.lead}</p>
          {set.suggestions.length === 0 ? (
            <p className="gd-empty">
              Nothing has been called yet, so there is nothing to rank. Call a play and ask
              again.
            </p>
          ) : (
            <ul className="gd-playlist">
              {set.suggestions.map((suggestion) => (
                <li key={suggestion.playId}>
                  <div>
                    <b>
                      {suggestion.formationLabel} · {suggestion.playLabel}
                    </b>
                    <small>
                      {suggestion.calls} called
                      {suggestion.average !== null &&
                        ` · usually ${Math.round(suggestion.average)} yds`}
                    </small>
                  </div>
                  <button type="button" className="gd-call" onClick={() => onCall(suggestion.playId)}>
                    Call
                  </button>
                </li>
              ))}
            </ul>
          )}
          <p className="gd-foot">
            Only today&rsquo;s game is behind these numbers — games are not kept between
            fixtures in this demo, so treat a small sample as a small sample.
          </p>
        </>
      )}
      <DialogFoot>
        <button type="button" className="gd-text" onClick={onClose}>
          Close
        </button>
        {need !== null && (
          <button type="button" className="gd-text is-strong" onClick={() => setNeed(null)}>
            Ask again
          </button>
        )}
      </DialogFoot>
    </Dialog>
  );
}
