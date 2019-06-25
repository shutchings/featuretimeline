import { takeEvery, put } from "redux-saga/effects";
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
import { PortfolioPlanningQueryInput, PortfolioPlanningFullContentQueryResult, MergeType, PortfolioPlanning } from "../../Models/PortfolioPlanningQueryModels";
import { PortfolioPlanningDataService } from "../../../Services/PortfolioPlanningDataService";

export function* epicTimelineSaga(): SagaIterator {
    yield takeEvery(EpicTimelineActionTypes.UpdateStartDate, onUpdateStartDate);
    yield takeEvery(EpicTimelineActionTypes.UpdateEndDate, onUpdateEndDate);
    yield takeEvery(EpicTimelineActionTypes.ShiftEpic, onShiftEpic);
    yield takeEvery(EpicTimelineActionTypes.AddEpics, onAddEpics);
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

function* onAddEpics(
    action: ActionsOfType<
        EpicTimelineActions,
        EpicTimelineActionTypes.AddEpics
    >
): SagaIterator {
    const {
        planId,
        projectId,
        epicsToAdd,
        workItemType,
        requirementWorkItemType
    } = action.payload.epicsToAdd;

    //  TODO    sanitize input epics ids (unique ids only)

    //  Updating plan data first.
    const portfolioService = PortfolioPlanningDataService.getInstance();
    const projectIdLowerCase = projectId.toLowerCase();

    const storedPlan: PortfolioPlanning= yield effects.call(
        [portfolioService, portfolioService.GetPortfolioPlanById],
        planId);

    if(!storedPlan.projects[projectIdLowerCase])
    {
        storedPlan.projects[projectIdLowerCase] = {
            ProjectId: projectIdLowerCase,
            PortfolioWorkItemType: workItemType,
            RequirementWorkItemType: requirementWorkItemType,
            WorkItemIds: epicsToAdd
        };
    }
    else
    {
        storedPlan.projects[projectIdLowerCase].WorkItemIds.push(...epicsToAdd);
    }

    //  Save plan with new epics added.
    yield effects.call(
        [portfolioService, portfolioService.UpdatePortfolioPlan],
        storedPlan
    );

    const portfolioQueryInput: PortfolioPlanningQueryInput = {
        PortfolioWorkItemType: workItemType,
        RequirementWorkItemTypes: [requirementWorkItemType],

        WorkItems: [{
            projectId: projectId,
            workItemIds: epicsToAdd
        }]
    };

    const queryResult : PortfolioPlanningFullContentQueryResult = yield effects.call(
        [portfolioService, portfolioService.loadPortfolioContent],
        portfolioQueryInput
    );

    //  Add new epics selected by customer to existing ones in the plan.
    queryResult.mergeStrategy = MergeType.Add;

    yield put(EpicTimelineActions.portfolioItemsReceived(queryResult));
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
