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
    getMessage,
    getEpics,
    getProjects
} from "../Redux/Selectors/EpicTimelineSelectors";
import { EpicTimelineActions } from "../Redux/Actions/EpicTimelineActions";
import { connect } from "react-redux";
// import "react-calendar-timeline/lib/Timeline.css"; // TODO: Use this instead of copying timeline

const day = 60 * 60 * 24 * 1000;
const month = day * 30;

interface IEpicTimelineOwnProps {}

interface IEpicTimelineMappedProps {
    projects: IProject[];
    epics: IEpic[];
    message: string;
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
                    stackItems={true}
                    dragSnap={day}
                    minZoom={month}
                    onItemMove={this._onItemMove}
                />
                <div>{this.props.message}</div>
                <button onClick={this._onButtonClick} />
            </div>
        );
    }

    private _onItemMove = (itemId: number, dragTime: number): void => {
        this.props.onUpdateStartDate(itemId, moment(dragTime));
    };

    private _onButtonClick = (): void => {
        this.props.onUpdateMessage(this.props.message + ".");
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
        epics: getEpics(state.epicTimelineState),
        message: getMessage(state.epicTimelineState)
    };
}

const Actions = {
    onUpdateMessage: EpicTimelineActions.updateMessage,
    onUpdateStartDate: EpicTimelineActions.updateStartDate
};

export const ConnectedEpicTimeline = connect(
    mapStateToProps,
    Actions
)(EpicTimeline);
