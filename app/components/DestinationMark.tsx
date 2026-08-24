/**
 * The navigation marks, drawn from the same geometry as the app's `DestinationMark`.
 *
 * The app draws these on a Canvas rather than shipping an icon set — deliberately plain
 * shapes, because the iconography has never been approved. Every number below is the
 * Kotlin's own fraction of the canvas, on a 100x100 box: stroke 9 with round caps, chevrons
 * at x 32/62 doubled 22 apart, bars 16 wide with a 10 gap on a baseline at 78.
 *
 * They are decorative — every tile carries its text label, and that label is what a screen
 * reader announces.
 */

const STROKE = 9;

function Home() {
  return (
    <rect
      x={22}
      y={22}
      width={56}
      height={56}
      fill="none"
      stroke="currentColor"
      strokeWidth={STROKE}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  );
}

/** Two chevrons: the offense drives one way down the field, the defense faces the other. */
function Chevrons({ pointsRight }: { pointsRight: boolean }) {
  const midY = 50;
  const armY = 24;
  const near = 32;
  const far = 62;
  return (
    <>
      {[0, 22].map((shift) => {
        const start = pointsRight ? near + shift : 100 - near - shift;
        const tip = pointsRight ? far + shift : 100 - far - shift;
        return (
          <path
            key={shift}
            d={`M${start} ${midY - armY} L${tip} ${midY} L${start} ${midY + armY}`}
            fill="none"
            stroke="currentColor"
            strokeWidth={STROKE}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        );
      })}
    </>
  );
}

/** Three filled bars — ascending for what we did, descending for what was done to us. */
function Bars({ ascending }: { ascending: boolean }) {
  const width = 16;
  const gap = 10;
  const startX = (100 - (width * 3 + gap * 2)) / 2;
  const baseline = 78;
  const heights = ascending ? [24, 40, 56] : [56, 40, 24];
  return (
    <>
      {heights.map((height, index) => (
        <rect
          key={index}
          x={startX + index * (width + gap)}
          y={baseline - height}
          width={width}
          height={height}
          fill="currentColor"
        />
      ))}
    </>
  );
}

/** A board with a stroke across it: something drawn, shown, and wiped. */
function Board() {
  return (
    <>
      <rect
        x={18}
        y={18}
        width={64}
        height={57.6}
        fill="none"
        stroke="currentColor"
        strokeWidth={STROKE}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M34 60 L50 38 L68 56"
        fill="none"
        stroke="currentColor"
        strokeWidth={STROKE}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </>
  );
}

export type DestinationId =
  | "HOME"
  | "OFFENSE_PLAYBOOK"
  | "OFFENSIVE_ANALYTICS"
  | "DEFENSE_PLAYBOOK"
  | "DEFENSE_ANALYTICS"
  | "WHITE_BOARD";

export function DestinationMark({ destination }: { destination: DestinationId }) {
  return (
    <svg viewBox="0 0 100 100" width={26} height={26} aria-hidden="true" focusable="false">
      {destination === "HOME" && <Home />}
      {destination === "OFFENSE_PLAYBOOK" && <Chevrons pointsRight />}
      {destination === "DEFENSE_PLAYBOOK" && <Chevrons pointsRight={false} />}
      {destination === "OFFENSIVE_ANALYTICS" && <Bars ascending />}
      {destination === "DEFENSE_ANALYTICS" && <Bars ascending={false} />}
      {destination === "WHITE_BOARD" && <Board />}
    </svg>
  );
}
