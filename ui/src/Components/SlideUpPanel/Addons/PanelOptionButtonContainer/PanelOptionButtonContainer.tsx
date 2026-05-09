import styles from './PanelOptionButtonContainer.module.css';

export default function PanelOptionButtonContainer({ children }: { children: React.ReactNode }) {
  return <div className={styles.buttonContainer}>{children}</div>;
}
