import * as React from "react";
import "./PlanPage.scss";
import { Page } from "azure-devops-ui/Page";
import PlanHeader from "./PlanHeader";
import { ConnectedEpicTimeline } from "./EpicTimeline";
import { PlanSummary } from "./PlanSummary";
import { IPortfolioPlanningState } from "../Redux/Contracts";
import { getProjectNames, getTeamNames } from "../Redux/Selectors/EpicTimelineSelectors";
import { getSelectedPlanOwner } from "../Redux/Selectors/PlanDirectorySelectors";
import { IdentityRef } from "VSS/WebApi/Contracts";
import { connect } from "react-redux";

interface IPlanPageOwnProps {
    planId: string;
    title: string;
    description: string;
    backButtonClicked: () => void;
    deleteButtonClicked: (id: string) => void;
}

interface IPlanPageMappedProps {
    projectNames: string[];
    teamNames: string[];
    planOwner: IdentityRef;
}

export type IPlanPageProps = IPlanPageOwnProps & IPlanPageMappedProps & typeof Actions;

export default class PlanPage extends React.Component<IPlanPageProps, IPortfolioPlanningState> {
    constructor(props: IPlanPageProps) {
        super(props);
    }

    public render() {
        return (
            <Page className="plan-page">
                <PlanHeader
                    id={this.props.planId}
                    name={this.props.title}
                    description={this.props.description}
                    backButtonClicked={this.props.backButtonClicked}
                    deleteButtonClicked={this.props.deleteButtonClicked}
                />
                <div className="page-content page-content-top">
                    <PlanSummary
                        projectNames={this.props.projectNames}
                        teamNames={this.props.teamNames}
                        owner={this.props.planOwner}
                    />
                    <ConnectedEpicTimeline />
                </div>
            </Page>
        );
    }
}

function mapStateToProps(state: IPortfolioPlanningState): IPlanPageMappedProps {
    return {
        projectNames: getProjectNames(state),
        teamNames: getTeamNames(state),
        planOwner: getSelectedPlanOwner(state)
    };
}

const Actions = {};

export const ConnectedPlanPage = connect(
    mapStateToProps,
    Actions
)(PlanPage);
