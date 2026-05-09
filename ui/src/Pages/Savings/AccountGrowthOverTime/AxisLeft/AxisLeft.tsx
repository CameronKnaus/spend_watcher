import { CanvasDimensions } from 'Components/charts/use/useCanvasDimensions/useCanvasDimensions';
import * as d3 from 'd3';

interface AxisBottomProps {
  /** A D3 time scale that maps Date objects to x coordinates */
  scale: d3.ScaleLinear<number, number>;
  /** A translation to position the axis */
  transform: string;
  /** Number of ticks to display (optional) */
  tickCount?: number;
  /** A D3 time format specifier for the tick labels (optional) */
  tickFormat?: string;
  dimensions: CanvasDimensions;
  lineColor?: string;
  tickColor?: string;
  formatter?: (n: number) => string;
  fontSize?: string;
}

function formatCurrency(n: number): string {
  const format = d3.format;
  // For numbers less than 1,000, we use the number directly.
  if (n < 1e3) {
    return n % 1 === 0 ? format('$,.0f')(n) : format('$,.2f')(n);
  } else if (n < 1e6) {
    // For thousands, divide by 1,000.
    const value = n / 1e3;
    const formatted = value % 1 === 0 ? format('$,.0f')(value) : format('$,.2f')(value);
    return formatted + 'K'; // or "k" if you prefer lower-case
  } else {
    // For millions
    const value = n / 1e6;
    const formatted = value % 1 === 0 ? format('$,.0f')(value) : format('$,.2f')(value);
    return formatted + 'M';
  }
}

export default function AxisLeft({
  scale,
  transform,
  tickCount = 5,
  dimensions,
  tickColor = 'currentColor',
  lineColor = 'currentColor',
  formatter = formatCurrency,
  fontSize = '12px',
}: AxisBottomProps) {
  // Compute tick values using D3's scale method.
  const ticks = scale.ticks(tickCount);

  return (
    <g transform={transform}>
      {ticks.map((tick, index) => {
        const y = scale(tick);
        return (
          <g key={index} transform={`translate(${dimensions.margin.left}, ${y})`}>
            {/* Tick line */}
            {y < dimensions.boundedHeight && (
              <line x1={6} x2={dimensions.boundedWidth} stroke={lineColor} strokeDasharray="4" />
            )}
            {/* Tick label */}
            <text
              textAnchor="end"
              transform={`translate(-8, 0)`}
              style={{
                fontSize,
                fontWeight: 'bold',
                fill: tickColor,
              }}
            >
              {formatter(tick)}
            </text>
          </g>
        );
      })}
    </g>
  );
}
