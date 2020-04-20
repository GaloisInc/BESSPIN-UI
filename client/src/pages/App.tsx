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
import { ConnectedArchExtract } from './ArchExtract';
import { ConnectedFeatExtract } from './FeatExtract';
import { ConnectedSystemConfigInput } from './SystemConfigInput';
import { ConnectedTestgenConfigInput } from './TestgenConfigInput';
import { ConnectedVulnerability } from './Vulnerability';
import { ConnectedReport } from './Report';

import { store } from '../state';

import '../style/index.scss';

export const App: React.FC = () => {
    return (
        <Provider store={store}>
            <Router>
                <Switch>
                    <Route path='/dashboard' component={ ConnectedDashboard } />
                    <Route path='/configure-cpu/:systemUid?' component={ ConnectedConfigureCpu } />
                    <Route path='/system-configuration/create/:workflowId' component={ ConnectedSystemConfigInput } />
                    <Route path='/system-configuration/edit/:workflowId/:systemConfigId' component={ ConnectedSystemConfigInput } />
                    <Route path='/testgen-configuration/create/:workflowId' component={ ConnectedTestgenConfigInput } />
                    <Route path='/testgen-configuration/edit/:workflowId/:testgenConfigId' component={ ConnectedTestgenConfigInput } />
                    <Route path='/vuln-configuration/create/:workflowId' component={ ConnectedVulnerability } />
                    <Route path='/vuln-configuration/edit/:workflowId/:testId' component={ ConnectedVulnerability } />
                    <Route path='/report/:workflowId' component={ ConnectedReport } />
                    <Route path='/arch-extract/' component={ ConnectedArchExtract } />
                    <Route path='/arch-extract/:archExtractId' component={ ConnectedArchExtract } />
                    <Route path='/feat-extract/' component={ ConnectedFeatExtract } />
                    <Route path='/' component={ ConnectedOverview } />
                </Switch>
            </Router>
        </Provider>
    );
};
