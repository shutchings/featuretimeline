import * as React from "react";
import * as moment from "moment";
import {
    IProject,
    IEpic,
    ITimelineGroup,
    ITimelineItem,
    ProgressTrackingCriteria
} from "../Contracts";
import Timeline from "react-calendar-timeline";
import "./EpicTimeline.scss";
import {
    IEpicTimelineState,
    IPortfolioPlanningState
} from "../Redux/Contracts";
import {
    getEpics,
    getProjects,
    getAddEpicDialogOpen,
    getOtherEpics,
    getSetDatesDialogHidden
} from "../Redux/Selectors/EpicTimelineSelectors";
import { EpicTimelineActions } from "../Redux/Actions/EpicTimelineActions";
import { connect } from "react-redux";
import { SetDatesDialog } from "./SetDatesDialog";
import { AddEpicDialog } from "./AddEpicDialog";
import { ComboBox } from "office-ui-fabric-react/lib/ComboBox";

const day = 60 * 60 * 24 * 1000;
const week = day * 7;

interface IEpicTimelineOwnProps {}

interface IEpicTimelineMappedProps {
    projects: IProject[];
    epics: IEpic[];
    otherEpics: IEpic[];
    addEpicDialogOpen: boolean;
    setDatesDialogHidden: boolean;
    selectedEpicId: number;
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
        const selectedEpic = this.props.epics.find(
            epic => epic.id === this.props.selectedEpicId
        );
        const timelineGroups: ITimelineGroup[] = this.props.projects.map(
            this._mapProjectToTimelineGroups
        );
        const timelineItems: ITimelineItem[] = this.props.epics.map(
            this._mapEpicToTimelineItem
        );

        const selectedKey =
            this.props.progressTrackingCriteria ===
            ProgressTrackingCriteria.CompletedCount
                ? "completedCount"
                : "storyPoints";

        return (
            <div>
                <div className="configuration-container">
                    <div className="progress-options">
                        <div className="progress-options-label">
                            Track Progress Using:{" "}
                        </div>
                        <ComboBox
                            className="progress-options-dropdown"
                            selectedKey={selectedKey}
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
                </div>
                <Timeline
                    groups={timelineGroups}
                    items={timelineItems}
                    defaultTimeStart={moment().add(-6, "month")}
                    defaultTimeEnd={moment().add(6, "month")}
                    canChangeGroup={false}
                    stackItems={true}
                    dragSnap={day}
                    minZoom={week}
                    canResize={"both"}
                    minResizeWidth={50}
                    onItemResize={this._onItemResize}
                    onItemMove={this._onItemMove}
                    moveResizeValidator={this._validateResize}
                    onItemSelect={itemId =>
                        this.props.onSetSelectedEpicId(itemId)
                    }
                    onItemClick={() => {
                        this.props.onToggleSetDatesDialogHidden(false);
                    }}
                />
                {this._renderAddEpicDialog()}
                {this.props.selectedEpicId && (
                    <SetDatesDialog
                        key={
                            this.props.selectedEpicId +
                            selectedEpic.startDate.getTime() +
                            selectedEpic.endDate.getTime()
                        }
                        id={this.props.selectedEpicId}
                        title={selectedEpic.title}
                        startDate={moment(selectedEpic.startDate)}
                        endDate={moment(selectedEpic.endDate)}
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
                    onCloseAddEpicDialog={this.props.onCloseAddEpicDialog}
                    otherEpics={this.props.otherEpics}
                    onAddEpics={this.props.onAddEpics}
                />
            );
        }
    }

    private _mapProjectToTimelineGroups(project: IProject): ITimelineGroup {
        return {
            id: project.id,
            title: project.title
        };
    }

    private _mapEpicToTimelineItem(epic: IEpic): ITimelineItem {
        return {
            id: epic.id,
            group: epic.project,
            title: epic.title,
            start_time: moment(epic.startDate),
            end_time: moment(epic.endDate)
        };
    }
}

function mapStateToProps(
    state: IPortfolioPlanningState
): IEpicTimelineMappedProps {
    return {
        projects: getProjects(state.epicTimelineState),
        epics: getEpics(state.epicTimelineState),
        otherEpics: getOtherEpics(state.epicTimelineState),
        addEpicDialogOpen: getAddEpicDialogOpen(state.epicTimelineState),
        setDatesDialogHidden: getSetDatesDialogHidden(state.epicTimelineState),
        selectedEpicId: state.epicTimelineState.selectedEpicId,
        progressTrackingCriteria:
            state.epicTimelineState.progressTrackingCriteria
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
    onSetSelectedEpicId: EpicTimelineActions.setSelectedEpicId,
    onToggleProgressTrackingCriteria:
        EpicTimelineActions.ToggleProgressTrackingCriteria
};

export const ConnectedEpicTimeline = connect(
    mapStateToProps,
    Actions
)(EpicTimeline);
