import {
    createAction,
    ActionsUnion
} from "../../../Common/redux/Helpers/ActionHelper";
import moment = require("moment");

export const enum EpicTimelineActionTypes {
    UpdateStartDate = "EpicTimeline/UpdateStartDate",
    UpdateEndDate = "EpicTimeline/UpdateEndDate",
    ShiftEpic = "EpicTimeline/ShiftEpic",
    ToggleSetDatesDialogHidden = "EpicTimeline/ToggleSetDatesDialogHidden"
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
        })
};

export type EpicTimelineActions = ActionsUnion<typeof EpicTimelineActions>;
