import SkeletonLoader from 'Components/Shared/SkeletonLoader';
import useContent from 'Hooks/useContent';
import { FaInfoCircle } from 'react-icons/fa';
import TripModuleDataPointLoader from '../TripModuleDataPoint/TripModuleDataPointLoader';
import styles from './TripModule.module.css';

export default function TripModuleLoader() {
  const getContent = useContent('trips');

  return (
    <div className={styles.module} aria-hidden>
      <SkeletonLoader className={styles.tripName} style={{ height: 28, width: '75%', marginBottom: 8 }} />
      <SkeletonLoader className={styles.tripDates} style={{ height: 21, width: '50%' }} />
      <div className={styles.spendTotalDataPoints}>
        <TripModuleDataPointLoader />
        <TripModuleDataPointLoader />
        <TripModuleDataPointLoader />
        <TripModuleDataPointLoader />
      </div>
      <div className={styles.buttonRow}>
        <SkeletonLoader className={styles.actionButton}>
          {getContent('details')}
          <FaInfoCircle />
        </SkeletonLoader>
      </div>
    </div>
  );
}
