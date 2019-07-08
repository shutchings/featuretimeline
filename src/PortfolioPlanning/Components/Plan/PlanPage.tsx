import * as React from "react";
import "./PlanPage.scss";
import { Page } from "azure-devops-ui/Page";
import PlanHeader from "./PlanHeader";
import { ConnectedPlanTimeline } from "./PlanTimeline";
import { PlanSummary } from "./PlanSummary";
import { IPortfolioPlanningState } from "../../Redux/Contracts";
import { getProjectNames, getTeamNames, getSelectedItem } from "../../Redux/Selectors/EpicTimelineSelectors";
import { getSelectedPlanMetadata } from "../../Redux/Selectors/PlanDirectorySelectors";
import { connect } from "react-redux";
import { PlanDirectoryActions } from "../../Redux/Actions/PlanDirectoryActions";
import { EpicTimelineActions } from "../../Redux/Actions/EpicTimelineActions";
import { PortfolioPlanningMetadata } from "../../Models/PortfolioPlanningQueryModels";
import { PlanSettingsPanel } from "./PlanSettingsPanel";
import { ProgressTrackingCriteria, ITimelineItem } from "../../Contracts";
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
    planSettingsPanelOpen: boolean;
    exceptionMessage: string;
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
                    disabled={!!this.props.exceptionMessage}
                    itemIsSelected={!!this.props.selectedItem}
                    onAddItemClicked={this.props.onOpenAddItemPanel}
                    onRemoveSelectedItemClicked={this._onRemoveSelectedEpicClick}
                    onBackButtonClicked={this._backButtonClicked}
                    onSettingsButtonClicked={this._settingsButtonClicked}
                />
                {this._renderPlanContent()}
                {this._renderAddItemPanel()}
                {this._renderItemDetailsDialog()}
                {this._renderPlanSettingsPanel()}
            </Page>
        );
    }

    private _renderPlanContent = (): JSX.Element => {
        return (
            <div className="page-content page-content-top">
                <PlanSummary
                    projectNames={this.props.projectNames}
                    teamNames={this.props.teamNames}
                    owner={this.props.plan.owner}
                />
                <ConnectedPlanTimeline />
            </div>
        );
    };

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

    private _renderPlanSettingsPanel = (): JSX.Element => {
        if (this.props.planSettingsPanelOpen) {
            return (
                <PlanSettingsPanel
                    selectedItem={this.props.selectedItem}
                    progressTrackingCriteria={this.props.progressTrackingCriteria}
                    onProgressTrackingCriteriaChanged={this._onProgressTrackingCriteriaChanged}
                    onDeletePlanClicked={this._deletePlanButtonClicked}
                    onClosePlanSettingsPanel={() => {
                        this.props.onTogglePlanSettingsPanelOpen(false);
                    }}
                />
            );
        }
    };

    private _backButtonClicked = (): void => {
        this.props.toggleSelectedPlanId(undefined);
        this.props.resetPlanState();
    };

    private _deletePlanButtonClicked = (): void => {
        this.props.deletePlan(this.props.plan.id);
        this.props.resetPlanState();
    };

    private _onRemoveSelectedEpicClick = (): void => {
        this.props.onRemoveSelectedItem({
            planId: this.props.plan.id,
            itemIdToRemove: this.props.selectedItem.id
        });
    };

    private _settingsButtonClicked = (): void => {
        this.props.onTogglePlanSettingsPanelOpen(true);
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
        setDatesDialogHidden: state.epicTimelineState.setDatesDialogHidden,
        planSettingsPanelOpen: state.epicTimelineState.planSettingsPanelOpen,
        exceptionMessage: state.epicTimelineState.exceptionMessage
    };
}

const Actions = {
    deletePlan: PlanDirectoryActions.deletePlan,
    toggleSelectedPlanId: PlanDirectoryActions.toggleSelectedPlanId,
    resetPlanState: EpicTimelineActions.resetPlanState,
    onOpenAddItemPanel: EpicTimelineActions.openAddItemPanel,
    onRemoveSelectedItem: EpicTimelineActions.removeItems,
    onToggleProgressTrackingCriteria: EpicTimelineActions.toggleProgressTrackingCriteria,
    onCloseAddItemPanel: EpicTimelineActions.closeAddItemPanel,
    onAddItems: EpicTimelineActions.addItems,
    onToggleSetDatesDialogHidden: EpicTimelineActions.toggleItemDetailsDialogHidden,
    onUpdateStartDate: EpicTimelineActions.updateStartDate,
    onUpdateEndDate: EpicTimelineActions.updateEndDate,
    onTogglePlanSettingsPanelOpen: EpicTimelineActions.togglePlanSettingsPanelOpen
};

export const ConnectedPlanPage = connect(
    mapStateToProps,
    Actions
)(PlanPage);
