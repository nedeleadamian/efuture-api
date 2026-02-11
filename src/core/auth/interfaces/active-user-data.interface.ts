export interface ActiveUserData {
  userId: string;
  email: string;
}

export interface ActiveUserDataWithRefreshToken extends ActiveUserData {
  refreshToken: string;
}