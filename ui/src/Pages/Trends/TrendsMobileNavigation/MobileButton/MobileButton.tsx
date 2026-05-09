import clsx from 'clsx';
import { ComponentProps, ReactNode } from 'react';
import styles from './MobileButton.module.css';

type MobileButtonPropTypes = {
  buttonText: string;
  icon: ReactNode;
} & Omit<ComponentProps<'button'>, 'children'>;

export default function MobileButton({ buttonText, icon, className, ...props }: MobileButtonPropTypes) {
  return (
    <button className={clsx(styles.button, className)} {...props}>
      <div className={styles.icon}>{icon}</div>
      <div className={styles.buttonLabel}>{buttonText}</div>
    </button>
  );
}
