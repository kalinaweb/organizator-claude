// User types
export interface User {
  id: string;
  email: string;
  name?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken?: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  email: string;
  password: string;
  name?: string;
}

// Page types
export interface Page {
  id: string;
  title: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreatePageDto {
  title: string;
}

export interface UpdatePageDto {
  title?: string;
}

// List types
export interface List {
  id: string;
  title: string;
  pageId: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateListDto {
  title: string;
  pageId: string;
}

export interface UpdateListDto {
  title?: string;
  order?: number;
}

// Task types
export interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  listId: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateTaskDto {
  title: string;
  description?: string;
  listId: string;
}

export interface UpdateTaskDto {
  title?: string;
  description?: string;
  completed?: boolean;
  order?: number;
}

// API Response types
export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface ApiError {
  message: string;
  statusCode: number;
  error?: string;
}
