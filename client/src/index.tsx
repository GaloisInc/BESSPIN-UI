import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import {
    BrowserRouter as Router,
    Route,
    Switch,
} from 'react-router-dom';

import { ConnectedDashboard } from './pages/Dashboard';
import { ConnectedConfigureCpu } from './pages/ConfigureCpu';
import { ConnectedOverview } from './pages/Overview';

import { store } from './state';

import './style/index.scss';

import * as serviceWorker from './serviceWorker';

ReactDOM.render(
    <Provider store={store}>
        <Router>
            <Switch>
                <Route path='/dashboard' component={ ConnectedDashboard } />
                <Route path='/configure-cpu/:systemHash?' component={ ConnectedConfigureCpu } />
                <Route path='/' component={ ConnectedOverview } />
            </Switch>
        </Router>
    </Provider>, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
