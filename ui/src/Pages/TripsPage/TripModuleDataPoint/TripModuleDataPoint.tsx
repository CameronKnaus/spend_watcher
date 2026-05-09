import ComposableIcon from 'Components/ComposableIcon/ComposableIcon';
import Currency from 'Components/Currency/Currency';
import { ReactNode } from 'react';
import styles from './TripModuleDataPoint.module.css';

type TripModuleDataPointPropTypes = {
  icon: ReactNode;
  amount: number;
  iconBackgroundColor: string;
  label: string;
};

export function TripModuleDataPoint({ icon, amount, iconBackgroundColor, label }: TripModuleDataPointPropTypes) {
  return (
    <div className={styles.spendTotal}>
      <ComposableIcon className={styles.icon} size={42} icon={icon} backgroundColor={iconBackgroundColor} />
      <div>
        <div className={styles.spendCategory}>{label}</div>
        <Currency className={styles.amountSpent} amount={amount} isGainLoss />
      </div>
    </div>
  );
}
