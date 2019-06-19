import { IEpicTimelineState } from "../Contracts";
import { Projects, Epics } from "../SampleData";
import {
    EpicTimelineActions,
    EpicTimelineActionTypes
} from "../Actions/EpicTimelineActions";
import produce from "immer";

export function epicTimelineReducer(
    state: IEpicTimelineState,
    action: EpicTimelineActions
): IEpicTimelineState {
    return produce(state || getDefaultState(), (draft: IEpicTimelineState) => {
        switch (action.type) {
            case EpicTimelineActionTypes.UpdateMessage: {
                draft.message = action.payload.message;

                break;
            }
            case EpicTimelineActionTypes.UpdateStartDate: {
                const { epicId, startDate } = action.payload;

                draft.epics.find(
                    epic => epic.id === epicId
                ).startDate = startDate.toDate();

                break;
            }
        }
    });
}

export function getDefaultState(): IEpicTimelineState {
    return {
        projects: Projects,
        epics: Epics,
        message: "Initial message"
    };
}
