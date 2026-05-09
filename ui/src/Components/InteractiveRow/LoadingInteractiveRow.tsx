import clsx from 'clsx';
import InteractiveRow from 'Components/InteractiveRow/InteractiveRow';
import SkeletonLoader from 'Components/Shared/SkeletonLoader';
import { ComponentProps } from 'react';
import styles from './InteractiveRow.module.css';

export default function LoadingInteractiveRow({ className, ...props }: ComponentProps<'button'>) {
  return (
    <InteractiveRow
      icon={<SkeletonLoader style={{ height: 36, width: 36 }} />}
      primaryLabel={<SkeletonLoader style={{ height: 20, width: 110 }} />}
      secondaryLabel={<SkeletonLoader style={{ height: 18, width: 60 }} />}
      primaryDataPoint={<SkeletonLoader style={{ height: 20, width: 50 }} />}
      secondaryDataPoint={<SkeletonLoader style={{ height: 18, width: 60 }} />}
      className={clsx(styles.interactiveRow, className)}
      {...props}
    />
  );
}
