import * as React from "react";
import "./PlanPage.scss";
import { Page } from "azure-devops-ui/Page";
import PlanHeader from "./PlanHeader";
import { ConnectedEpicTimeline } from "./EpicTimeline";

export interface PlanPageProps {}

export default class PlanPage extends React.Component<PlanPageProps> {
    constructor(props) {
        super(props);
    }
    public render() {
        return (
            <Page>
                <PlanHeader title={"Header title"} />
                <ConnectedEpicTimeline />
            </Page>
        );
    }
}
