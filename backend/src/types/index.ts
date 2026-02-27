export interface IItem {
  name: string;
  description?: string;
}

export interface ApiResponse<T> {
  data?: T;
  message?: string;
  success: boolean;
}
