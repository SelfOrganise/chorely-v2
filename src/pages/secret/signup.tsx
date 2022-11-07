import { FormEvent } from 'react';
import { useRouter } from 'next/router';
import { trpc } from '../../utils/trpc';

export default function SignUp(): JSX.Element {
  const createUser = trpc.users.signup.useMutation();
  const router = useRouter();

  return (
    <div className="flex w-full flex-col items-center justify-center">
      <form
        className="mt-5 flex w-72 flex-col space-y-2"
        onSubmit={(form: FormEvent<HTMLFormElement & { email: HTMLInputElement; password: HTMLInputElement }>) => {
          createUser.mutateAsync(
            {
              email: form.currentTarget.email.value,
              password: form.currentTarget.password.value,
            },
            {
              onSuccess: () => {
                debugger;
                router.replace('/');
              },
              onError: res => {
                alert('Could not create account. ' + res.message);
              },
            }
          );

          form.preventDefault();
        }}
      >
        <input className="input" autoFocus type="text" name="email" placeholder="you@email.com" />
        <input className="input" type="password" name="password" placeholder="*****" />
        <input className="btn bg-gray-600" type="submit" value="create" />
      </form>
    </div>
  );
}
