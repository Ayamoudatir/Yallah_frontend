// app/types/index.ts

export interface User {
    id: number;
    username: string;
    email?: string;
    first_name?: string;
    last_name?: string;
  }
  
  export interface Task {
    id: number;
    user: number;
    username?: string;
    title: string;
    description: string;
    completed: boolean;
    date: string; // Format: YYYY-MM-DD
    created_at: string; // Format ISO 8601
    updated_at: string; // Format ISO 8601
  }
  
  export interface TaskStats {
    total: number;
    completed: number;
    pending: number;
    percentage: number;
  }
  
  export interface AuthTokens {
    key: string; // dj-rest-auth retourne "key" au lieu de "access"
  }
  
  export interface LoginCredentials {
    username: string;
    password: string;
  }
  
  export interface DayInfo {
    month: string;
    day: number;
    fullDate: string; // YYYY-MM-DD
    isToday: boolean;
  }