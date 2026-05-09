import clsx from 'clsx';
import { ComponentProps, ReactNode } from 'react';
import { FaChevronRight } from 'react-icons/fa';
import styles from './InteractiveRow.module.css';

type InteractiveRowPropTypes = {
  icon?: ReactNode;
  primaryLabel: ReactNode;
  secondaryLabel?: ReactNode;
  primaryDataPoint: ReactNode;
  secondaryDataPoint?: ReactNode;
  callToActionText?: string;
} & ComponentProps<'button'>;

export default function InteractiveRow({
  icon,
  primaryLabel,
  secondaryLabel,
  primaryDataPoint,
  secondaryDataPoint,
  className,
  callToActionText,
  ...attributes
}: InteractiveRowPropTypes) {
  return (
    <button className={styles.button} {...attributes}>
      <div className={clsx(styles.interactiveRow, className)}>
        {icon}
        <div className={styles.detailsContainer}>
          <div className={styles.primaryRow}>
            <span>{primaryLabel}</span>
            <span>{primaryDataPoint}</span>
          </div>
          <div className={styles.dataRow}>
            {secondaryLabel && <div className={styles.secondaryRow}>{secondaryLabel}</div>}
            {secondaryDataPoint && <div className={styles.secondaryRow}>{secondaryDataPoint}</div>}
          </div>
        </div>
        <FaChevronRight className={styles.chevron} />
      </div>
      {callToActionText && <div className={styles.callToAction}>{callToActionText}</div>}
    </button>
  );
}
