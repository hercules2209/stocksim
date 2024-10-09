import React from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { store } from './redux/store';
import './style.css';
import App from './App';
import { ThemeProvider } from './contexts/ThemeContext';
import { FirebaseAppProvider } from 'reactfire';
import { app } from './firebase';

const container = document.getElementById('root');
const root = createRoot(container);

root.render(
  <React.StrictMode>
    <FirebaseAppProvider firebaseApp={app}>
      <Provider store={store}>
        <ThemeProvider>
          <App />
        </ThemeProvider>
      </Provider>
    </FirebaseAppProvider>
  </React.StrictMode>
);