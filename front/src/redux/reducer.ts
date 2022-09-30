import { AllActions, SET_USER_ACTION } from './actions';
import { preloadedState, StoreState } from './store';

export default function reducer(
  state: StoreState | undefined,
  action: AllActions
): StoreState {
  if (!state) return preloadedState;
  switch (action.type) {
    case SET_USER_ACTION:
      return { user: action.user };
  }
  return state;
}
