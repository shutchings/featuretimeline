import { IEpicTimelineState, IPortfolioPlanningState } from "../Contracts";
import { IProject, IEpic } from "../../Contracts";

export function getProjects(state: IEpicTimelineState): IProject[] {
    return state.projects;
}

export function getEpics(state: IEpicTimelineState): IEpic[] {
    return state.epics;
}

export function getOtherEpics(state: IEpicTimelineState): IEpic[] {
    return state.otherEpics;
}

export function getMessage(state: IEpicTimelineState): string {
    return state.message;
}

// TODO: Is there a way for the substate to be passed to these selectors?
export function getEpicById(state: IPortfolioPlanningState, id: number): IEpic {
    return state.epicTimelineState.epics.find(epic => epic.id === id);
}

export function getSetDatesDialogHidden(state: IEpicTimelineState): boolean {
    return state.setDatesDialogHidden;
}

export function getAddEpicDialogOpen(state: IEpicTimelineState): boolean {
    return state.addEpicDialogOpen;
}