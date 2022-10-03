import CryptoJS from 'crypto-js';
import { UserInfo } from './redux/store';

// #region Base
type HTTPMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
type HTTPStatus = 200 | 400 | 401 | 404 | 500;

export interface APIResponseBase {
  code: HTTPStatus;
  message: string;
}
export interface APIResponseError extends APIResponseBase {
  code: Exclude<HTTPStatus, 200>;
}
export interface APIResponseSuccess extends APIResponseBase {
  code: 200;
}
type APIResponse<T extends object> = (T & APIResponseSuccess) | APIResponseError;
// #endregion

export type RegisterAPIResponse = APIResponse<{ session: string }>;
export type LoginAPIResponse = APIResponse<{ session: string }>;
export type GetUserAPIResponse = APIResponse<{ user: UserInfo }>;

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

/**
 * gets user by id
 * @param id user id
 * @returns APIResponse with user info
 */
function getUser(id: number): Promise<GetUserAPIResponse>;
/**
 * gets user by login
 * @param login user login
 * @returns APIResponse with user info
 */
function getUser(login: string): Promise<GetUserAPIResponse>;
function getUser(arg: number | string): Promise<GetUserAPIResponse> {
  if (typeof arg === 'number')
    return fetchAPI<GetUserAPIResponse>(`user?id=${arg}`, 'GET');
  return fetchAPI<GetUserAPIResponse>(`user?login=${arg}`, 'GET');
}
const api = {
  getUser,
  /**
   * get user by session token
   * @param token session token
   * @returns APIResponse with user info
   */
  getUserByToken(token: string) {
    return fetchAPI<GetUserAPIResponse>(`user?token=${token}`, 'GET');
  },
  /**
   * authorize user
   * @param login user login
   * @param password user password
   * @returns APIResponse with session token
   */
  login(login: string, password: string) {
    const hash = CryptoJS.SHA512(password).toString();
    return fetchAPI<LoginAPIResponse>('login', 'POST', { login, hash });
  },

  /**
   * register user
   * @param login user login
   * @param password user password
   * @returns APIResponse with session token
   */
  register(login: string, password: string) {
    const hash = CryptoJS.SHA512(password).toString();
    return fetchAPI<RegisterAPIResponse>('user', 'PUT', { login, hash });
  }
};

export default api;
