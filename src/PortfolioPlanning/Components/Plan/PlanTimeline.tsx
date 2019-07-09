import * as React from "react";
import * as moment from "moment";
import { ITimelineGroup, ITimelineItem, ITeam } from "../../Contracts";
import Timeline from "react-calendar-timeline";
import "./PlanTimeline.scss";
import { IPortfolioPlanningState } from "../../Redux/Contracts";
import { getTimelineGroups, getTimelineItems } from "../../Redux/Selectors/EpicTimelineSelectors";
import { EpicTimelineActions } from "../../Redux/Actions/EpicTimelineActions";
import { connect } from "react-redux";
import { ProgressDetails } from "../../Common/Components/ProgressDetails";
import { InfoIcon } from "../../Common/Components/InfoIcon";
import { getSelectedPlanOwner } from "../../Redux/Selectors/PlanDirectorySelectors";
import { IdentityRef } from "VSS/WebApi/Contracts";

const day = 60 * 60 * 24 * 1000;
const week = day * 7;

interface IPlanTimelineMappedProps {
    planId: string;
    groups: ITimelineGroup[];
    teams: { [teamId: string]: ITeam };
    items: ITimelineItem[];
    selectedItemId: number;
    planOwner: IdentityRef;
    visibleTimeStart: number;
    visibleTimeEnd: number;
    exceptionMessage: string;
}

export type IPlanTimelineProps = IPlanTimelineMappedProps & typeof Actions;

export class PlanTimeline extends React.Component<IPlanTimelineProps> {
    constructor() {
        super();
    }

    public render(): JSX.Element {
        const [defaultTimeStart, defaultTimeEnd] = this._getDefaultTimes(this.props.items);

        return (
            <div className="plan-timeline-container">
                <Timeline
                    groups={this.props.groups}
                    items={this.props.items}
                    visibleTimeStart={this.props.visibleTimeStart || defaultTimeStart}
                    visibleTimeEnd={this.props.visibleTimeEnd || defaultTimeEnd}
                    onTimeChange={this._handleTimeChange}
                    canChangeGroup={false}
                    stackItems={true}
                    dragSnap={day}
                    minZoom={week}
                    canResize={"both"}
                    minResizeWidth={50}
                    onItemResize={this._onItemResize}
                    onItemMove={this._onItemMove}
                    moveResizeValidator={this._validateResize}
                    selected={[this.props.selectedItemId]}
                    lineHeight={50}
                    onItemSelect={itemId => this.props.onSetSelectedItemId(itemId)}
                    onCanvasClick={() => this.props.onSetSelectedItemId(undefined)}
                    itemRenderer={({ item, itemContext, getItemProps }) =>
                        this._renderItem(item, itemContext, getItemProps)
                    }
                    groupRenderer={group => this._renderGroup(group.group)}
                />
            </div>
        );
    }

    private _renderGroup(group: ITimelineGroup) {
        return <div className="plan-timeline-group">{group.title}</div>;
    }

    private _renderItem = (item, itemContext, getItemProps) => {
        let borderStyle = {};
        if (itemContext.selected) {
            borderStyle = {
                borderWidth: "2px",
                borderStyle: "solid",
                borderColor: "#106ebe"
            };
        } else {
            borderStyle = {
                border: "none"
            };
        }
        return (
            <div
                {...getItemProps({
                    className: "plan-timeline-item",
                    style: {
                        background: "white",
                        color: "black",
                        ...borderStyle,
                        borderRadius: "4px"
                    }
                })}
            >
                <div className="details">
                    <div className="title">{itemContext.title}</div>
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "flex-end"
                        }}
                    >
                        <ProgressDetails
                            completed={item.itemProps.completed}
                            total={item.itemProps.total}
                            onClick={() => {}}
                        />
                        <InfoIcon
                            className="show-on-hover"
                            id={item.id}
                            onClick={() => this.props.onToggleSetDatesDialogHidden(false)}
                        />
                        <div
                            className="bowtie-icon bowtie-navigate-forward-circle show-on-hover to-epic-roadmap"
                            onClick={() => this.navigateToEpicRoadmap(item)}
                        >
                            &nbsp;
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    // Update the visibleTimeStart and visibleTimeEnd when user scroll or zoom the timeline.
    private _handleTimeChange = (visibleTimeStart, visibleTimeEnd, updateScrollCanvas): void => {
        this.props.onUpdateVisibleTimeStart(visibleTimeStart);
        this.props.onUpdateVisibleTimeEnd(visibleTimeEnd);
    };

    private _validateResize(action: string, item: ITimelineItem, time: number, resizeEdge: string) {
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

    private _onItemResize = (itemId: number, time: number, edge: string): void => {
        if (edge == "left") {
            this.props.onUpdateStartDate(itemId, moment(time));
        } else {
            // "right"
            this.props.onUpdateEndDate(itemId, moment(time));
        }
    };

    private _onItemMove = (itemId: number, time: number): void => {
        this.props.onShiftItem(itemId, moment(time));
    };

    // TODO: We only need this on first render
    private _getDefaultTimes(items: ITimelineItem[]): [moment.Moment, moment.Moment] {
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

    private navigateToEpicRoadmap(item: ITimelineItem) {
        const collectionUri = VSS.getWebContext().collection.uri;
        const projectName = item.group;
        const teamId = item.teamId;
        //  TODO    Need to get the backlog level somewhere....
        const backlogLevel = "Epics";
        const workItemId = item.id;

        const targerUrl = `${collectionUri}${projectName}/_backlogs/ms-devlabs.workitem-feature-timeline-extension-dev.workitem-epic-roadmap/${teamId}/${backlogLevel}#${workItemId}`;

        VSS.getService<IHostNavigationService>(VSS.ServiceIds.Navigation).then(
            client => client.navigate(targerUrl),
            error => alert(error)
        );
    }
}

function mapStateToProps(state: IPortfolioPlanningState): IPlanTimelineMappedProps {
    return {
        planId: state.planDirectoryState.selectedPlanId,
        groups: getTimelineGroups(state.epicTimelineState),
        teams: state.epicTimelineState.teams,
        items: getTimelineItems(state.epicTimelineState),
        selectedItemId: state.epicTimelineState.selectedItemId,
        planOwner: getSelectedPlanOwner(state),
        visibleTimeStart: state.epicTimelineState.visibleTimeStart,
        visibleTimeEnd: state.epicTimelineState.visibleTimeEnd,
        exceptionMessage: state.epicTimelineState.exceptionMessage
    };
}

const Actions = {
    onUpdateStartDate: EpicTimelineActions.updateStartDate,
    onUpdateEndDate: EpicTimelineActions.updateEndDate,
    onShiftItem: EpicTimelineActions.shiftItem,
    onToggleSetDatesDialogHidden: EpicTimelineActions.toggleItemDetailsDialogHidden,
    onSetSelectedItemId: EpicTimelineActions.setSelectedItemId,
    onUpdateVisibleTimeStart: EpicTimelineActions.updateVisibleTimeStart,
    onUpdateVisibleTimeEnd: EpicTimelineActions.updateVisibleTimeEnd
};

export const ConnectedPlanTimeline = connect(
    mapStateToProps,
    Actions
)(PlanTimeline);
