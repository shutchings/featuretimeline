import { IProject, IEpic, ProgressTrackingCriteria, IPlan } from "../Contracts";

export interface IPortfolioPlanningState {
    planDirectoryState: IPlanDirectoryState;
    epicTimelineState: IEpicTimelineState;
}

export interface IEpicTimelineState {
    projects: IProject[];
    epics: IEpic[];
    message: string;
    addEpicDialogOpen: boolean;
    setDatesDialogHidden: boolean;
    selectedItemId: number;
    progressTrackingCriteria: ProgressTrackingCriteria;
}

export interface IPlanDirectoryState {
    selectedPlanId: string;
    newPlanDialogVisible: boolean;
    plans: IPlan[];
}
