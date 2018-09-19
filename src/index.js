// ignore localStorage requests in SSR

import React from 'react';
import ReactDOM from 'react-dom';
// import { unregister } from './registerServiceWorker';
import registerServiceWorker from './registerServiceWorker';
import { Provider } from 'react-redux';
import createHistory from 'history/createBrowserHistory';
import { Switch, Route, withRouter } from 'react-router';
import { ConnectedRouter } from 'react-router-redux';
import createStore from './redux/create-store';
import { ThemeProvider } from 'styled-components';
import BigNumber from 'bignumber.js';

import Loadermanager from './utils/Loadermanager';
import './styles/index.css';
import {
  userIsNotAuthenticatedRedir,
  userIsAuthenticatedRedir
} from './utils/auth';
import './index.css';
import theme from './utils/theme';
import LandingScreen from './components/landing/LandingScreen';

const AuthContainer = Loadermanager(() =>
  import(/* webpackChunkName: 'lazy' */ './components/authentication/AuthContainer')
);
const DiscoverScreen = Loadermanager(() =>
  import(/* webpackChunkName: 'lazy' */ './components/streams/DiscoverScreen')
);
const PurchasesScreen = Loadermanager(() =>
  import(/* webpackChunkName: 'lazy' */ './components/purchases/PurchasesScreen')
);
const ListingsScreen = Loadermanager(() =>
  import(/* webpackChunkName: 'lazy' */ './components/listings/ListingsScreen')
);
const EnlistStreamScreen = Loadermanager(() =>
  import(/* webpackChunkName: 'lazy' */ './components/listings/stream/EnlistStreamScreen')
);
const EnlistDatasetScreen = Loadermanager(() =>
  import(/* webpackChunkName: 'lazy' */ './components/listings/dataset/EnlistDatasetScreen')
);
const WalletScreen = Loadermanager(() =>
  import(/* webpackChunkName: 'lazy' */ './components/wallet/WalletScreen')
);
const StreamDetailsScreen = Loadermanager(() =>
  import(/* webpackChunkName: 'lazy' */ './components/details/stream/StreamDetailsScreen')
);
const UnsubscribedScreen = Loadermanager(() =>
  import(/* webpackChunkName: 'lazy' */ './components/unsubscribed/UnsubscribedScreen')
);
const DatasetsScreen = Loadermanager(() =>
  import(/* webpackChunkName: 'lazy' */ './components/datasets/DatasetsScreen')
);
const DatasetsDetailsScreen = Loadermanager(() =>
  import(/* webpackChunkName: 'lazy' */ './components/details/dataset/DatasetDetailsScreen')
);

// Config bigbumber globally so it will display all numbers with enough decimals. We don't want any scientific notations!
BigNumber.config({ EXPONENTIAL_AT: 256 });

// ========================================================
// Store Instantiation
// ========================================================
const initialState = window.__INITIAL_STATE__;
const history = createHistory();
const store = createStore(initialState, history);

// ========================================================
// Render Setup
// ========================================================
const MOUNT_NODE = document.getElementById('root');

export const App = () => (
  <ThemeProvider theme={theme}>
    <Provider store={store}>
      <ConnectedRouter history={history}>
        <Switch>
          <Route
            path="/account"
            component={withRouter(userIsNotAuthenticatedRedir(AuthContainer))}
          />
          <Route
            path="/streams/:location?"
            component={withRouter(DiscoverScreen)}
          />
          <Route path="/purchases" component={withRouter(PurchasesScreen)} />
          <Route path="/listings" component={withRouter(ListingsScreen)} />
          <Route
            path="/stream/enlist"
            component={withRouter(EnlistStreamScreen)}
          />
          <Route
            path="/dataset/enlist"
            component={withRouter(EnlistDatasetScreen)}
          />
          <Route path="/datasets" component={withRouter(DatasetsScreen)} />
          <Route
            path="/wallet"
            component={withRouter(userIsAuthenticatedRedir(WalletScreen))}
          />
          <Route
            path="/stream/:key"
            component={withRouter(StreamDetailsScreen)}
          />
          <Route
            path="/dataset/:key"
            component={withRouter(DatasetsDetailsScreen)}
          />
          <Route
            path="/unsubscribed"
            component={withRouter(UnsubscribedScreen)}
          />
          <Route path="/" component={LandingScreen} />
        </Switch>
      </ConnectedRouter>
    </Provider>
  </ThemeProvider>
);

const renderMethod = module.hot ? ReactDOM.render : ReactDOM.hydrate;
const render = () => {
  renderMethod(<App />, MOUNT_NODE);
};

// ========================================================
// Go!
// ========================================================

render();
if (process.env.NODE_ENV === 'production') {
  registerServiceWorker(); // disable during dev/test
}
