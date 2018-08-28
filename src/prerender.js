import React from 'react';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import { StaticRouter } from 'react-router';
import { ThemeProvider } from 'styled-components';

import makeRootReducer from './redux/root-reducer';
import LandingScreen from './components/landing/LandingScreen';
import theme from './utils/theme';

import { renderToString } from 'react-dom/server';
import { ServerStyleSheet } from 'styled-components';

const store = createStore(makeRootReducer(), {});

const App = () => (
  <ThemeProvider theme={theme}>
    <Provider store={store}>
      <StaticRouter>
        <LandingScreen />
      </StaticRouter>
    </Provider>
  </ThemeProvider>
);
const sheet = new ServerStyleSheet();
export const body = renderToString(sheet.collectStyles(<App />));
export const styleTags = sheet.getStyleTags();
