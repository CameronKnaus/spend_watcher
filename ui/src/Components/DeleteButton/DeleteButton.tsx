import clsx from 'clsx';
import LoadingSpinner from 'Components/LoadingSpinner/LoadingSpinner';
import { ComponentProps } from 'react';
import { FaTrashAlt } from 'react-icons/fa';
import styles from './DeleteButton.module.css';

type DeleteButtonPropTypes = {
  label: string;
  isLoading?: boolean;
} & ComponentProps<'button'>;

export default function DeleteButton({ label, className, onClick, isLoading, ...props }: DeleteButtonPropTypes) {
  return (
    <button className={clsx(styles.deleteButton, className)} onClick={onClick} {...props}>
      {label}
      {isLoading ? <LoadingSpinner variant="red" size={20} /> : <FaTrashAlt />}
    </button>
  );
}
