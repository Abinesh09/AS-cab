import React from 'react';
import { Provider } from 'react-redux';
import { store } from './src/store/store';
import './src/i18n/i18n';
import RootNavigator from './src/navigation/RootNavigator';
import Toast from 'react-native-toast-message';

export default function App() {
  return (
    <Provider store={store}>
      <RootNavigator />
      <Toast />
    </Provider>
  );
}
