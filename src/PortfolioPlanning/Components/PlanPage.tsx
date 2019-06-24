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
            <Page className={"plan-page"}>
                <PlanHeader title={"Header title"} />
                <div className="page-content">
                    <ConnectedEpicTimeline />
                </div>
            </Page>
        );
    }
}
