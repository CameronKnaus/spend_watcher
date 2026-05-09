import clsx from 'clsx';
import styles from './LoadingSpinner.module.css';

type LoadingSpinnerPropTypes = {
  size?: number;
  variant?: 'light' | 'red';
};

export default function LoadingSpinner({ size = 25, variant = 'light' }: LoadingSpinnerPropTypes) {
  const variantClassMapper = {
    light: styles.light,
    red: styles.red,
  };
  return <div className={clsx(styles.loader, variantClassMapper[variant])} style={{ height: size, width: size }} />;
}
