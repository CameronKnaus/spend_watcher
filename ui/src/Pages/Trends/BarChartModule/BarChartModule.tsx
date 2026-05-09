import ModuleContainer from 'Components/ModuleContainer/ModuleContainer';
import useTransactions from 'Hooks/useTransactions/useTransactions';
import { useMeasure } from 'react-use';
import BarChart from './BarChart';
import styles from './BarChartModule.module.css';

export default function BarChartModule() {
  const [containerRef, containerMeasurement] = useMeasure();
  const { isLoading, data } = useTransactions();

  return (
    <ModuleContainer
      className={styles.container}
      forwardRef={containerRef}
      isLoading={isLoading}
      elevation="low"
      padding="0 10px"
    >
      <h3 className={styles.header}>Bar chart</h3>
      {data && <BarChart transactionResponse={data} containerMeasurement={containerMeasurement} />}
    </ModuleContainer>
  );
}
