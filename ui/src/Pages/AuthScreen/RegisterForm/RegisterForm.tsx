import { zodResolver } from '@hookform/resolvers/zod';
import axios from 'axios';
import CustomButton from 'Components/CustomButton/CustomButton';
import useContent from 'Hooks/useContent';
import { useForm } from 'react-hook-form';
import { RegisterRequestParams, registerRequestParamSchema } from 'Types/Services/auth.model';
import styles from '../AuthScreen.module.css';
axios.defaults.withCredentials = true;

type RegisterFormPropTypes = {
  switchToLogin: () => void;
};

export default function RegisterForm({ switchToLogin }: RegisterFormPropTypes) {
  const getContent = useContent('authScreen');
  const form = useForm<RegisterRequestParams>({
    resolver: zodResolver(registerRequestParamSchema),
  });

  function handleSubmission() {
    // TODO: Implement register functionality
  }

  return (
    <>
      <label>{getContent('username')}</label>
      <input
        className={styles.textInput}
        placeholder={getContent('username')}
        autoComplete="off"
        type="username"
        {...form.register('username', { maxLength: 100 })}
      />
      <label>{getContent('password')}</label>
      <input
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
