import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import CustomButton from 'Components/CustomButton/CustomButton';
import SERVICE_ROUTES from 'Constants/ServiceRoutes';
import useContent from 'Hooks/useContent';
import { useForm } from 'react-hook-form';
import { LoginRequestParams, loginRequestParamsSchema } from 'Types/Services/auth.model';
import styles from '../AuthScreen.module.css';
axios.defaults.withCredentials = true;

type LoginFormPropTypes = {
  switchToRegister: () => void;
};

export default function LoginForm({ switchToRegister }: LoginFormPropTypes) {
  const queryClient = useQueryClient();
  const getContent = useContent('authScreen');
  const form = useForm<LoginRequestParams>({
    resolver: zodResolver(loginRequestParamsSchema),
  });

  const loginService = useMutation({
    mutationFn: (params: LoginRequestParams) => axios.post(SERVICE_ROUTES.postLogin, params),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['verify-auth'],
      });
    },
    onError: () => {
      // TODO: Error handling
    },
  });

  async function handleSubmission(params: LoginRequestParams) {
    await loginService.mutate(params);
  }

  return (
    <form onSubmit={form.handleSubmit(handleSubmission)}>
      <label>{getContent('username')}</label>
      <input
        className={styles.textInput}
        placeholder={getContent('username')}
        autoComplete="username"
        type="username"
        {...form.register('username', { maxLength: 100 })}
      />
      <label>{getContent('password')}</label>
      <input
        className={styles.textInput}
        placeholder={getContent('password')}
        autoComplete="current-password"
        type="password"
        {...form.register('password', { maxLength: 100 })}
      />
      <div className={styles.buttonRowContainer}>
        <CustomButton
          isDisabled={loginService.isPending}
          variant="secondary"
          onClick={switchToRegister}
          layout="full-width"
        >
          {getContent('register')}
        </CustomButton>
        <CustomButton
          isDisabled={!form.formState.isValid || loginService.isPending}
          variant="primary"
          onClick={form.handleSubmit(handleSubmission)}
          layout="full-width"
        >
          {getContent('submit')}
        </CustomButton>
      </div>
    </form>
  );
}
