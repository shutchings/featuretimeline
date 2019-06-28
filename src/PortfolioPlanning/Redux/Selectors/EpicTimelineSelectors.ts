import { IEpicTimelineState, IPortfolioPlanningState } from "../Contracts";
import {
    IProject,
    IEpic,
    ITimelineGroup,
    ITimelineItem,
    ProgressTrackingCriteria,
    IProjectConfiguration
} from "../../Contracts";
import moment = require("moment");

export function getProjects(state: IEpicTimelineState): IProject[] {
    return state.projects;
}

export function getTimelineGroups(state: IEpicTimelineState): ITimelineGroup[] {
    return state.projects.map(project => {
        return {
            id: project.id,
            title: project.title
        };
    });
}

export function getEpics(state: IEpicTimelineState): IEpic[] {
    return state.epics;
}

export function getTimelineItems(state: IEpicTimelineState): ITimelineItem[] {
    return state.epics.map(epic => {
        let completed: number;
        let total: number;
        let progress: number;

        if (state.progressTrackingCriteria === ProgressTrackingCriteria.CompletedCount) {
            completed = epic.completedCount;
            total = epic.totalCount;
            progress = epic.countProgress;
        } else {
            completed = epic.completedStoryPoints;
            total = epic.totalStoryPoints;
            progress = epic.storyPointsProgress;
        }

        return {
            id: epic.id,
            group: epic.project,
            teamId: epic.teamId,
            title: epic.title,
            start_time: moment(epic.startDate),
            end_time: moment(epic.endDate),
            itemProps: {
                completed: completed,
                total: total,
                progress: progress
            }
        };
    });
}

export function getMessage(state: IEpicTimelineState): string {
    return state.message;
}

// TODO: Is there a way for the substate to be passed to these selectors?
export function getEpicById(state: IPortfolioPlanningState, id: number): IEpic {
    const found = state.epicTimelineState.epics.filter(epic => epic.id === id);

    if (found && found.length === 1) {
        return found[0];
    }

    return null;
}

export function getProjectConfigurationById(state: IPortfolioPlanningState, projectId: string): IProjectConfiguration {
    return state.epicTimelineState.projectConfiguration[projectId.toLowerCase()];
}

export function getSetDatesDialogHidden(state: IEpicTimelineState): boolean {
    return state.setDatesDialogHidden;
}

export function getAddEpicPanelOpen(state: IEpicTimelineState): boolean {
    return state.addEpicDialogOpen;
}

export function getProgressTrackingCriteria(state: IEpicTimelineState): ProgressTrackingCriteria {
    return state.progressTrackingCriteria;
}
