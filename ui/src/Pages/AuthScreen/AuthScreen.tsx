import useContent from 'Hooks/useContent';
import { useState } from 'react';
import styles from './AuthScreen.module.css';
import LoginForm from './LoginForm/LoginForm';
import RegisterForm from './RegisterForm/RegisterForm';

export default function AuthScreen() {
  const getContent = useContent('authScreen');
  const [isRegistering, setIsRegistering] = useState(false);

  return (
    <div className={styles.authContainer}>
      <div className={styles.spendWatcherHeader}>{getContent('welcome')}</div>
      <div className={styles.formHeader}>{isRegistering ? getContent('register') : getContent('login')}</div>
      {isRegistering ? (
        <RegisterForm
          switchToLogin={() => {
            setIsRegistering(false);
          }}
        />
      ) : (
        <LoginForm
          switchToRegister={() => {
            setIsRegistering(true);
          }}
        />
      )}
    </div>
  );
}
