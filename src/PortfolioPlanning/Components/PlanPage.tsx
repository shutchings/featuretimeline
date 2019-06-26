import * as React from "react";
import "./PlanPage.scss";
import { Page } from "azure-devops-ui/Page";
import PlanHeader from "./PlanHeader";
import { ConnectedEpicTimeline } from "./EpicTimeline";

export interface PlanPageProps {
    id: string;
    title: string;
    description: string;
    backButtonClicked: () => void;
    deleteButtonClicked: (id: string) => void;
}

export default class PlanPage extends React.Component<PlanPageProps> {
    constructor(props) {
        super(props);
    }

    public render() {
        return (
            <Page className="plan-page">
                <PlanHeader
                    id={this.props.id}
                    name={this.props.title}
                    description={this.props.description}
                    backButtonClicked={this.props.backButtonClicked}
                    deleteButtonClicked={this.props.deleteButtonClicked}
                />
                <div className="page-content page-content-top">
                    <ConnectedEpicTimeline />
                </div>
            </Page>
        );
    }
}
