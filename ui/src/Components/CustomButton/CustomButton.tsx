import { clsx } from 'clsx';
import { ComponentProps } from 'react';
import styles from './CustomButton.module.css';

type CustomButtonPropTypes = {
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'tertiary' | 'detail';
  isDisabled?: boolean;
  layout?: 'fit-content' | 'full-width';
  backgroundColor?: string;
} & ComponentProps<'button'>;

// Background color must be provided by the parent component
export default function CustomButton({
  onClick,
  variant,
  isDisabled = false,
  layout = 'fit-content',
  className,
  children,
  ...props
}: CustomButtonPropTypes) {
  function handleClick() {
    if (isDisabled) {
      return;
    }

    onClick?.();
  }
  const classList = clsx([styles.defaultButton, className, isDisabled && styles.disabled, styles[variant ?? '']]);

  return (
    <button
      {...props}
      className={classList}
      style={{
        width: layout === 'full-width' ? '100%' : 'fit-content',
      }}
      onClick={handleClick}
    >
      {children}
    </button>
  );
}
