/** Practice graphic texts drawn with theme tokens so they read in light and dark mode. */

export const SCREEN_DATA = [
  { grade: 'Grade 9', hours: 4.6 },
  { grade: 'Grade 10', hours: 5.0 },
  { grade: 'Grade 11', hours: 5.4 },
  { grade: 'Grade 12', hours: 5.8 },
];

export function ScreenTimeChart({ fullAxis }: { fullAxis: boolean }) {
  const yMin = fullAxis ? 0 : 4;
  const yMax = 6;
  const top = 46;
  const bottom = 214;
  const left = 48;
  const right = 330;
  const y = (v: number) => bottom - ((v - yMin) / (yMax - yMin)) * (bottom - top);
  const ticks = fullAxis ? [0, 1, 2, 3, 4, 5, 6] : [4, 4.5, 5, 5.5, 6];
  const bw = 44;
  const step = (right - left) / SCREEN_DATA.length;
  return (
    <svg viewBox="0 0 345 262" className="block h-auto w-full" role="img" aria-label={`Bar chart of daily screen time by grade, y-axis starting at ${yMin} hours`}>
      <text x="8" y="18" className="fill-ink font-display" fontSize="14" fontWeight="700">SCREEN TIME EXPLODES IN SENIOR YEARS</text>
      <text x="8" y="34" className="fill-muted" fontSize="9.5">Average daily recreational screen time (hours), by grade</text>
      {ticks.map((t) => (
        <g key={t}>
          <line x1={left} x2={right} y1={y(t)} y2={y(t)} className="stroke-line" strokeWidth="1" />
          <text x={left - 6} y={y(t) + 3} textAnchor="end" className="num fill-muted" fontSize="9">{t}</text>
        </g>
      ))}
      {SCREEN_DATA.map((d, i) => {
        const cx = left + step * i + step / 2;
        return (
          <g key={d.grade}>
            <rect x={cx - bw / 2} y={y(d.hours)} width={bw} height={bottom - y(d.hours)} rx="2" className={i === 3 ? 'fill-pen' : 'fill-strandB'} />
            <text x={cx} y={y(d.hours) - 5} textAnchor="middle" className="num fill-ink" fontSize="10" fontWeight="700">{d.hours.toFixed(1)}</text>
            <text x={cx} y={bottom + 14} textAnchor="middle" className="fill-ink" fontSize="9.5">{d.grade}</text>
          </g>
        );
      })}
      <line x1={left} x2={left} y1={top - 4} y2={bottom} className="stroke-ink" strokeWidth="1.2" />
      <line x1={left} x2={right} y1={bottom} y2={bottom} className="stroke-ink" strokeWidth="1.2" />
      <text x="12" y={(top + bottom) / 2} transform={`rotate(-90 12 ${(top + bottom) / 2})`} textAnchor="middle" className="fill-muted" fontSize="9">Hours per day</text>
      <text x="8" y="254" className="fill-muted" fontSize="8.5">Source: Northview student survey, 2025 (n = 400). Practice data.</text>
    </svg>
  );
}

export function FloorPlan() {
  // 6 px = 1 m
  const room = 'fill-surface stroke-ink';
  return (
    <svg viewBox="0 0 345 290" className="block h-auto w-full" role="img" aria-label="Evacuation floor plan of a school wing with rooms, a corridor, two exits, alarm pulls, extinguishers, a scale bar and a north arrow">
      <text x="8" y="16" className="fill-ink font-display" fontSize="13" fontWeight="700">EMERGENCY EVACUATION · EAST WING, FLOOR 1</text>
      <g strokeWidth="1.4">
        <rect x="20" y="30" width="80" height="80" className={room} />
        <rect x="100" y="30" width="80" height="80" className={room} />
        <rect x="180" y="30" width="80" height="80" className={room} />
        <rect x="260" y="30" width="60" height="80" className={room} />
        <rect x="20" y="140" width="120" height="80" className={room} />
        <rect x="140" y="140" width="60" height="80" className={room} />
        <rect x="200" y="140" width="60" height="80" className={room} />
        <rect x="260" y="140" width="60" height="80" className={room} />
        <rect x="20" y="110" width="300" height="30" className="fill-sunken stroke-ink" />
      </g>
      <g className="fill-ink" fontSize="9" textAnchor="middle">
        <text x="60" y="74">Room 104</text>
        <text x="140" y="60">Room 105</text>
        <text x="220" y="74">Room 106</text>
        <text x="290" y="74">Office</text>
        <text x="80" y="184">Science Lab</text>
        <text x="170" y="184">Washrooms</text>
        <text x="230" y="184">Stairwell</text>
        <text x="290" y="184">Library</text>
        <text x="170" y="129" className="fill-muted" fontSize="8">CORRIDOR</text>
      </g>
      {/* doors */}
      <g className="stroke-surface" strokeWidth="3">
        <line x1="52" x2="66" y1="110" y2="110" />
        <line x1="133" x2="147" y1="110" y2="110" />
        <line x1="213" x2="227" y1="110" y2="110" />
        <line x1="283" x2="297" y1="110" y2="110" />
        <line x1="73" x2="87" y1="140" y2="140" />
        <line x1="223" x2="237" y1="140" y2="140" />
      </g>
      {/* you are here */}
      <g>
        <path d="M140 78 l3.2 6.6 7.2 1 -5.2 5 1.3 7.2 -6.5 -3.4 -6.5 3.4 1.3 -7.2 -5.2 -5 7.2 -1 z" className="fill-pen" />
        <text x="140" y="108" textAnchor="middle" className="fill-pen" fontSize="8" fontWeight="700">YOU ARE HERE</text>
      </g>
      {/* exits */}
      <g>
        <rect x="2" y="114" width="18" height="22" rx="2" className="fill-good" />
        <text x="11" y="128" textAnchor="middle" className="fill-surface" fontSize="7" fontWeight="700">A</text>
        <text x="11" y="150" textAnchor="middle" className="fill-good" fontSize="7.5" fontWeight="700">EXIT A</text>
        <rect x="320" y="114" width="18" height="22" rx="2" className="fill-good" />
        <text x="329" y="128" textAnchor="middle" className="fill-surface" fontSize="7" fontWeight="700">B</text>
        <text x="326" y="150" textAnchor="middle" className="fill-good" fontSize="7.5" fontWeight="700">EXIT B</text>
      </g>
      {/* alarm pulls */}
      {[
        [26, 113],
        [305, 113],
      ].map(([x, yy]) => (
        <g key={x}>
          <rect x={x} y={yy} width="9" height="9" className="fill-bad" />
          <text x={x + 4.5} y={yy + 7.2} textAnchor="middle" className="fill-surface" fontSize="6.5" fontWeight="700">A</text>
        </g>
      ))}
      {/* extinguishers */}
      {[
        [180, 132],
        [104, 132],
      ].map(([x, yy]) => (
        <g key={x}>
          <circle cx={x} cy={yy} r="5" className="fill-bad" />
          <text x={x} y={yy + 2.5} textAnchor="middle" className="fill-surface" fontSize="6.5" fontWeight="700">F</text>
        </g>
      ))}
      {/* first aid */}
      <g>
        <rect x="300" y="38" width="12" height="12" rx="2" className="fill-good" />
        <path d="M306 41 v6 M303 44 h6" className="stroke-surface" strokeWidth="1.8" />
      </g>
      {/* assembly arrow */}
      <path d="M11 110 V 34" className="stroke-good" strokeWidth="1.6" strokeDasharray="3 3" fill="none" />
      <path d="M7 38 l4 -6 4 6 z" className="fill-good" />
      <text x="16" y="27" className="fill-good" fontSize="8" fontWeight="700">ASSEMBLY POINT: NORTH SOCCER FIELD</text>
      {/* north arrow */}
      <g transform="translate(318 238)">
        <path d="M0 -14 l6 14 -6 -4 -6 4 z" className="fill-ink" />
        <text x="0" y="12" textAnchor="middle" className="fill-ink" fontSize="9" fontWeight="700">N</text>
      </g>
      {/* scale */}
      <g transform="translate(20 236)">
        <rect x="0" y="0" width="30" height="5" className="fill-ink" />
        <rect x="30" y="0" width="30" height="5" className="fill-surface stroke-ink" strokeWidth="1" />
        <text x="0" y="16" className="fill-ink num" fontSize="8">0</text>
        <text x="30" y="16" textAnchor="middle" className="fill-ink num" fontSize="8">5</text>
        <text x="60" y="16" textAnchor="middle" className="fill-ink num" fontSize="8">10 m</text>
      </g>
      {/* legend */}
      <g transform="translate(96 232)" fontSize="8" className="fill-ink">
        <rect x="0" y="0" width="9" height="9" className="fill-bad" />
        <text x="13" y="8">Fire alarm pull</text>
        <circle cx="4.5" cy="20" r="4.5" className="fill-bad" />
        <text x="13" y="23">Extinguisher</text>
        <rect x="80" y="0" width="9" height="9" rx="1.5" className="fill-good" />
        <text x="93" y="8">Exit / first aid</text>
        <path d="M84 20 l3.2 -1 1 -3 1 3 3.2 1 -3.2 1 -1 3 -1 -3 z" className="fill-pen" />
        <text x="93" y="23">You are here</text>
      </g>
      <text x="8" y="284" className="fill-muted" fontSize="8.5">Practice floor plan. Not a real building.</text>
    </svg>
  );
}

export const SHIRT_DATA = [
  { label: 'Retailer', pct: 59, cls: 'fill-strandB' },
  { label: 'Brand', pct: 12, cls: 'fill-strandD' },
  { label: 'Materials', pct: 12, cls: 'fill-strandC' },
  { label: 'Transport & taxes', pct: 12, cls: 'fill-strandA' },
  { label: 'Factory costs', pct: 4, cls: 'fill-muted' },
  { label: 'Worker wages', pct: 1, cls: 'fill-pen' },
];

export function ShirtDonut() {
  const cx = 100;
  const cy = 130;
  const r = 70;
  const inner = 42;
  let acc = 0;
  const arc = (start: number, end: number) => {
    const a0 = (start / 100) * Math.PI * 2 - Math.PI / 2;
    const a1 = (end / 100) * Math.PI * 2 - Math.PI / 2;
    const large = end - start > 50 ? 1 : 0;
    const p = (rad: number, a: number) => `${cx + rad * Math.cos(a)},${cy + rad * Math.sin(a)}`;
    return `M${p(r, a0)} A${r},${r} 0 ${large} 1 ${p(r, a1)} L${p(inner, a1)} A${inner},${inner} 0 ${large} 0 ${p(inner, a0)} Z`;
  };
  return (
    <svg viewBox="0 0 345 262" className="block h-auto w-full" role="img" aria-label="Donut chart showing where the money from a seven-dollar T-shirt goes, with worker wages at one percent">
      <text x="8" y="18" className="fill-ink font-display" fontSize="14" fontWeight="700">WHERE YOUR $7 T-SHIRT MONEY GOES</text>
      <text x="8" y="34" className="fill-muted" fontSize="9.5">Share of retail price (illustrative estimate)</text>
      {SHIRT_DATA.map((d) => {
        const start = acc;
        acc += d.pct;
        return <path key={d.label} d={arc(start, acc)} className={d.cls} />;
      })}
      <text x={cx} y={cy - 2} textAnchor="middle" className="fill-ink font-display" fontSize="20" fontWeight="700">$7</text>
      <text x={cx} y={cy + 13} textAnchor="middle" className="fill-muted" fontSize="8.5">retail price</text>
      <g fontSize="9.5">
        {SHIRT_DATA.map((d, i) => (
          <g key={d.label} transform={`translate(196 ${66 + i * 19})`}>
            <rect width="10" height="10" rx="2" className={d.cls} />
            <text x="15" y="9" className="fill-ink">{d.label}</text>
            <text x="140" y="9" textAnchor="end" className="num fill-ink" fontWeight="700">{d.pct}%</text>
          </g>
        ))}
      </g>
      <g transform="translate(196 186)">
        <rect width="140" height="42" rx="6" className="fill-pen/10 stroke-pen" strokeWidth="1" />
        <text x="10" y="17" className="fill-pen" fontSize="10" fontWeight="700">Only 1¢ of every dollar</text>
        <text x="10" y="31" className="fill-pen" fontSize="10" fontWeight="700">reaches the worker.</text>
      </g>
      <text x="8" y="254" className="fill-muted" fontSize="8.5">Breakdown shown for practice; no source is given. Can you trust it?</text>
    </svg>
  );
}
