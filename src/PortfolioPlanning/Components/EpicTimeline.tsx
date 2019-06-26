import * as React from "react";
import * as moment from "moment";
import {
    ITimelineGroup,
    ITimelineItem,
    ProgressTrackingCriteria,
    ITeam
} from "../Contracts";
import Timeline from "react-calendar-timeline";
import "./EpicTimeline.scss";
import {
    IEpicTimelineState,
    IPortfolioPlanningState
} from "../Redux/Contracts";
import {
    getAddEpicDialogOpen,
    getSetDatesDialogHidden,
    getTimelineGroups,
    getTimelineItems,
    getProgressTrackingCriteria
} from "../Redux/Selectors/EpicTimelineSelectors";
import { EpicTimelineActions } from "../Redux/Actions/EpicTimelineActions";
import { connect } from "react-redux";
import { DetailsDialog } from "./DetailsDialog";
import { AddEpicDialog } from "./AddEpicDialog";
import { ComboBox } from "office-ui-fabric-react/lib/ComboBox";
import { ProgressDetails } from "../../Common/react/Components/ProgressDetails/ProgressDetails";
import { InfoIcon } from "../../Common/react/Components/InfoIcon/InfoIcon";

const day = 60 * 60 * 24 * 1000;
const week = day * 7;

interface IEpicTimelineOwnProps {}

interface IEpicTimelineMappedProps {
    planId: string;
    groups: ITimelineGroup[];
    teams: { [teamId: string] : ITeam };
    items: ITimelineItem[];
    addEpicDialogOpen: boolean;
    setDatesDialogHidden: boolean;
    selectedItemId: number;
    progressTrackingCriteria: ProgressTrackingCriteria;
}

export type IEpicTimelineProps = IEpicTimelineOwnProps &
    IEpicTimelineMappedProps &
    typeof Actions;

export class EpicTimeline extends React.Component<
    IEpicTimelineProps,
    IEpicTimelineState
> {
    constructor() {
        super();
    }

    public render(): JSX.Element {
        const selectedItem = this.props.items.find(
            item => item.id === this.props.selectedItemId
        );

        const selectedProgressCriteriaKey =
            this.props.progressTrackingCriteria ===
            ProgressTrackingCriteria.CompletedCount
                ? "completedCount"
                : "storyPoints";

        const [defaultTimeStart, defaultTimeEnd] = this._getDefaultTimes(
            this.props.items
        );

        const forwardCircleStyle ={
            padding: '0px 0px 0px 10px',
        };

        return (
            <div>
                <div className="configuration-container">
                    <div className="progress-options">
                        <div className="progress-options-label">
                            Track Progress Using:{" "}
                        </div>
                        <ComboBox
                            className="progress-options-dropdown"
                            selectedKey={selectedProgressCriteriaKey}
                            allowFreeform={false}
                            autoComplete="off"
                            options={[
                                {
                                    key: "completedCount",
                                    text:
                                        ProgressTrackingCriteria.CompletedCount
                                },
                                {
                                    key: "storyPoints",
                                    text: ProgressTrackingCriteria.StoryPoints
                                }
                            ]}
                            onChanged={this._onProgressTrackingCriteriaChanged}
                        />
                    </div>
                    <button
                        className="epictimeline-add-epic-button"
                        onClick={this._onAddEpicClick}
                    >
                        Add Epic
                    </button>
                    <button
                        className="epictimeline-add-epic-button"
                        disabled={!this.props.selectedItemId}
                        onClick={this._onRemoveSelectedEpicClick}
                    >
                        Remove selected epic from plan
                    </button>
                </div>
                <Timeline
                    groups={this.props.groups}
                    items={this.props.items}
                    defaultTimeStart={defaultTimeStart}
                    defaultTimeEnd={defaultTimeEnd}
                    canChangeGroup={false}
                    stackItems={true}
                    dragSnap={day}
                    minZoom={week}
                    canResize={"both"}
                    minResizeWidth={50}
                    onItemResize={this._onItemResize}
                    onItemMove={this._onItemMove}
                    moveResizeValidator={this._validateResize}
                    selecte={[this.props.selectedItemId]}
                    onItemSelect={itemId =>
                        this.props.onSetSelectedItemId(itemId)
                    }
                    onCanvasClick={() =>
                        this.props.onSetSelectedItemId(undefined)
                    }
                    itemRenderer={({ item, itemContext, getItemProps }) => {
                        return (
                            <div {...getItemProps(item.itemProps)}>
                                <div
                                    style={{
                                        maxHeight: `${
                                            itemContext.dimensions.height
                                        }`,
                                        display: "flex",
                                        justifyContent: "space-between",
                                        overflow: "hidden",
                                        marginRight: "5px",
                                        alignItems: "baseline"
                                    }}
                                >
                                    {itemContext.title}
                                    <div
                                        style={{
                                            display: "flex",
                                            justifyContent: "flex-end"
                                        }}
                                    >
                                        <InfoIcon
                                            id={item.id}
                                            onClick={() =>
                                                this.props.onToggleSetDatesDialogHidden(
                                                    false
                                                )
                                            }
                                        />
                                        <ProgressDetails
                                            completed={item.itemProps.completed}
                                            total={item.itemProps.total}
                                            onClick={() => {}}
                                        />
                                        <div
                                            className="bowtie-icon bowtie-navigate-forward-circle"
                                            style={forwardCircleStyle}
                                            onClick={() => this.navigateToEpicRoadmap(item)}>
                                            &nbsp;
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    }}
                />
                {this._renderAddEpicDialog()}
                {this.props.selectedItemId && (
                    <DetailsDialog
                        key={Date.now()} // TODO: Is there a better way to reset the state?
                        id={this.props.selectedItemId}
                        title={selectedItem.title}
                        startDate={selectedItem.start_time}
                        endDate={selectedItem.end_time}
                        hidden={this.props.setDatesDialogHidden}
                        save={(id, startDate, endDate) => {
                            this.props.onUpdateStartDate(id, startDate);
                            this.props.onUpdateEndDate(id, endDate);
                        }}
                        close={() => {
                            this.props.onToggleSetDatesDialogHidden(true);
                        }}
                    />
                )}
            </div>
        );
    }

    private _validateResize(
        action: string,
        item: ITimelineItem,
        time: number,
        resizeEdge: string
    ) {
        if (action === "resize") {
            if (resizeEdge === "right") {
                const difference = time - item.start_time.valueOf();
                if (difference < day) {
                    time = item.start_time.valueOf() + day;
                }
            } else {
                const difference = item.end_time.valueOf() - time;
                if (difference < day) {
                    time = item.end_time.valueOf() - day;
                }
            }
        } else if (action === "move") {
            // TODO: Any validation for moving?
        }

        return time;
    }

    private _onItemResize = (
        itemId: number,
        time: number,
        edge: string
    ): void => {
        if (edge == "left") {
            this.props.onUpdateStartDate(itemId, moment(time));
        } else {
            // "right"
            this.props.onUpdateEndDate(itemId, moment(time));
        }
    };

    private _onItemMove = (itemId: number, time: number): void => {
        this.props.onShiftEpic(itemId, moment(time));
    };

    private _onAddEpicClick = (): void => {
        this.props.onOpenAddEpicDialog();
    };

    private _onRemoveSelectedEpicClick = (): void => {
        this.props.onRemoveSelectedEpic({
            planId: this.props.planId,
            epicToRemove: this.props.selectedItemId
        });
    };

    private _onProgressTrackingCriteriaChanged = (item: {
        key: string;
        text: string;
    }) => {
        switch (item.key) {
            case "completedCount":
                this.props.onToggleProgressTrackingCriteria(
                    ProgressTrackingCriteria.CompletedCount
                );
                break;
            case "storyPoints":
                this.props.onToggleProgressTrackingCriteria(
                    ProgressTrackingCriteria.StoryPoints
                );
                break;
        }
    };

    private _renderAddEpicDialog(): JSX.Element {
        if (this.props.addEpicDialogOpen) {
            return (
                <AddEpicDialog
                    planId={this.props.planId}
                    onCloseAddEpicDialog={this.props.onCloseAddEpicDialog}
                    onAddEpics={this.props.onAddEpics}
                />
            );
        }
    }

    // TODO: We only need this on first render
    private _getDefaultTimes(
        items: ITimelineItem[]
    ): [moment.Moment, moment.Moment] {
        let startTime = moment().add(-1, "months");
        let endTime = moment().add(1, "months");

        for (const item of items) {
            if (item.start_time < startTime) {
                startTime = moment(item.start_time).add(-1, "months");
            }
            if (item.end_time > endTime) {
                endTime = moment(item.end_time).add(1, "months");
            }
        }

        return [startTime, endTime];
    }

    private navigateToEpicRoadmap(item: ITimelineItem)
    {
        const collectionUri = VSS.getWebContext().collection.uri;
        const projectName = item.group;
        const teamId = item.teamId;
        //  TODO    Need to get the backlog level somewhere....
        const backlogLevel = "Epics";
        const workItemId = item.id;

        const targerUrl = `${collectionUri}${projectName}/_backlogs/ms-devlabs.workitem-feature-timeline-extension-dev.workitem-epic-roadmap/${teamId}/${backlogLevel}#${workItemId}`;

        VSS.getService<IHostNavigationService>(VSS.ServiceIds.Navigation).then(
            (client) => client.navigate(targerUrl),
            (error) => alert(error)
        );
    }
}

function mapStateToProps(
    state: IPortfolioPlanningState
): IEpicTimelineMappedProps {
    return {
        planId: state.planDirectoryState.selectedPlanId,
        groups: getTimelineGroups(state.epicTimelineState),
        teams: state.epicTimelineState.teams,
        items: getTimelineItems(state.epicTimelineState),
        addEpicDialogOpen: getAddEpicDialogOpen(state.epicTimelineState),
        setDatesDialogHidden: getSetDatesDialogHidden(state.epicTimelineState),
        selectedItemId: state.epicTimelineState.selectedItemId,
        progressTrackingCriteria: getProgressTrackingCriteria(
            state.epicTimelineState
        )
    };
}

const Actions = {
    onOpenAddEpicDialog: EpicTimelineActions.openAddEpicDialog,
    onCloseAddEpicDialog: EpicTimelineActions.closeAddEpicDialog,
    onAddEpics: EpicTimelineActions.addEpics,
    onUpdateStartDate: EpicTimelineActions.updateStartDate,
    onUpdateEndDate: EpicTimelineActions.updateEndDate,
    onShiftEpic: EpicTimelineActions.shiftEpic,
    onToggleSetDatesDialogHidden:
        EpicTimelineActions.toggleSetDatesDialogHidden,
    onSetSelectedItemId: EpicTimelineActions.setSelectedItemId,
    onToggleProgressTrackingCriteria:
        EpicTimelineActions.toggleProgressTrackingCriteria,
    onRemoveSelectedEpic: EpicTimelineActions.removeEpic
};

export const ConnectedEpicTimeline = connect(
    mapStateToProps,
    Actions
)(EpicTimeline);
