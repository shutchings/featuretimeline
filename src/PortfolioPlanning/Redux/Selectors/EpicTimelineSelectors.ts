import { IEpicTimelineState, IPortfolioPlanningState } from "../Contracts";
import { IProject, IEpic } from "../../Contracts";

export function getProjects(state: IEpicTimelineState): IProject[] {
    return state.projects;
}

export function getEpics(state: IEpicTimelineState): IEpic[] {
    return state.epics;
}

// TODO: Is there a way for the substate to be passed to these selectors?
export function getEpicById(state: IPortfolioPlanningState, id: number): IEpic {
    return state.epicTimelineState.epics.find(epic => epic.id === id);
}

export function getSetDatesDialogHidden(state: IEpicTimelineState): boolean {
    return state.setDatesDialogHidden;
}
