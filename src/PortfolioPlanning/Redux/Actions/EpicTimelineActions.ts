import { createAction, ActionsUnion } from "../Helpers";
import { ProgressTrackingCriteria, IAddEpics, IRemoveEpic, LoadingStatus } from "../../Contracts";
import moment = require("moment");
import { PortfolioPlanningFullContentQueryResult } from "../../Models/PortfolioPlanningQueryModels";
import { Action } from "redux";

export const enum EpicTimelineActionTypes {
    // TODO: May update these date change actions to be single actio
    UpdateStartDate = "EpicTimeline/UpdateStartDate",
    UpdateEndDate = "EpicTimeline/UpdateEndDate",
    ShiftEpic = "EpicTimeline/ShiftEpic",
    ToggleItemDetailsDialogHidden = "EpicTimeline/ToggleItemDetailsDialogHidden",
    SetSelectedItemId = "EpicTimeline/SetSelectedItemId",
    PortfolioItemsReceived = "EpicTimeline/PortfolioItemsReceived",
    PortfolioItemDeleted = "EpicTimeline/PortfolioItemDeleted",
    OpenAddEpicPanel = "EpicTimeline/OpenAddEpicPanel",
    CloseAddEpicPanel = "EpicTimeline/CloseAddEpicPanel",
    AddEpics = "EpicTimeline/AddEpics",
    RemoveEpic = "EpicTimeline/RemoveEpic",
    ToggleProgressTrackingCriteria = "EpicTimeline/ToggleProgressTrackingCriteria",
    ToggleLoadingStatus = "EpicTimeline/ToggleLoadingStatus",
    ResetPlanState = "EpicTimeline/ResetPlanState"
}

export const EpicTimelineActions = {
    updateStartDate: (epicId: number, startDate: moment.Moment) =>
        createAction(EpicTimelineActionTypes.UpdateStartDate, {
            epicId,
            startDate
        }),
    updateEndDate: (epicId: number, endDate: moment.Moment) =>
        createAction(EpicTimelineActionTypes.UpdateEndDate, {
            epicId,
            endDate
        }),
    shiftEpic: (epicId: number, startDate: moment.Moment) =>
        createAction(EpicTimelineActionTypes.ShiftEpic, { epicId, startDate }),
    toggleItemDetailsDialogHidden: (hidden: boolean) =>
        createAction(EpicTimelineActionTypes.ToggleItemDetailsDialogHidden, {
            hidden
        }),
    setSelectedItemId: (id: number) => createAction(EpicTimelineActionTypes.SetSelectedItemId, { id }),
    portfolioItemsReceived: (result: PortfolioPlanningFullContentQueryResult) =>
        createAction(EpicTimelineActionTypes.PortfolioItemsReceived, result),
    portfolioItemDeleted: (itemDeleted: IRemoveEpic) =>
        createAction(EpicTimelineActionTypes.PortfolioItemDeleted, itemDeleted),
    openAddEpicPanel: () => createAction(EpicTimelineActionTypes.OpenAddEpicPanel),
    closeAddEpicPanel: () => createAction(EpicTimelineActionTypes.CloseAddEpicPanel),
    addEpics: (epicsToAdd: IAddEpics) => createAction(EpicTimelineActionTypes.AddEpics, epicsToAdd),
    removeEpic: (epicToRemove: IRemoveEpic) => createAction(EpicTimelineActionTypes.RemoveEpic, epicToRemove),
    toggleProgressTrackingCriteria: (criteria: ProgressTrackingCriteria) =>
        createAction(EpicTimelineActionTypes.ToggleProgressTrackingCriteria, {
            criteria
        }),
    toggleLoadingStatus: (status: LoadingStatus) =>
        createAction(EpicTimelineActionTypes.ToggleLoadingStatus, { status }),
    resetPlanState: () => createAction(EpicTimelineActionTypes.ResetPlanState)
};

export type EpicTimelineActions = ActionsUnion<typeof EpicTimelineActions>;

export interface PortfolioItemsReceivedAction extends Action {
    type: EpicTimelineActionTypes.PortfolioItemsReceived;
    payload: PortfolioPlanningFullContentQueryResult;
}

export interface PortfolioItemDeletedAction extends Action {
    type: EpicTimelineActionTypes.PortfolioItemDeleted;
    payload: IRemoveEpic;
}
