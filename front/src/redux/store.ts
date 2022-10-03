import { configureStore } from '@reduxjs/toolkit';
import reducer from './reducer';

export interface UserInfo {
  id: number;
  name: string;
}

export interface StoreState {
  user?: UserInfo;
}

declare const user: UserInfo | undefined;

export const preloadedState: StoreState = { user };
export const store = configureStore({ reducer, devTools: true, preloadedState });
