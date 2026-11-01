import { CartesianGrid, Line, LineChart, ResponsiveContainer, XAxis, YAxis } from "recharts";
import { dropoffRows } from "./arsenalData";

const TICK = { fill: "var(--muted)", fontFamily: "IBM Plex Mono, monospace", fontSize: 11 };

/** Damage drop-off of one or two items (slot A cyan solid, slot B amber dashed), 0–100 m. */
export default function DropoffChart({ a, b, height = 232 }) {
  const rows = dropoffRows(a, b);
  const hasA = rows.some((r) => r.a != null);
  const hasB = rows.some((r) => r.b != null);

  if (!hasA && !hasB) {
    return (
      <div className="flex items-center justify-center border border-line bg-inset font-mono text-[12px] uppercase tracking-[0.1em] text-muted" style={{ height }}>
        No drop-off data yet
      </div>
    );
  }

  return (
    <div className="border border-line bg-inset px-2 pt-3" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%" initialDimension={{ width: 480, height }}>
        <LineChart data={rows} margin={{ top: 8, right: 18, bottom: 4, left: 0 }}>
          <CartesianGrid vertical={false} stroke="var(--line)" />
          <XAxis
            dataKey="distance"
            type="number"
            domain={[0, 100]}
            ticks={[0, 50, 100]}
            tickFormatter={(v) => `${v}m`}
            tick={TICK}
            axisLine={false}
            tickLine={false}
          />
          <YAxis tick={TICK} axisLine={false} tickLine={false} width={42} domain={[0, "auto"]} />
          {hasA ? <Line type="linear" dataKey="a" name={a.name} stroke="var(--cyan)" strokeWidth={2} dot={false} isAnimationActive={false} /> : null}
          {hasB ? (
            <Line type="linear" dataKey="b" name={b.name} stroke="var(--accent-2)" strokeWidth={2} strokeDasharray="6 4" dot={false} isAnimationActive={false} />
          ) : null}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
