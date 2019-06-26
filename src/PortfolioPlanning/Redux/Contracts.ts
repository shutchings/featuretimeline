import { IProject, IEpic, ProgressTrackingCriteria, ITeam } from "../Contracts";
import { PortfolioPlanningMetadata } from "../Models/PortfolioPlanningQueryModels";

export interface IPortfolioPlanningState {
    planDirectoryState: IPlanDirectoryState;
    epicTimelineState: IEpicTimelineState;
}

export interface IEpicTimelineState {
    projects: IProject[];
    teams: { [ teamId: string ] : ITeam };
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
    plans: PortfolioPlanningMetadata[];
}
