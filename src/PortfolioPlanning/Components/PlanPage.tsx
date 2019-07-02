import * as React from "react";
import "./PlanPage.scss";
import { Page } from "azure-devops-ui/Page";
import PlanHeader from "./PlanHeader";
import { ConnectedPlanTimeline } from "./PlanTimeline";
import { PlanSummary } from "./PlanSummary";
import { IPortfolioPlanningState } from "../Redux/Contracts";
import { getProjectNames, getTeamNames, getSelectedItem } from "../Redux/Selectors/EpicTimelineSelectors";
import { getSelectedPlanMetadata } from "../Redux/Selectors/PlanDirectorySelectors";
import { connect } from "react-redux";
import { PlanDirectoryActions } from "../Redux/Actions/PlanDirectoryActions";
import { EpicTimelineActions } from "../Redux/Actions/EpicTimelineActions";
import { PortfolioPlanningMetadata } from "../Models/PortfolioPlanningQueryModels";
import { PlanConfiguration } from "./PlanConfiguration";
import { ProgressTrackingCriteria, ITimelineItem } from "../Contracts";
import { AddItemPanel } from "./AddItemPanel";
import { DetailsDialog } from "./DetailsDialog";

interface IPlanPageMappedProps {
    plan: PortfolioPlanningMetadata;
    projectNames: string[];
    teamNames: string[];
    selectedItem: ITimelineItem;
    progressTrackingCriteria: ProgressTrackingCriteria;
    addItemPanelOpen: boolean;
    setDatesDialogHidden: boolean;
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
                        selectedItem={this.props.selectedItem}
                        progressTrackingCriteria={this.props.progressTrackingCriteria}
                        onAddItemClick={this._onAddEpicClick}
                        onProgressTrackingCriteriaChanged={this._onProgressTrackingCriteriaChanged}
                        onRemoveSelectedItemClick={this._onRemoveSelectedEpicClick}
                    />
                    <ConnectedPlanTimeline />
                </div>
                {this._renderAddItemPanel()}
                {this._renderItemDetailsDialog()}
            </Page>
        );
    }

    private _renderAddItemPanel = (): JSX.Element => {
        if (this.props.addItemPanelOpen) {
            return (
                <AddItemPanel
                    planId={this.props.plan.id}
                    onCloseAddItemPanel={this.props.onCloseAddItemPanel}
                    onAddItems={this.props.onAddItems}
                />
            );
        }
    };

    private _renderItemDetailsDialog = (): JSX.Element => {
        if (this.props.selectedItem) {
            return (
                <DetailsDialog
                    key={Date.now()} // TODO: Is there a better way to reset the state?
                    id={this.props.selectedItem.id}
                    title={this.props.selectedItem.title}
                    startDate={this.props.selectedItem.start_time}
                    endDate={this.props.selectedItem.end_time}
                    hidden={this.props.setDatesDialogHidden}
                    save={(id, startDate, endDate) => {
                        this.props.onUpdateStartDate(id, startDate);
                        this.props.onUpdateEndDate(id, endDate);
                    }}
                    close={() => {
                        this.props.onToggleSetDatesDialogHidden(true);
                    }}
                />
            );
        }
    };

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
            itemIdToRemove: this.props.selectedItem.id
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
        selectedItem: getSelectedItem(state.epicTimelineState),
        progressTrackingCriteria: state.epicTimelineState.progressTrackingCriteria,
        addItemPanelOpen: state.epicTimelineState.addEpicDialogOpen,
        setDatesDialogHidden: state.epicTimelineState.setDatesDialogHidden
    };
}

const Actions = {
    deletePlan: PlanDirectoryActions.deletePlan,
    toggleSelectedPlanId: PlanDirectoryActions.toggleSelectedPlanId,
    resetPlanState: EpicTimelineActions.resetPlanState,
    onOpenAddEpicPanel: EpicTimelineActions.openAddEpicPanel,
    onRemoveSelectedEpic: EpicTimelineActions.removeItems,
    onToggleProgressTrackingCriteria: EpicTimelineActions.toggleProgressTrackingCriteria,
    onCloseAddItemPanel: EpicTimelineActions.closeAddEpicPanel,
    onAddItems: EpicTimelineActions.addItems,
    onToggleSetDatesDialogHidden: EpicTimelineActions.toggleItemDetailsDialogHidden,
    onUpdateStartDate: EpicTimelineActions.updateStartDate,
    onUpdateEndDate: EpicTimelineActions.updateEndDate
};

export const ConnectedPlanPage = connect(
    mapStateToProps,
    Actions
)(PlanPage);
