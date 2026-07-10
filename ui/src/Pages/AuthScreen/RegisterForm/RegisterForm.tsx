import { zodResolver } from '@hookform/resolvers/zod';
import { registerInputSchema } from '@spend-watcher/contract';
import CustomButton from 'Components/CustomButton/CustomButton';
import createContentGetter from 'Content/createContentGetter';
import { useId } from 'react';
import { useForm } from 'react-hook-form';
import styles from '../AuthScreen.module.css';

type RegisterFormPropTypes = {
  switchToLogin: () => void;
};

export default function RegisterForm({ switchToLogin }: RegisterFormPropTypes) {
  const getContent = createContentGetter('authScreen');
  const id = useId();
  const usernameId = `${id}-username`;
  const passwordId = `${id}-password`;
  const form = useForm({
    resolver: zodResolver(registerInputSchema),
  });

  function handleSubmission() {
    // TODO: Implement register functionality
  }

  return (
    <>
      <label htmlFor={usernameId}>{getContent('username')}</label>
      <input
        id={usernameId}
        className={styles.textInput}
        placeholder={getContent('username')}
        autoComplete="off"
        type="username"
        {...form.register('username', { maxLength: 100 })}
      />
      <label htmlFor={passwordId}>{getContent('password')}</label>
      <input
        id={passwordId}
        className={styles.textInput}
        placeholder={getContent('password')}
        autoComplete="new-password"
        type="password"
        {...form.register('password', { maxLength: 100 })}
      />
      <div className={styles.buttonRowContainer}>
        <CustomButton variant="secondary" onClick={switchToLogin} layout="full-width">
          {getContent('login')}
        </CustomButton>
        <CustomButton
          isDisabled={!form.formState.isValid}
          variant="primary"
          onClick={form.handleSubmit(handleSubmission)}
          layout="full-width"
        >
          {getContent('submit')}
        </CustomButton>
      </div>
    </>
  );
}
