import { takeEvery } from "redux-saga/effects";
import { SagaIterator, effects } from "redux-saga";
import {
    EpicTimelineActionTypes,
    EpicTimelineActions
} from "../Actions/EpicTimelineActions";
import { Action } from "redux";
import { getEpicById } from "../Selectors/EpicTimelineSelectors";
import { IEpic } from "../../Contracts";

export function* epicTimelineSaga(): SagaIterator {
    // yield takeEvery(EpicTimelineActionTypes.UpdateStartDate, saveDatesToServer);
    // yield takeEvery(EpicTimelineActionTypes.UpdateEndDate, saveDatesToServer);
    yield takeEvery(EpicTimelineActionTypes.ShiftEpic, saveDatesToServer);
}

function* saveDatesToServer(
    action: ActionsOfType<
        EpicTimelineActions,
        EpicTimelineActionTypes.ShiftEpic
    >
): SagaIterator {
    const epicId = action.payload.epicId;
    const epic: IEpic = yield effects.select(getEpicById, epicId);

    alert(`Epic id: ${epicId}`);
    alert(`Start date: ${epic.startDate}`);
    alert(`End date: ${epic.endDate}`);
}

// Helpers
type ActionsCreatorsMapObject = {
    [actionCreator: string]: (...args: any[]) => any;
};
export type ActionsUnion<A extends ActionsCreatorsMapObject> = ReturnType<
    A[keyof A]
>;
export type ActionsOfType<
    ActionUnion,
    ActionType extends string
> = ActionUnion extends Action<ActionType> ? ActionUnion : never;
