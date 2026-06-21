import { useQuery } from '@tanstack/react-query';
import ModuleContainer from 'Components/ModuleContainer/ModuleContainer';
import SkeletonLoader from 'Components/Shared/SkeletonLoader/SkeletonLoader';
import useContent from 'Hooks/useContent/useContent';
import { accountsGrowthOverTimeQueryOptions } from 'queryOptions/accountsGrowthOverTimeQueryOptions';
import { useMeasure } from 'react-use';
import AccountGrowthOverTime from '../AccountGrowthOverTime/AccountGrowthOverTime';
import styles from './NetWorthTile.module.css';

export default function NetWorthTile() {
  const getContent = useContent('savings');
  const { isLoading, data: dataset } = useQuery(accountsGrowthOverTimeQueryOptions);
  const [tileRef, tileMeasurement] = useMeasure<HTMLDivElement>();

  if (isLoading || !dataset) {
    return (
      <ModuleContainer heading={getContent('netWorth')} className={styles.container}>
        <SkeletonLoader className={styles.skeletonOverride} />
        <SkeletonLoader className={styles.skeletonOverride} style={{ width: '70%' }} />
        <SkeletonLoader className={styles.skeletonOverride} style={{ width: '35%' }} />
      </ModuleContainer>
    );
  }

  return (
    <ModuleContainer forwardRef={tileRef} elevation="high" className={styles.container}>
      <AccountGrowthOverTime dataset={dataset} containerMeasurement={tileMeasurement} />
    </ModuleContainer>
  );
}
