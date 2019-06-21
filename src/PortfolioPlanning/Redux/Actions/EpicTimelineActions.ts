import {
    createAction,
    ActionsUnion
} from "../../../Common/redux/Helpers/ActionHelper";
import { IEpic } from "../../Contracts";
import moment = require("moment");

export const enum EpicTimelineActionTypes {
    // TODO: May update these date change actions to be single actio
    UpdateStartDate = "EpicTimeline/UpdateStartDate",
    UpdateEndDate = "EpicTimeline/UpdateEndDate",
    ShiftEpic = "EpicTimeline/ShiftEpic",
    ToggleSetDatesDialogHidden = "EpicTimeline/ToggleSetDatesDialogHidden",
    SetSelectedEpicId = "EpicTimeline/SetSelectedEpicId",
    OpenAddEpicDialog = "EpicTimeline/OpenAddEpicDialog",
    CloseAddEpicDialog = "EpicTimeline/CloseAddEpicDialog",
    AddEpics = "EpicTimeline/AddEpics",
    ToggleProgressTrackingCriteria = "EpicTimeline/ToggleProgressTrackingCriteria"
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
    openAddEpicDialog: () =>
        createAction(EpicTimelineActionTypes.OpenAddEpicDialog),
    closeAddEpicDialog: () =>
        createAction(EpicTimelineActionTypes.CloseAddEpicDialog),
    addEpics: (epicsToAdd: IEpic[]) =>
        createAction(EpicTimelineActionTypes.AddEpics, { epicsToAdd }),
    ToggleProgressTrackingCriteria: (criteria: string) =>
        createAction(EpicTimelineActionTypes.ToggleProgressTrackingCriteria, {
            criteria
        })
};

export type EpicTimelineActions = ActionsUnion<typeof EpicTimelineActions>;
