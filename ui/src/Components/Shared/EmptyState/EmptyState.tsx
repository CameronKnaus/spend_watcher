import { clsx } from 'clsx';
import { ComponentProps } from 'react';
import styles from './EmptyState.module.css';

type EmptyStatePropTypes = {
  message: string;
} & ComponentProps<'div'>;

export default function EmptyState({ message, className, ...rest }: EmptyStatePropTypes) {
  return (
    <div className={clsx(styles.emptyState, className)} {...rest}>
      {message}
    </div>
  );
}
