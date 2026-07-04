import { CategoryDetails } from '@spend-watcher/contract';
import getCanvasDimensions from 'Components/charts/utils/getCanvasDimensions/getCanvasDimensions';
import { spendCategoryIconMapper } from 'Components/Shared/Icons/spendCategoryIconMapper';
import * as d3 from 'd3';
import AxisLeft from 'Pages/Savings/AccountGrowthOverTime/AxisLeft/AxisLeft';
import { UseMeasureRect } from 'react-use/lib/useMeasure';

type BarChartPropTypes = {
  categoryDetailsList: CategoryDetails[];
  containerMeasurement: UseMeasureRect;
};

export default function BarChart({ categoryDetailsList, containerMeasurement }: BarChartPropTypes) {
  const dimensions = getCanvasDimensions({
    width: containerMeasurement.width,
    height: 400,
    margin: {
      top: 16,
      right: 8,
      bottom: 32,
      left: 56,
    },
  });

  const aggregatedData = categoryDetailsList
    .map(({ category, combinedTotals }) => ({ category, total: combinedTotals.amount }))
    .sort((a, b) => a.total - b.total);

  const xScale = d3
    .scaleBand()
    .domain(aggregatedData.map((d) => d.category))
    .range([0, dimensions.boundedWidth]);

  const yScale = d3
    .scaleLinear()
    .domain([0, d3.max(aggregatedData, (d) => d.total) as number])
    .range([dimensions.boundedHeight, 0]);

  return (
    <svg width={dimensions.width} height={dimensions.height}>
      <AxisLeft
        scale={yScale}
        transform={`translate(0, ${dimensions.margin.top})`}
        dimensions={dimensions}
        formatter={(d: number) => d3.format('$,.0f')(d)}
        tickCount={4}
        fontSize="10px"
      />
      <g id="bar-chart-bounds" transform={`translate(${dimensions.margin.left}, ${dimensions.margin.top})`}>
        {aggregatedData.map(({ category, total }) => {
          const categoryIcon = spendCategoryIconMapper[category];
          const bandWidth = xScale.bandwidth();
          const iconSize = 16;
          return (
            <g id={`bar-${category}`} key={category} transform={`translate(${xScale(category)}, 0)`}>
              <g transform={`translate(0, ${yScale(total)})`}>
                <rect
                  width={bandWidth - 2}
                  height={dimensions.boundedHeight - yScale(total)}
                  fill={`var(--theme-color-spend-category-${category})`}
                />
              </g>
              <g transform={`translate(${bandWidth / 2 - iconSize / 2}, ${dimensions.boundedHeight + 4})`}>
                {categoryIcon}
              </g>
            </g>
          );
        })}
      </g>
    </svg>
  );
}
