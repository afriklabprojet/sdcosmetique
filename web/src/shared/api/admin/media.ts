/* eslint-disable @typescript-eslint/no-namespace */
import { api, unwrapData } from '@/shared/api/client';

export namespace Media {
  export async function upload(file: File, folder?: string): Promise<string> {
    const form = new FormData();
    form.append('file', file);
    if (folder) form.append('folder', folder);
    const body = await api<{ data: { url: string } }>('/admin/media', {
      method: 'POST',
      body: form,
    });
    return unwrapData(body).url;
  }
}
