import * as React from "react";
import "./PlanPage.scss";
import { Page } from "azure-devops-ui/Page";
import PlanHeader from "./PlanHeader";
import { ConnectedEpicTimeline } from "./EpicTimeline";
import { PlanSummary } from "./PlanSummary";
import { IPortfolioPlanningState } from "../Redux/Contracts";
import { getProjectNames, getTeamNames } from "../Redux/Selectors/EpicTimelineSelectors";
import { getSelectedPlanOwner, getSelectedPlanMetadata } from "../Redux/Selectors/PlanDirectorySelectors";
import { IdentityRef } from "VSS/WebApi/Contracts";
import { connect } from "react-redux";
import { PlanDirectoryActions } from "../Redux/Actions/PlanDirectoryActions";
import { EpicTimelineActions } from "../Redux/Actions/EpicTimelineActions";
import { PortfolioPlanningMetadata } from "../Models/PortfolioPlanningQueryModels";

interface IPlanPageMappedProps {
    plan: PortfolioPlanningMetadata;
    projectNames: string[];
    teamNames: string[];
    planOwner: IdentityRef;
}

export type IPlanPageProps = IPlanPageMappedProps & typeof Actions;

export default class PlanPage extends React.Component<IPlanPageProps, IPortfolioPlanningState> {
    constructor(props: IPlanPageProps) {
        super(props);
    }

    public render() {
        return (
            <Page className="plan-page">
                <PlanHeader
                    id={this.props.plan.id}
                    name={this.props.plan.name}
                    description={this.props.plan.description}
                    backButtonClicked={this._backButtonClicked}
                    deleteButtonClicked={this._deleteButtonClicked}
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

    private _backButtonClicked = (): void => {
        this.props.toggleSelectedPlanId(undefined);
        this.props.resetPlanState();
    };

    private _deleteButtonClicked = (id: string): void => {
        this.props.deletePlan(id);
        this.props.resetPlanState();
    };
}

function mapStateToProps(state: IPortfolioPlanningState): IPlanPageMappedProps {
    return {
        plan: getSelectedPlanMetadata(state),
        projectNames: getProjectNames(state),
        teamNames: getTeamNames(state),
        planOwner: getSelectedPlanOwner(state)
    };
}

const Actions = {
    deletePlan: PlanDirectoryActions.deletePlan,
    toggleSelectedPlanId: PlanDirectoryActions.toggleSelectedPlanId,
    resetPlanState: EpicTimelineActions.resetPlanState
};

export const ConnectedPlanPage = connect(
    mapStateToProps,
    Actions
)(PlanPage);
