import * as React from "react";
import * as ReactDOM from "react-dom";
import { iePollyfill } from "../polyfill";
import configurePortfolioPlanningStore from "./Redux/PortfolioPlanningStore";
import { Provider } from "react-redux";
import { getDefaultState } from "./Redux/Reducers/EpicTimelineReducer";
import PlanPage from "./Components/PlanPage";
import PlanDirectoryPage from "./Components/Directory/PlanDirectoryPage";

export function initialize(): void {
    if (!isBackground()) {
        iePollyfill();
        const store = configurePortfolioPlanningStore({
            epicTimelineState: getDefaultState()
        });

        const showDirectory = true;
        ReactDOM.render(
            <Provider store={store}>
                {showDirectory ? <PlanDirectoryPage /> : <PlanPage />}
            </Provider>,
            document.getElementById("root")
        );
    }
}

export function unmount(): void {
    if (!isBackground()) {
        ReactDOM.unmountComponentAtNode(document.getElementById("root"));
    }
}

function isBackground() {
    const contributionContext = VSS.getConfiguration();
    return contributionContext.host && contributionContext.host.background;
}
