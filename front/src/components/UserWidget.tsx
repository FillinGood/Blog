import React from 'react';
import { actions, dispatcher, select } from '../redux';
import api from '../api';
import { UserInfo } from '../redux/store';

export default function UserWidget() {
  const user = select((s) => s.user);
  if (user) {
    return <LoggedIn user={user} />;
  } else {
    return <NotLogged />;
  }
}

function NotLogged() {
  const dispatch = dispatcher();
  const refLogin = React.createRef<HTMLInputElement>();
  const refPassword = React.createRef<HTMLInputElement>();

  async function OnLogin() {
    if (!refLogin.current || !refPassword.current) return;
    const login = refLogin.current.value;
    const password = refPassword.current.value;

    const res = await api.login(login, password);

    if (res.code === 200) {
      const user = await api.getUser(login);
      dispatch(actions.setUser(user.user));
    } else {
      alert(res.message);
    }
  }

  async function OnRegister() {
    if (!refLogin.current || !refPassword.current) return;
    const login = refLogin.current.value;
    const password = refPassword.current.value;

    const res = await api.register(login, password);

    if (res.code === 200) {
      const user = await api.getUser(login);
      dispatch(actions.setUser(user.user));
    } else {
      alert(res.message);
    }
  }

  return (
    <div className="user-widget">
      <div className="row">
        <label htmlFor="user-login">Login:</label>
        <input id="user-login" ref={refLogin} />
      </div>
      <div className="row">
        <label htmlFor="user-password">Password:</label>
        <input id="user-password" type="password" ref={refPassword} />
      </div>
      <div className="row">
        <button onClick={OnLogin}>Log in</button>
        <button onClick={OnRegister}>Sign up</button>
      </div>
    </div>
  );
}

function LoggedIn({ user }: { user: UserInfo }) {
  const dispatch = dispatcher();

  function OnLogOut() {
    dispatch(actions.setUser());
  }

  return (
    <div className="user-widget logged">
      <span>{'Logged as: '}</span>
      <a>{user.name}</a>
      <button onClick={OnLogOut}>Log out</button>
    </div>
  );
}
