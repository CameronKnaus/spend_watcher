import clsx from 'clsx';
import CustomButton from 'Components/CustomButton/CustomButton';
import { ComponentProps } from 'react';
import styles from './PanelOptionButton.module.css';

type PanelOptionButtonPropTypes = {
  onClick: () => void;
} & ComponentProps<'button'>;

// A wrapper for buttons used by slide in panel menus
export default function PanelOptionButton({ className, onClick, ...props }: PanelOptionButtonPropTypes) {
  return (
    <CustomButton
      layout="fit-content"
      className={clsx(styles.optionButton, className)}
      variant="secondary"
      onClick={onClick}
      {...props}
    />
  );
}
