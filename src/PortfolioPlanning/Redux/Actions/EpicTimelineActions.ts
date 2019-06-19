import {
    createAction,
    ActionsUnion
} from "../../../Common/redux/Helpers/ActionHelper";
import moment = require("moment");

export const enum EpicTimelineActionTypes {
    UpdateMessage = "EpicTimeline/UpdateMessage",
    UpdateStartDate = "EpicTimeline/UpdateStartDate"
}

export const EpicTimelineActions = {
    updateMessage: (message: string) =>
        createAction(EpicTimelineActionTypes.UpdateMessage, {
            message
        }),
    updateStartDate: (epicId: number, startDate: moment.Moment) =>
        createAction(EpicTimelineActionTypes.UpdateStartDate, {
            epicId,
            startDate
        })
};

export type EpicTimelineActions = ActionsUnion<typeof EpicTimelineActions>;
