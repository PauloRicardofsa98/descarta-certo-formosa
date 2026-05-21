import type { DailyPoint } from "../_lib/queries";

const WIDTH = 720;
const HEIGHT = 220;
const PADDING = { top: 16, right: 16, bottom: 28, left: 36 };

function formatDayLabel(iso: string): string {
  const d = new Date(`${iso}T00:00:00Z`);
  return `${String(d.getUTCDate()).padStart(2, "0")}/${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
}

export function DailyViewsChart({ data }: { data: DailyPoint[] }) {
  if (data.length === 0) {
    return (
      <p className="py-12 text-center text-sm text-muted-foreground">
        Sem visualizações no período.
      </p>
    );
  }

  const maxValue = Math.max(1, ...data.map((d) => d.views));
  const innerWidth = WIDTH - PADDING.left - PADDING.right;
  const innerHeight = HEIGHT - PADDING.top - PADDING.bottom;
  const stepX = data.length > 1 ? innerWidth / (data.length - 1) : 0;

  const points = data.map((d, i) => {
    const x = PADDING.left + i * stepX;
    const y = PADDING.top + innerHeight - (d.views / maxValue) * innerHeight;
    return { x, y, ...d };
  });

  const linePath = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
    .join(" ");

  const areaPath =
    `${linePath} L ${points[points.length - 1].x.toFixed(1)} ${PADDING.top + innerHeight}` +
    ` L ${points[0].x.toFixed(1)} ${PADDING.top + innerHeight} Z`;

  const yTicks = [0, Math.round(maxValue / 2), maxValue];
  const xLabelIndexes =
    data.length <= 4
      ? data.map((_, i) => i)
      : [0, Math.floor(data.length / 2), data.length - 1];

  const total = data.reduce((sum, d) => sum + d.views, 0);

  return (
    <figure className="flex flex-col gap-2">
      <figcaption className="sr-only">
        Visualizações por dia no período selecionado.
      </figcaption>
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        role="img"
        aria-label={`${total.toLocaleString("pt-BR")} visualizações ao longo de ${data.length} dias`}
        className="block h-auto w-full"
      >
        {yTicks.map((tick) => {
          const y = PADDING.top + innerHeight - (tick / maxValue) * innerHeight;
          return (
            <g key={tick}>
              <line
                x1={PADDING.left}
                x2={WIDTH - PADDING.right}
                y1={y}
                y2={y}
                className="stroke-border"
                strokeDasharray="2 4"
                strokeWidth={1}
              />
              <text
                x={PADDING.left - 8}
                y={y + 4}
                textAnchor="end"
                className="fill-muted-foreground text-[10px] tabular-nums"
              >
                {tick}
              </text>
            </g>
          );
        })}

        <path d={areaPath} className="fill-primary/10" />
        <path
          d={linePath}
          fill="none"
          className="stroke-primary"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {points.map((p) => (
          <g key={p.date}>
            <circle
              cx={p.x}
              cy={p.y}
              r={2.5}
              className="fill-primary"
            />
            <title>{`${formatDayLabel(p.date)}: ${p.views.toLocaleString("pt-BR")} ${p.views === 1 ? "visualização" : "visualizações"}`}</title>
          </g>
        ))}

        {xLabelIndexes.map((i) => (
          <text
            key={i}
            x={points[i].x}
            y={HEIGHT - 8}
            textAnchor={i === 0 ? "start" : i === data.length - 1 ? "end" : "middle"}
            className="fill-muted-foreground text-[10px] tabular-nums"
          >
            {formatDayLabel(data[i].date)}
          </text>
        ))}
      </svg>
    </figure>
  );
}
