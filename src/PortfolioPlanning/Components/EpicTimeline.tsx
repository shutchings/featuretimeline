import * as React from "react";
import * as moment from "moment";
import { ITimelineGroup, ITimelineItem, ProgressTrackingCriteria, ITeam, LoadingStatus } from "../Contracts";
import Timeline from "react-calendar-timeline";
import "./EpicTimeline.scss";
import { IEpicTimelineState, IPortfolioPlanningState } from "../Redux/Contracts";
import {
    getAddEpicPanelOpen,
    getSetDatesDialogHidden,
    getTimelineGroups,
    getTimelineItems,
    getProgressTrackingCriteria
} from "../Redux/Selectors/EpicTimelineSelectors";
import { EpicTimelineActions } from "../Redux/Actions/EpicTimelineActions";
import { connect } from "react-redux";
import { ProgressDetails } from "../Common/Components/ProgressDetails";
import { InfoIcon } from "../Common/Components/InfoIcon";
import { Spinner, SpinnerSize } from "azure-devops-ui/Spinner";
import { getSelectedPlanOwner } from "../Redux/Selectors/PlanDirectorySelectors";
import { IdentityRef } from "VSS/WebApi/Contracts";

const day = 60 * 60 * 24 * 1000;
const week = day * 7;

interface IEpicTimelineOwnProps {}

interface IEpicTimelineMappedProps {
    planId: string;
    groups: ITimelineGroup[];
    teams: { [teamId: string]: ITeam };
    items: ITimelineItem[];
    addEpicPanelOpen: boolean;
    setDatesDialogHidden: boolean;
    selectedItemId: number;
    progressTrackingCriteria: ProgressTrackingCriteria;
    planLoadingStatus: LoadingStatus;
    planOwner: IdentityRef;
}

export type IEpicTimelineProps = IEpicTimelineOwnProps & IEpicTimelineMappedProps & typeof Actions;

export class EpicTimeline extends React.Component<IEpicTimelineProps, IEpicTimelineState> {
    constructor() {
        super();
    }

    public render(): JSX.Element {
        if (this.props.planLoadingStatus === LoadingStatus.NotLoaded) {
            return <Spinner label="Loading..." size={SpinnerSize.large} />;
        } else {
            const [defaultTimeStart, defaultTimeEnd] = this._getDefaultTimes(this.props.items);

            const forwardCircleStyle = {
                padding: "0px 0px 0px 10px"
            };

            return (
                <div className="page-content">
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
                        onItemSelect={itemId => this.props.onSetSelectedItemId(itemId)}
                        onCanvasClick={() => this.props.onSetSelectedItemId(undefined)}
                        itemRenderer={({ item, itemContext, getItemProps }) => {
                            return (
                                <div {...getItemProps(item.itemProps)}>
                                    <div
                                        style={{
                                            maxHeight: `${itemContext.dimensions.height}`,
                                            display: "flex",
                                            justifyContent: "space-between",
                                            overflow: "hidden",
                                            marginRight: "5px",
                                            alignItems: "baseline",
                                            whiteSpace: "nowrap"
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
                                                onClick={() => this.props.onToggleSetDatesDialogHidden(false)}
                                            />
                                            <ProgressDetails
                                                completed={item.itemProps.completed}
                                                total={item.itemProps.total}
                                                onClick={() => {}}
                                            />
                                            <div
                                                className="bowtie-icon bowtie-navigate-forward-circle"
                                                style={forwardCircleStyle}
                                                onClick={() => this.navigateToEpicRoadmap(item)}
                                            >
                                                &nbsp;
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        }}
                    />
                </div>
            );
        }
    }

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
        this.props.onShiftEpic(itemId, moment(time));
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

function mapStateToProps(state: IPortfolioPlanningState): IEpicTimelineMappedProps {
    return {
        planId: state.planDirectoryState.selectedPlanId,
        groups: getTimelineGroups(state.epicTimelineState),
        teams: state.epicTimelineState.teams,
        items: getTimelineItems(state.epicTimelineState),
        addEpicPanelOpen: getAddEpicPanelOpen(state.epicTimelineState),
        setDatesDialogHidden: getSetDatesDialogHidden(state.epicTimelineState),
        selectedItemId: state.epicTimelineState.selectedItemId,
        planOwner: getSelectedPlanOwner(state),
        progressTrackingCriteria: getProgressTrackingCriteria(state.epicTimelineState),
        planLoadingStatus: state.epicTimelineState.planLoadingStatus
    };
}

const Actions = {
    onUpdateStartDate: EpicTimelineActions.updateStartDate,
    onUpdateEndDate: EpicTimelineActions.updateEndDate,
    onShiftEpic: EpicTimelineActions.shiftEpic,
    onToggleSetDatesDialogHidden: EpicTimelineActions.toggleItemDetailsDialogHidden,
    onSetSelectedItemId: EpicTimelineActions.setSelectedItemId
};

export const ConnectedEpicTimeline = connect(
    mapStateToProps,
    Actions
)(EpicTimeline);
