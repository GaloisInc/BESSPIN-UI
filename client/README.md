# BESSPIN UI POC using React

This is just a proof-of-concept, showing a basic UI built using [Create React App](https://github.com/facebook/create-react-app), [Typescript](https://www.typescriptlang.org/), [Redux](https://react-redux.js.org/), [Sagas](https://redux-saga.js.org/), [React Router](https://reacttraining.com/react-router/web/guides/quick-start), and [React Bootstrap](https://react-bootstrap.github.io/).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.<br />
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br />
You will also see any lint errors in the console.

### `npm run start:debug`

Runs the app in development mode, adding the ability to do step debugging from your IDE (provided it supports Node debugging).<br />
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br />
You will also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.<br />
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run test:coverage`

Runs the unit tests with coverage enabled. Once complete, you can open
[the coverage report](file://./coverage/lcov-report/index.html) to see the results in a browser.

### `npm run build`

Builds the app for production to the `build` folder.<br />
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.<br />
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (Webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

## Project structure

This project, though based on `create-react-app`, is organized in a manner that is conducive to using [Redux](https://react-redux.js.org/) and [Sagas](https://redux-saga.js.org/) for state-management.

```
/src
   /api  /* any code communicating with external apis */
   /assets /* create-react-app directories for assets */
   /components /* stateless React components (generally abstractions of common UI patterns) */
   /pages /* generally stateful React components that encapsulate a given page in the UI */
   /state /* redux/saga based code for managing the application state */
   /style /* SASS stylesheets for pages/components */
   index.tsx /* create-react-app generated entry point into the UI */
```

## State management

This project uses [Redux](https://react-redux.js.org/) and [Sagas](https://redux-saga.js.org/) for managing state. While it is very much encouraged to read up on these technologies, the basics of how this project is structured are:

### Create a file for the "model" data you are managing in state

There is already a `ui.ts` module for managing basic UI state (i.e. whether app is loading data, errors that should be rendered, etc), but if you decide this application will be managing something like "test configurations", you would create a `test-configuration.ts` module for managing that.

### Define the "actions"

[Redux](https://react-redux.js.org/) uses an "action", "action-creator", "reducer" model whereby an "action-creator" fires off an "action" which is listened for by a "reducer" (and possibly a "saga" if there are side-effects such as network calls) which then updates the application state appropriately. The ideal here is that this creates a uni-directional state-flow whereby mutations to the application state follow a well-defined path, making it both easier to reason about as well as reducing the bugs that come from distributed state mutations.

To defined an [action](https://redux.js.org/basics/actions), you simply create a constant like:

```javascript
export const IS_LOADING = 'ui/is-loading';
```

This is simply a unique identifirer for an action which will trigger some change in the application's state.

You then define an [action-creator](https://redux.js.org/basics/actions#action-creators) like:

```javascript
export const isLoading = (isLoading=false) => {
export const fetchSystemsSuccess = (systems: ISystemEntry[]) => {
    return {
        type: SystemActionTypes.FETCH_TEST_SYSTEMS_SUCCESS,
        data: {
            systems,
        },
    } as const;
};
```

All [action-creators](https://redux.js.org/basics/actions#action-creators) have a payload that has the Typescript interface:

```typescript
interface IAction {
    type: string;
    data?: any;
}
```

### "Reduce" changes into your current state

If there is actual change to the state, you then need to add code in your [reducer](https://redux.js.org/basics/reducers):

```typescript
export const reducer = (state = DEFAULT_STATE, action: IUiAction) => {
    switch (action.type) {
        case SystemActionTypes.FETCH_TEST_SYSTEMS_SUCCESS:
            return {
                ...state,
                systems: action.data.systems,
            };
        default:
            return state;
    }
};
```

### Create "selectors" to access properties in your state

Rather than directly acccessing data within state, this project has been set up to use [Reselect](https://github.com/reduxjs/reselect) for creating "selectors" for accessing deeper properties within your state. Basically, these are memoized functions which allow for specifying upstream dependencies on your data.

```javascript
export const getSystem = (state: IState) => state.system;

export const getSystems = createSelector(
    [getSystem],
    (system) => system.systems,
);
```

### "connecting" your page component

Actually plugging this state management into your page is a matter of "connecting" the [React Component](https://reactjs.org/docs/components-and-props.html) with your [Redux](https://redux.js.org/) state using [connect](https://react-redux.js.org/api/connect).

In order to do this, you need to map your state to the relevant [React props](https://reactjs.org/docs/components-and-props.html) by writing a [mapStateToProps](https://react-redux.js.org/api/connect#mapstatetoprops-state-ownprops-object) and then [connect](https://react-redux.js.org/api/connect#connect-parameters)ing it to the component:

```javascript
import { connect } from 'react-redux';
import { getIsLoading, doFoo } from '../state/ui';

// some definition of the stateless Foo...

const mapStateToProps = (state) =>{
    return {
        isLoading: getIsLoading(state),
    };
}

// if your component needs to handle user interactions which change the state of the application, then you can pass in your action-creators using mapDispathToProps
const mapStateToDispatch = (dispatch) => {
    return {
        onSomeUiEvent: (someArg) => dispatch(doFoo(someArg)),
    };
};

export ConnectedFoo = connect(mapStateToProps, mapDispatchToProps)(Foo);
```

# Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

## Additional reading for this project

In addition to [React](https://reactjs.org/), this project leverages the following technologies:
 - [Redux](https://redux.js.org/) - State management (also see [react-redux](https://react-redux.js.org/) for information specific to its usage in [React](https://reactjs.org/))
 - [Sagas](https://redux-saga.js.org/) - Coordination of multi-step asynchronous actions within [Redux](https://redux.js.org/)
 - [react-bootstrap](https://react-bootstrap.github.io/) - [React](https://reactjs.org/) implementations of [Bootstrap](https://getbootstrap.com/) components
 - [D3](https://d3js.org/) - visualization library