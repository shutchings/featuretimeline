import * as React from "react";
import "./PlanPage.scss";
import { Page } from "azure-devops-ui/Page";
import PlanHeader from "./PlanHeader";
import { ConnectedEpicTimeline } from "./EpicTimeline";
import { PlanSummary } from "./PlanSummary";
import { IPortfolioPlanningState } from "../Redux/Contracts";
import { getProjectNames, getTeamNames } from "../Redux/Selectors/EpicTimelineSelectors";
import { getSelectedPlanMetadata } from "../Redux/Selectors/PlanDirectorySelectors";
import { connect } from "react-redux";
import { PlanDirectoryActions } from "../Redux/Actions/PlanDirectoryActions";
import { EpicTimelineActions } from "../Redux/Actions/EpicTimelineActions";
import { PortfolioPlanningMetadata } from "../Models/PortfolioPlanningQueryModels";
import { PlanConfiguration } from "./PlanConfiguration";
import { ProgressTrackingCriteria } from "../Contracts";

interface IPlanPageMappedProps {
    plan: PortfolioPlanningMetadata;
    projectNames: string[];
    teamNames: string[];
    selectedItemId: number;
    progressTrackingCriteria: ProgressTrackingCriteria;
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
                    deleteButtonClicked={this._deletePlanButtonClicked}
                />
                <div className="page-content page-content-top">
                    <PlanSummary
                        projectNames={this.props.projectNames}
                        teamNames={this.props.teamNames}
                        owner={this.props.plan.owner}
                    />
                    <PlanConfiguration
                        selectedItemId={this.props.selectedItemId}
                        progressTrackingCriteria={this.props.progressTrackingCriteria}
                        onAddItemClick={this._onAddEpicClick}
                        onProgressTrackingCriteriaChanged={this._onProgressTrackingCriteriaChanged}
                        onRemoveSelectedItemClick={this._onRemoveSelectedEpicClick}
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

    private _deletePlanButtonClicked = (id: string): void => {
        this.props.deletePlan(id);
        this.props.resetPlanState();
    };

    private _onAddEpicClick = (): void => {
        this.props.onOpenAddEpicPanel();
    };

    private _onRemoveSelectedEpicClick = (): void => {
        this.props.onRemoveSelectedEpic({
            planId: this.props.plan.id,
            epicToRemove: this.props.selectedItemId
        });
    };

    private _onProgressTrackingCriteriaChanged = (item: { key: string; text: string }) => {
        switch (item.key) {
            case "completedCount":
                this.props.onToggleProgressTrackingCriteria(ProgressTrackingCriteria.CompletedCount);
                break;
            case "storyPoints":
                this.props.onToggleProgressTrackingCriteria(ProgressTrackingCriteria.StoryPoints);
                break;
        }
    };
}

function mapStateToProps(state: IPortfolioPlanningState): IPlanPageMappedProps {
    return {
        plan: getSelectedPlanMetadata(state),
        projectNames: getProjectNames(state),
        teamNames: getTeamNames(state),
        selectedItemId: state.epicTimelineState.selectedItemId,
        progressTrackingCriteria: state.epicTimelineState.progressTrackingCriteria
    };
}

const Actions = {
    deletePlan: PlanDirectoryActions.deletePlan,
    toggleSelectedPlanId: PlanDirectoryActions.toggleSelectedPlanId,
    resetPlanState: EpicTimelineActions.resetPlanState,
    onOpenAddEpicPanel: EpicTimelineActions.openAddEpicPanel,
    onRemoveSelectedEpic: EpicTimelineActions.removeEpic,
    onToggleProgressTrackingCriteria: EpicTimelineActions.toggleProgressTrackingCriteria
};

export const ConnectedPlanPage = connect(
    mapStateToProps,
    Actions
)(PlanPage);
