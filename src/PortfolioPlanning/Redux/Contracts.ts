import { IProject, IEpic, ProgressTrackingCriteria, ITeam, LoadingStatus } from "../Contracts";
import { PortfolioPlanningMetadata } from "../Models/PortfolioPlanningQueryModels";

export interface IPortfolioPlanningState {
    planDirectoryState: IPlanDirectoryState;
    epicTimelineState: IEpicTimelineState;
}

export interface IEpicTimelineState {
    planLoadingStatus: LoadingStatus;
    exceptionMessage: string;
    projects: IProject[];
    teams: { [teamId: string]: ITeam };
    epics: IEpic[];
    message: string;
    addEpicDialogOpen: boolean;
    setDatesDialogHidden: boolean;
    selectedItemId: number;
    progressTrackingCriteria: ProgressTrackingCriteria;
    visibleTimeStart: number;
    visibleTimeEnd: number;
}

export interface IPlanDirectoryState {
    directoryLoadingStatus: LoadingStatus;
    exceptionMessage: string;
    selectedPlanId: string;
    newPlanDialogVisible: boolean;
    plans: PortfolioPlanningMetadata[];
}
