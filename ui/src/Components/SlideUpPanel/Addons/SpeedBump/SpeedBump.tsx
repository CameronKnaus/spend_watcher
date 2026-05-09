import BottomSheet from 'Components/BottomSheet/BottomSheet';
import CustomButton from 'Components/CustomButton/CustomButton';
import useContent from 'Hooks/useContent';
import styles from './SpeedBump.module.css';

type SpeedBumpPropTypes = {
  proceedText: string;
  warningTitle: string;
  warningDescription: string;
  finalWarningText?: string;
  onProceed: () => void;
  onCancel: () => void;
};

export default function SpeedBump({
  onCancel,
  onProceed,
  proceedText,
  warningTitle,
  warningDescription,
  finalWarningText,
}: SpeedBumpPropTypes) {
  const getGeneralContent = useContent('general');

  function handleProceed() {
    onProceed();
  }

  return (
    <div>
      <h3 className={styles.heading}>{warningTitle}</h3>
      <p className={styles.description}>{warningDescription}</p>
      {finalWarningText && (
        <p className={styles.finalWarning}>
          <strong>{finalWarningText}</strong>
        </p>
      )}
      <BottomSheet>
        <CustomButton variant="secondary" onClick={onCancel} layout="full-width">
          {getGeneralContent('cancel')}
        </CustomButton>
        <CustomButton variant={finalWarningText ? 'tertiary' : 'primary'} onClick={handleProceed} layout="full-width">
          {proceedText}
        </CustomButton>
      </BottomSheet>
    </div>
  );
}
