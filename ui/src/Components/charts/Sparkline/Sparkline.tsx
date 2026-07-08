import styles from './Sparkline.module.css';

const WIDTH = 100;
const HEIGHT = 26;
const PADDING_X = 2;
const TOP_Y = 4;
const BOTTOM_Y = 22;
const FLAT_Y = 13;

type SparklinePropTypes = {
  values: number[];
  stroke: string;
};

// A minimal inline trend line: no axes, no labels — the numbers live elsewhere in the row.
export default function Sparkline({ values, stroke }: SparklinePropTypes) {
  if (values.length < 2) {
    return null;
  }

  const max = Math.max(...values);
  const stepX = (WIDTH - PADDING_X * 2) / (values.length - 1);
  const points = values
    .map((value, index) => {
      const x = PADDING_X + index * stepX;
      const y = max > 0 ? BOTTOM_Y - (value / max) * (BOTTOM_Y - TOP_Y) : FLAT_Y;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className={styles.sparkline} role="img">
      <polyline
        points={points}
        fill="none"
        stroke={stroke}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
