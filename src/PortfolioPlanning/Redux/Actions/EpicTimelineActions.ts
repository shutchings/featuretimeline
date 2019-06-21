import {
    createAction,
    ActionsUnion
} from "../../../Common/redux/Helpers/ActionHelper";
import { IEpic } from "../../Contracts";
import moment = require("moment");
import { 
    PortfolioPlanningQueryResult,
    PortfolioPlanningProjectQueryResult 
} from "../../Models/PortfolioPlanningQueryModels";
import { Action } from 'redux';

export const enum EpicTimelineActionTypes {
    // TODO: May update these date change actions to be single actio
    UpdateStartDate = "EpicTimeline/UpdateStartDate",
    UpdateEndDate = "EpicTimeline/UpdateEndDate",
    ShiftEpic = "EpicTimeline/ShiftEpic",
    ToggleSetDatesDialogHidden = "EpicTimeline/ToggleSetDatesDialogHidden",
    SetSelectedEpicId = "EpicTimeline/SetSelectedEpicId",
    PortfolioItemsReceived = "EpicTimeline/PortfolioItemsReceived",
    OpenAddEpicDialog = "EpicTimeline/OpenAddEpicDialog",
    CloseAddEpicDialog = "EpicTimeline/CloseAddEpicDialog",
    AddEpics = "EpicTimeline/AddEpics"
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
    toggleSetDatesDialogHidden: (hidden: boolean) =>
        createAction(EpicTimelineActionTypes.ToggleSetDatesDialogHidden, {
            hidden
        }),
    setSelectedEpicId: (id: number) =>
        createAction(EpicTimelineActionTypes.SetSelectedEpicId, { id }),

    portfolioItemsReceived: (
        portfolioQueryResult: PortfolioPlanningQueryResult, 
        projectsQueryResult: PortfolioPlanningProjectQueryResult) =>
        createAction(
            EpicTimelineActionTypes.PortfolioItemsReceived,
            {
                portfolioQueryResult,
                projectsQueryResult
            }),

    openAddEpicDialog: () =>
        createAction(EpicTimelineActionTypes.OpenAddEpicDialog),
    closeAddEpicDialog: () =>
        createAction(EpicTimelineActionTypes.CloseAddEpicDialog),
    addEpics: (epicsToAdd: IEpic[]) =>
        createAction(EpicTimelineActionTypes.AddEpics, { epicsToAdd })

};

export type EpicTimelineActions = ActionsUnion<typeof EpicTimelineActions>;

export interface PortfolioItemsReceivedAction extends Action {
    type: EpicTimelineActionTypes.PortfolioItemsReceived;
    payload: {
        portfolioQueryResult: PortfolioPlanningQueryResult,
        projectsQueryResult: PortfolioPlanningProjectQueryResult
    }
}