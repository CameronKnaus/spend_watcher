import SkeletonLoader from 'Components/Shared/SkeletonLoader';
import styles from './TripModuleDataPoint.module.css';

export default function TripModuleDataPointLoader() {
  return (
    <div className={styles.spendTotal}>
      <SkeletonLoader className={styles.icon} style={{ height: 42, width: 42, flexShrink: 0, flexBasis: 42 }} />
      <div style={{ width: '100%' }}>
        <SkeletonLoader style={{ height: 21, width: 90, marginBottom: 8 }} />
        <SkeletonLoader style={{ height: 17, width: 62 }} />
      </div>
    </div>
  );
}
