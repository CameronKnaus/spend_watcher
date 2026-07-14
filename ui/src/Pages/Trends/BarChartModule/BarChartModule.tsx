import ModuleContainer from 'Components/ModuleContainer/ModuleContainer';
import useSpendingDetailsService from 'Hooks/useSpendingService/useSpendingDetailsService';
import { useMeasure } from 'react-use';
import BarChart from './BarChart';
import styles from './BarChartModule.module.css';

export default function BarChartModule() {
  const [containerRef, containerMeasurement] = useMeasure();
  const { isLoading, data } = useSpendingDetailsService();

  return (
    <ModuleContainer
      className={styles.container}
      forwardRef={containerRef}
      isLoading={isLoading}
      elevation="low"
      padding="0 10px"
    >
      <h3 className={styles.header}>Bar chart</h3>
      {data && (
        <BarChart
          categoryDetailsList={data.spendCategoryOverview.categoryDetailsList}
          containerMeasurement={containerMeasurement}
        />
      )}
    </ModuleContainer>
  );
}
