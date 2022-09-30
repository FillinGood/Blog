import { UserInfo } from './store';

export const SET_USER_ACTION = 'SET_USER_ACTION';

export interface SetUserAction {
  type: typeof SET_USER_ACTION;
  user?: UserInfo;
}

export type AllActions = SetUserAction;

export const actions = {
  setUser(user?: UserInfo): SetUserAction {
    return { type: SET_USER_ACTION, user };
  }
};
