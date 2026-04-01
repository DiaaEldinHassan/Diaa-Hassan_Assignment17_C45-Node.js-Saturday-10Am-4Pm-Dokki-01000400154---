export interface IToken {
  accessToken?: string;
  refreshToken?: string;
}

export interface Token {
  role: string;
  _id: string;
  email?: string;
  iat?: number;
  exp?: number;
}