import { takeEvery } from "redux-saga/effects";
import { SagaIterator, effects } from "redux-saga";
import {
    EpicTimelineActionTypes,
    EpicTimelineActions
} from "../Actions/EpicTimelineActions";
import { Action } from "redux";
import { getEpicById } from "../Selectors/EpicTimelineSelectors";
import { IEpic } from "../../Contracts";
import * as VSS_Service from "VSS/Service";
import { WorkItemTrackingHttpClient } from "TFS/WorkItemTracking/RestClient";
import { JsonPatchDocument } from "VSS/WebApi/Contracts";
import {
    PlanDirectoryActionTypes,
    PlanDirectoryActions
} from "../Actions/PlanDirectoryActions";
import { LoadPortfolio } from "./LoadPortfolio";

export function* epicTimelineSaga(): SagaIterator {
    yield takeEvery(EpicTimelineActionTypes.UpdateStartDate, onUpdateStartDate);
    yield takeEvery(EpicTimelineActionTypes.UpdateEndDate, onUpdateEndDate);
    yield takeEvery(EpicTimelineActionTypes.ShiftEpic, onShiftEpic);
    yield takeEvery(
        PlanDirectoryActionTypes.ToggleSelectedPlanId,
        onToggleSelectedPlanId
    );
}

function* onUpdateStartDate(
    action: ActionsOfType<
        EpicTimelineActions,
        EpicTimelineActionTypes.UpdateStartDate
    >
): SagaIterator {
    const epicId = action.payload.epicId;
    yield effects.call(saveDatesToServer, epicId);
}

function* onUpdateEndDate(
    action: ActionsOfType<
        EpicTimelineActions,
        EpicTimelineActionTypes.UpdateEndDate
    >
): SagaIterator {
    const epicId = action.payload.epicId;
    yield effects.call(saveDatesToServer, epicId);
}

function* onShiftEpic(
    action: ActionsOfType<
        EpicTimelineActions,
        EpicTimelineActionTypes.ShiftEpic
    >
): SagaIterator {
    const epicId = action.payload.epicId;
    yield effects.call(saveDatesToServer, epicId);
}

function* saveDatesToServer(epicId: number): SagaIterator {
    const epic: IEpic = yield effects.select(getEpicById, epicId);

    const doc: JsonPatchDocument = [
        {
            op: "add",
            path: "/fields/Microsoft.VSTS.Scheduling.StartDate",
            value: epic.startDate
        },
        {
            op: "add",
            path: "/fields/Microsoft.VSTS.Scheduling.TargetDate",
            value: epic.endDate
        }
    ];

    const witHttpClient: WorkItemTrackingHttpClient = yield effects.call(
        [VSS_Service, VSS_Service.getClient],
        WorkItemTrackingHttpClient
    );

    yield effects.call(
        [witHttpClient, witHttpClient.updateWorkItem],
        doc,
        epicId
    );

    // TODO: Error experience
}

function* onToggleSelectedPlanId(
    action: ActionsOfType<
        PlanDirectoryActions,
        PlanDirectoryActionTypes.ToggleSelectedPlanId
    >
): SagaIterator {
    const selectedPlanId = action.payload.id;

    if (selectedPlanId) {
        yield effects.call(LoadPortfolio, selectedPlanId);
    }
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
