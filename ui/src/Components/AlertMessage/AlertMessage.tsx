import clsx from 'clsx';
import { ComponentProps } from 'react';
import { FaInfoCircle } from 'react-icons/fa';
import styles from './AlertMessage.module.css';

type AlertMessagePropTypes = {
  title: string;
  message?: string;
  variant: 'error' | 'info' | 'success' | 'warning';
} & Omit<ComponentProps<'div'>, 'style' | 'children'>;

export default function AlertMessage({ title, variant, message, className, ...props }: AlertMessagePropTypes) {
  const colors = {
    border: `1px solid var(--token-${variant}-border-color)`,
    backgroundColor: `var(--token-${variant}-background-color)`,
    titleColor: `var(--token-${variant}-title-color)`,
    messageColor: `var(--token-${variant}-message-color)`,
    iconColor: `var(--token-${variant}-icon-color)`,
  };

  return (
    <div
      className={clsx(styles.errorContainer, className)}
      style={{
        backgroundColor: colors.backgroundColor,
        border: colors.border,
      }}
      {...props}
    >
      <div
        className={styles.iconContainer}
        style={{
          color: colors.iconColor,
        }}
      >
        <FaInfoCircle />
      </div>
      <div className={styles.messageText}>
        <h3 className="font-body-small" style={{ color: colors.titleColor }}>
          {title}
        </h3>
        {message && (
          <p className="font-caption" style={{ color: colors.messageColor }}>
            {message}
          </p>
        )}
      </div>
    </div>
  );
}
