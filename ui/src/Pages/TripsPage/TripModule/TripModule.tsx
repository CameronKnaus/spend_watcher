import CustomButton from 'Components/CustomButton/CustomButton';
import { spendCategoryColorMapper, spendCategoryIconMapper } from 'Components/Shared/Icons/spendCategoryIconMapper';
import useContent from 'Hooks/useContent';
import { useState } from 'react';
import { FaInfoCircle, FaMoneyBillWave } from 'react-icons/fa';
import { Trip, TripCostTotals } from 'Types/Services/trips.model';
import { SpendingCategory } from 'Types/SpendingCategory';
import { formatToMonthDay, formatToMonthDayYear } from 'Util/Formatters/dateFormatters/dateFormatters';
import TripDetailsPanel from '../TripDetailsPanel/TripDetailsPanel';
import { TripModuleDataPoint } from '../TripModuleDataPoint/TripModuleDataPoint';
import styles from './TripModule.module.css';

type TripModulePropTypes = {
  trip: Trip;
  tripCostTotals: TripCostTotals;
};

export default function TripModule({ trip, tripCostTotals }: TripModulePropTypes) {
  const [detailPanelOpen, setDetailPanelOpen] = useState(false);
  const getContent = useContent('trips');
  const getCategoryLabel = useContent('SPENDING_CATEGORIES');
  const isSameYear = trip.startDate.slice(0, 4) === trip.endDate.slice(0, 4);

  const dateLabel = isSameYear
    ? `${formatToMonthDay(trip.startDate)} - ${formatToMonthDayYear(trip.endDate)}`
    : `${formatToMonthDayYear(trip.startDate)} - ${formatToMonthDayYear(trip.endDate)}`;

  return (
    <>
      <div className={`${styles.module} background-secondary-elevation-low`}>
        <h2 className={styles.tripName}>{trip.tripName}</h2>
        <div className={styles.tripDates}>{dateLabel}</div>
        <div className={styles.spendTotalDataPoints}>
          {/* Airfare total */}
          <TripModuleDataPoint
            label={getCategoryLabel(SpendingCategory.AIRFARE)}
            icon={spendCategoryIconMapper[SpendingCategory.AIRFARE]}
            iconBackgroundColor={spendCategoryColorMapper[SpendingCategory.AIRFARE]}
            amount={-tripCostTotals.totalAirfareSpent}
          />
          {/* Lodging total */}
          <TripModuleDataPoint
            label={getCategoryLabel(SpendingCategory.LODGING)}
            icon={spendCategoryIconMapper[SpendingCategory.LODGING]}
            iconBackgroundColor={spendCategoryColorMapper[SpendingCategory.LODGING]}
            amount={-tripCostTotals.totalLodgingSpent}
          />
          {/* Discretionary total */}
          <TripModuleDataPoint
            label={getContent('discretionary')}
            icon={spendCategoryIconMapper[SpendingCategory.OTHER]}
            iconBackgroundColor={spendCategoryColorMapper[SpendingCategory.OTHER]}
            amount={-tripCostTotals.totalDiscretionarySpent}
          />
          {/* Total */}
          <TripModuleDataPoint
            label={getContent('total')}
            icon={<FaMoneyBillWave />}
            iconBackgroundColor={'var(--theme-color-secondary-100)'}
            amount={-tripCostTotals.totalSpent}
          />
        </div>
        <div className={styles.buttonRow}>
          <CustomButton variant="detail" onClick={() => setDetailPanelOpen(true)} className={styles.actionButton}>
            {getContent('details')}
            <FaInfoCircle />
          </CustomButton>
        </div>
      </div>
      <TripDetailsPanel
        trip={trip}
        dateLabel={dateLabel}
        isOpen={detailPanelOpen}
        onClose={() => setDetailPanelOpen(false)}
      />
    </>
  );
}
