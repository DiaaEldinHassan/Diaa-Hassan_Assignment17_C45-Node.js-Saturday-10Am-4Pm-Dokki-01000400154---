export interface IError {
  success: boolean;
  error: string;
  stack?: string;
  code: number;
}
