import React from 'react';
import { Provider } from 'react-redux';
import {
    BrowserRouter as Router,
    Route,
    Switch,
} from 'react-router-dom';

import { ConnectedDashboard } from './Dashboard';
import { ConnectedConfigureCpu } from './ConfigureCpu';
import { ConnectedOverview } from './Overview';
import { ConnectedSystemConfigInput } from './SystemConfigInput';
import { ConnectedVulnClassSelector } from './VulnClassSelector';

import { store } from '../state';

import '../style/index.scss';

export const App: React.FC = () => {
    return (
        <Provider store={store}>
            <Router>
                <Switch>
                    <Route path='/dashboard' component={ ConnectedDashboard } />
                    <Route path='/vuln-class-selector/:systemUid?' component={ ConnectedVulnClassSelector } />
                    <Route path='/configure-cpu/:systemUid?' component={ ConnectedConfigureCpu } />
                    <Route path='/system-configuration/create/:workflowId' component={ ConnectedSystemConfigInput } />
                    <Route path='/system-configuration/edit/:workflowId/:systemConfigId' component={ ConnectedSystemConfigInput } />
                    <Route path='/' component={ ConnectedOverview } />
                </Switch>
            </Router>
        </Provider>
    );
};
