import {
    createStore,
    Store,
    combineReducers,
    Action,
    Reducer,
    applyMiddleware,
    compose,
    Middleware
} from "redux";
import createSagaMiddleware from "redux-saga";
import { IPortfolioPlanningState } from "./Contracts";
import { epicTimelineReducer } from "./Reducers/EpicTimelineReducer";
import { epicTimelineSaga } from "./Sagas/EpicTimelineSaga";

// setup reducers
const combinedReducers = combineReducers<IPortfolioPlanningState>({
    epicTimelineState: epicTimelineReducer
});

const reducers: Reducer<IPortfolioPlanningState> = (
    state: IPortfolioPlanningState,
    action: Action
) => {
    return combinedReducers(state, action);
};

const trackActions: Middleware = api => next => action => {
    //if (action["track"])
    {
        // TODO: Publish telemetry
        // console.log("TELEMETRY: ", action);
    }
    return next(action);
};

export default function configurePortfolioPlanningStore(
    initialState: IPortfolioPlanningState
): Store<IPortfolioPlanningState> {
    const sagaMonitor = window["__SAGA_MONITOR_EXTENSION__"] || undefined;
    const sagaMiddleWare = createSagaMiddleware({ sagaMonitor });
    const middleware = applyMiddleware(sagaMiddleWare, trackActions);

    // Setup for using the redux dev tools in chrome
    // https://chrome.google.com/webstore/detail/redux-devtools/lmhkpmbekcpmknklioeibfkpmmfibljd
    const composeEnhancers =
        window["__REDUX_DEVTOOLS_EXTENSION_COMPOSE__"] || compose;

    const store = createStore(
        reducers,
        initialState,
        composeEnhancers(middleware)
    );

    sagaMiddleWare.run(epicTimelineSaga);

    return store;
}
