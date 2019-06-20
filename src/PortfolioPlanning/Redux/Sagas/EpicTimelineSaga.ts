import { takeEvery } from "redux-saga/effects";
import { SagaIterator } from "redux-saga";
import { EpicTimelineActionTypes } from "../Actions/EpicTimelineActions";

export function* epicTimelineSaga(): SagaIterator {
    yield takeEvery(EpicTimelineActionTypes.UpdateStartDate, saveDatesToServer);
    yield takeEvery(EpicTimelineActionTypes.UpdateEndDate, saveDatesToServer);
    yield takeEvery(EpicTimelineActionTypes.ShiftEpic, saveDatesToServer);
}

function* saveDatesToServer(): SagaIterator {
    alert("Saving dates to server");
}
