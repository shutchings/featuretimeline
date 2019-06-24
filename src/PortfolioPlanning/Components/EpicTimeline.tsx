import * as React from "react";
import * as moment from "moment";
import {
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
    getAddEpicDialogOpen,
    getOtherEpics,
    getSetDatesDialogHidden,
    getTimelineGroups,
    getTimelineItems,
    getProgressTrackingCriteria
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
    groups: ITimelineGroup[];
    items: ITimelineItem[];
    otherEpics: IEpic[];
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
                    groups={this.props.groups}
                    items={this.props.items}
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
                        this.props.onSetSelectedItemId(itemId)
                    }
                    onItemClick={() => {
                        this.props.onToggleSetDatesDialogHidden(false);
                    }}
                    itemRenderer={({
                        item,
                        itemContext,
                        getItemProps,
                        getResizeProps
                    }) => {
                        return (
                            <div {...getItemProps(item.itemProps)}>
                                <div
                                    style={{
                                        maxHeight: `${
                                            itemContext.dimensions.height
                                        }`
                                    }}
                                >
                                    {`${itemContext.title}    ${
                                        item.itemProps.completed
                                    }/${item.itemProps.total} (${item.itemProps
                                        .progress / 1.0}%)`}
                                </div>
                            </div>
                        );
                    }}
                />
                {this._renderAddEpicDialog()}
                {this.props.selectedItemId && (
                    <SetDatesDialog
                        key={
                            this.props.selectedItemId +
                            selectedItem.start_time.millisecond() +
                            selectedItem.end_time.millisecond()
                        }
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
                    onAddProject={this.props.onAddProject}
                />
            );
        }
    }
}

function mapStateToProps(
    state: IPortfolioPlanningState
): IEpicTimelineMappedProps {
    return {
        groups: getTimelineGroups(state.epicTimelineState),
        items: getTimelineItems(state.epicTimelineState),
        otherEpics: getOtherEpics(state.epicTimelineState),
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
    onAddProject: EpicTimelineActions.addProject,
    onUpdateStartDate: EpicTimelineActions.updateStartDate,
    onUpdateEndDate: EpicTimelineActions.updateEndDate,
    onShiftEpic: EpicTimelineActions.shiftEpic,
    onToggleSetDatesDialogHidden:
        EpicTimelineActions.toggleSetDatesDialogHidden,
    onSetSelectedItemId: EpicTimelineActions.setSelectedItemId,
    onToggleProgressTrackingCriteria:
        EpicTimelineActions.ToggleProgressTrackingCriteria
};

export const ConnectedEpicTimeline = connect(
    mapStateToProps,
    Actions
)(EpicTimeline);
