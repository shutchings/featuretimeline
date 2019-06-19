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
            case EpicTimelineActionTypes.UpdateStartDate: {
                const { epicId, startDate } = action.payload;

                const epicToUpdate = draft.epics.find(
                    epic => epic.id === epicId
                );

                epicToUpdate.startDate = startDate.toDate();

                break;
            }
            case EpicTimelineActionTypes.UpdateEndDate: {
                const { epicId, endDate } = action.payload;

                const epicToUpdate = draft.epics.find(
                    epic => epic.id === epicId
                );

                epicToUpdate.endDate = endDate.toDate();

                break;
            }
            case EpicTimelineActionTypes.ShiftEpic: {
                const { epicId, startDate } = action.payload;

                const epicToUpdate = draft.epics.find(
                    epic => epic.id === epicId
                );

                const epicDuration =
                    epicToUpdate.endDate.getTime() -
                    epicToUpdate.startDate.getTime();

                epicToUpdate.startDate = startDate.toDate();
                epicToUpdate.endDate = startDate
                    .add(epicDuration, "milliseconds")
                    .toDate();

                break;
            }
            case EpicTimelineActionTypes.ToggleSetDatesDialogHidden: {
                const { hidden } = action.payload;

                draft.setDatesDialogHidden = hidden;

                break;
            }
            case EpicTimelineActionTypes.SetSelectedEpicId: {
                const { id } = action.payload;

                draft.selectedEpicId = id;

                break;
            }
        }
    });
}

export function getDefaultState(): IEpicTimelineState {
    return {
        projects: Projects,
        epics: Epics,
        setDatesDialogHidden: false,
        selectedEpicId: null
    };
}
