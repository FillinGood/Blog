import React from 'react';
import Cookies from 'js-cookie';
import { actions, dispatcher } from '../redux';
import UserWidget from './UserWidget';
import api from '../api';

export default function App() {
  const dispatch = dispatcher();

  React.useEffect(() => {
    const token = Cookies.get('token');
    if (!token) return;
    api.getUserByToken(token).then((res) => {
      if (res.code === 200) {
        const user = res.user;
        dispatch(actions.setUser(user));
      } else {
        Cookies.remove('token');
      }
    });
  }, []);

  return <UserWidget />;
}
