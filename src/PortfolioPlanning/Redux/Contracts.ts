import { IProject, IEpic, ProgressTrackingCriteria } from "../Contracts";

export interface IPortfolioPlanningState {
    planDirectoryState: IPlanDirectoryState;
    epicTimelineState: IEpicTimelineState;
}

export interface IEpicTimelineState {
    projects: IProject[];
    epics: IEpic[];
    otherEpics: IEpic[];
    message: string;
    addEpicDialogOpen: boolean;
    setDatesDialogHidden: boolean;
    selectedItemId: number;
    progressTrackingCriteria: ProgressTrackingCriteria;
}

export interface IPlanDirectoryState {
    newPlanDialogVisible: boolean;
    plans: string[];
}
