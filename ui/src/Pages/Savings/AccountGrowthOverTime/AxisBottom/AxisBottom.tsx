import * as d3 from 'd3';

interface AxisBottomProps {
  /** A D3 time scale that maps Date objects to x coordinates */
  scale: d3.ScaleTime<number, number>;
  /** A translation to position the axis */
  transform: string;
  /** Number of ticks to display (optional) */
  tickCount?: number;
  /** A D3 time format specifier for the tick labels (optional) */
  tickFormat?: string;
}

export default function AxisBottom({ scale, transform, tickCount = 5, tickFormat = '%b %Y' }: AxisBottomProps) {
  const ticks = scale.ticks(tickCount);
  const formatTime = d3.timeFormat(tickFormat);

  return (
    <g transform={transform}>
      {/* Render tick marks and labels */}
      {ticks.map((tick, index) => {
        const x = scale(tick);
        return (
          <g key={index} transform={`translate(${x}, 0)`}>
            {/* Tick mark */}
            <line y2={5} stroke="var(--theme-color-primary-800)" />
            {/* Tick label */}
            <text style={{ textAnchor: 'middle', fontSize: '10px', fill: 'currentColor' }} y={12} dy="0.71em">
              {formatTime(tick)}
            </text>
          </g>
        );
      })}
    </g>
  );
}
