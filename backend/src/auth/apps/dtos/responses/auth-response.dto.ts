export type AuthResponseDto = {
  accessToken: string;
  user: {
    id: number;
    email: string;
    defaultHourlyRate: number;
  };
};
