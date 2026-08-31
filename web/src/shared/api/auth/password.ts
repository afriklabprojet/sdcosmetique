/* eslint-disable @typescript-eslint/no-namespace */
import { apiRoot } from '@/shared/api/client';

export namespace Password {
  export async function forgot(email: string): Promise<void> {
    await apiRoot('/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  export async function reset(input: {
    token: string;
    email: string;
    password: string;
  }): Promise<void> {
    await apiRoot('/reset-password', {
      method: 'POST',
      body: JSON.stringify({
        token: input.token,
        email: input.email,
        password: input.password,
        password_confirmation: input.password,
      }),
    });
  }

  export async function update(input: {
    current: string;
    next: string;
  }): Promise<void> {
    await apiRoot('/user/password', {
      method: 'PUT',
      body: JSON.stringify({
        current_password: input.current,
        password: input.next,
        password_confirmation: input.next,
      }),
    });
  }
}
