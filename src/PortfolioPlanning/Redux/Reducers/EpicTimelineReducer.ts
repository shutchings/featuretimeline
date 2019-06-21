import { IEpicTimelineState } from "../Contracts";
import { Projects, Epics, OtherEpics } from "../SampleData";
import {
    EpicTimelineActions,
    EpicTimelineActionTypes
} from "../Actions/EpicTimelineActions";
import produce from "immer";
import { ProgressTrackingCriteria } from "../../Contracts";

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
            case EpicTimelineActionTypes.OpenAddEpicDialog: {
                draft.addEpicDialogOpen = true;
                break;
            }
            case EpicTimelineActionTypes.CloseAddEpicDialog: {
                draft.addEpicDialogOpen = false;
                break;
            }
            case EpicTimelineActionTypes.AddEpics: {
                draft.epics.push(...action.payload.epicsToAdd);
                break;
            }
            case EpicTimelineActionTypes.ToggleProgressTrackingCriteria: {
                draft.progressTrackingCriteria = action.payload.criteria;
                break;
            }
        }
    });
}

export function getDefaultState(): IEpicTimelineState {
    return {
        projects: Projects,
        epics: Epics,
        otherEpics: OtherEpics,
        message: "Initial message",
        addEpicDialogOpen: false,
        setDatesDialogHidden: false,
        selectedEpicId: null,
        progressTrackingCriteria: ProgressTrackingCriteria.StoryPoints
    };
}
