import moment = require("moment");

export interface IProject {
    id: string;
    title: string;
}

export interface IEpic {
    id: number;
    project: string;
    teamId: string;
    title: string;
    startDate?: Date;
    endDate?: Date;

    completedCount: number;
    totalCount: number;

    completedStoryPoints: number;
    totalStoryPoints: number;

    storyPointsProgress: number;
    countProgress: number;
}

export interface IAddEpics
{
    planId: string;
    projectId: string;
    epicsToAdd: number[];
    workItemType: string;
    requirementWorkItemType: string;
}

export interface IRemoveEpic
{
    planId: string;
    epicToRemove: number;
}

export interface ITimelineGroup {
    id: string;
    title: string;
}

export interface ITimelineItem {
    id: number;
    group: string;
    teamId: string;
    title: string;
    start_time: moment.Moment;
    end_time: moment.Moment;
}

export enum ProgressTrackingCriteria {
    CompletedCount = "Completed Count",
    StoryPoints = "Story Points"
}
