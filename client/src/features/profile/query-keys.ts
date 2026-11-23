export const profileKeys = {
  all: ['profile'] as const,
  detail: () => [...profileKeys.all, 'detail'] as const,
  incomingExchangeRequests: () => [...profileKeys.all, 'incoming-exchange-requests'] as const,
};
