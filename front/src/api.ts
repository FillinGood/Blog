import CryptoJS from 'crypto-js';
import { UserInfo } from './redux/store';

type HTTPMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

export interface APIResponse {
  code: number;
  message: string;
}

export interface RegisterAPIResponse extends APIResponse {
  id?: number;
}

export interface GetUserAPIResponse extends APIResponse {
  user?: UserInfo;
}

async function fetchAPI<T>(
  endpoint: string,
  method: HTTPMethod,
  body?: object
): Promise<T> {
  const res = await fetch('/api/' + endpoint, {
    method,
    headers: method !== 'GET' ? { 'Content-Type': 'application/json' } : undefined,
    body: method !== 'GET' ? JSON.stringify(body ?? {}) : undefined
  });
  return res.json();
}

function getUser(id: number): Promise<GetUserAPIResponse>;
function getUser(login: string): Promise<GetUserAPIResponse>;
function getUser(arg: number | string): Promise<GetUserAPIResponse> {
  if (typeof arg === 'number')
    return fetchAPI<GetUserAPIResponse>(`user?id=${arg}`, 'GET');
  return fetchAPI<GetUserAPIResponse>(`user?login=${arg}`, 'GET');
}
const api = {
  getUser,
  login(login: string, password: string) {
    const hash = CryptoJS.SHA512(password).toString();
    return fetchAPI<APIResponse>('login', 'POST', { login, hash });
  },

  register(login: string, password: string) {
    const hash = CryptoJS.SHA512(password).toString();
    return fetchAPI<RegisterAPIResponse>('user', 'PUT', { login, hash });
  }
};

export default api;
