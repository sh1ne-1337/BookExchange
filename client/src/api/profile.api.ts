import type { IncomingExchangeRequest, UserWithStats } from '@/types/api';
import { http } from './http';

export interface UpdateProfilePayload {
  name: string;
  email: string;
  avatar?: File;
  removeAvatar?: boolean;
}

export const profileApi = {
  get: () => http.get<UserWithStats>('/me/profile').then((res) => res.data),

  update: ({ name, email, avatar, removeAvatar }: UpdateProfilePayload) => {
    const formData = new FormData();
    formData.append('name', name);
    formData.append('email', email);
    if (avatar) formData.append('avatar', avatar);
    else if (removeAvatar) formData.append('removeAvatar', 'true');

    return http.patch<UserWithStats>('/me/profile', formData).then((res) => res.data);
  },

  listIncomingExchangeRequests: () =>
    http.get<IncomingExchangeRequest[]>('/me/exchange-requests').then((res) => res.data),
};
