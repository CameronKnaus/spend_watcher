import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { LoginInput, loginInputSchema } from '@spend-watcher/contract';
import { orpc } from 'apiClient/orpc';
import AlertMessage from 'Components/AlertMessage/AlertMessage';
import CustomButton from 'Components/CustomButton/CustomButton';
import createContentGetter from 'Content/createContentGetter';
import { useForm } from 'react-hook-form';
import styles from '../AuthScreen.module.css';

type LoginFormPropTypes = {
  switchToRegister: () => void;
};

export default function LoginForm({ switchToRegister }: LoginFormPropTypes) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const getContent = createContentGetter('authScreen');
  const form = useForm({
    resolver: zodResolver(loginInputSchema),
  });

  const loginService = useMutation(
    orpc.auth.login.mutationOptions({
      // Bad credentials aren't a "something broke" event worth a toast — show it inline instead.
      meta: { suppressGlobalError: true },
      onSuccess: async () => {
        await queryClient.invalidateQueries({ queryKey: orpc.auth.key() });
        await navigate({ to: '/dashboard' });
      },
    }),
  );

  async function handleSubmission(params: LoginInput) {
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
      {loginService.isError && (
        <AlertMessage variant="error" title={getContent('invalidCredentials')} className={styles.loginError} />
      )}
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
