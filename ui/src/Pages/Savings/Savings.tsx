import AccountsList from 'Components/AccountsList/AccountsList';
import AddAccountButton from 'Components/AddAccountButton/AddAccountButton';
import PageContainer from 'Components/PageContainer/PageContainer';
import createContentGetter from 'Content/createContentGetter';
import NetWorthTile from './NetWorthTile/NetWorthTile';
import styles from './Savings.module.css';
import TotalsByAccountType from './TotalsByAccountType/TotalsByAccountType';

export default function Savings() {
  const getContent = createContentGetter('savings');

  return (
    <PageContainer pageTitle={getContent('pageTitle')}>
      <div className={styles.tile}>
        <NetWorthTile />
      </div>
      <div className={styles.tile}>
        <TotalsByAccountType />
      </div>
      <div className={styles.tile}>
        <AccountsList />
      </div>
      <AddAccountButton />
    </PageContainer>
  );
}
