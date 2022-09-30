import { useDispatch, useSelector } from 'react-redux';
import { Dispatch } from 'redux';
import { AllActions } from './actions';
import { StoreState } from './store';

export { StoreState } from './store';
export { actions } from './actions';

export function select<T>(fn: (state: StoreState) => T): T {
  return useSelector(fn);
}

export function dispatcher(): Dispatch<AllActions> {
  return useDispatch();
}
