import { configureStore } from '@reduxjs/toolkit';
import reducer from './reducer';

export interface UserInfo {
  id: number;
  name: string;
}

export interface StoreState {
  user?: UserInfo;
}

export const preloadedState: StoreState = { user: undefined };
export const store = configureStore({ reducer, devTools: true, preloadedState });
