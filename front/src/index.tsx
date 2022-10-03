import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import App from './components/App';
import Header from './components/Header';
import { store } from './redux/store';

document.onreadystatechange = () => {
  if (document.readyState !== 'interactive') {
    return;
  }

  ReactDOM.render(
    <Provider store={store}>
      <Header />
    </Provider>,
    document.getElementById('header')
  );
  ReactDOM.render(
    <Provider store={store}>
      <App />
    </Provider>,
    document.getElementById('app')
  );
};
