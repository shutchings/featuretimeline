import * as React from "react";
import * as moment from "moment";
import { IProject, IEpic, ITimelineGroup, ITimelineItem } from "../Contracts";
import Timeline from "react-calendar-timeline";
import "./EpicTimeline.scss";
import {
    IEpicTimelineState,
    IPortfolioPlanningState
} from "../Redux/Contracts";
import {
    getEpics,
    getProjects
} from "../Redux/Selectors/EpicTimelineSelectors";
import { EpicTimelineActions } from "../Redux/Actions/EpicTimelineActions";
import { connect } from "react-redux";
import { EpicDialog } from "./EpicDialog";
// import "react-calendar-timeline/lib/Timeline.css"; // TODO: Use this instead of copying timeline

const day = 60 * 60 * 24 * 1000;
const week = day * 7;

interface IEpicTimelineOwnProps {}

interface IEpicTimelineMappedProps {
    projects: IProject[];
    epics: IEpic[];
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
        const timelineGroups: ITimelineGroup[] = this.props.projects.map(
            this._mapProjectToTimelineGroups
        );
        const timelineItems: ITimelineItem[] = this.props.epics.map(
            this._mapEpicToTimelineItem
        );

        return (
            <div>
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
                />
                <EpicDialog
                    id={1}
                    startDate={moment()}
                    endDate={moment()}
                    onClose={(id, startDate, endDate) => alert(id)}
                />
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
        epics: getEpics(state.epicTimelineState)
    };
}

const Actions = {
    onUpdateStartDate: EpicTimelineActions.updateStartDate,
    onUpdateEndDate: EpicTimelineActions.updateEndDate,
    onShiftEpic: EpicTimelineActions.shiftEpic
};

export const ConnectedEpicTimeline = connect(
    mapStateToProps,
    Actions
)(EpicTimeline);
