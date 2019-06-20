import * as React from "react";
import * as ReactDOM from "react-dom";
import { iePollyfill } from "../polyfill";
import { ODataTest } from "./react/Components/ODataTest";

export function initialize(): void {
    if (!isBackground()) {
        iePollyfill();
        ReactDOM.render(<ODataTest/>, document.getElementById("root"));
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
