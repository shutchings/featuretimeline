import { takeEvery, put } from "redux-saga/effects";
import { SagaIterator, effects } from "redux-saga";
import {
    EpicTimelineActionTypes,
    EpicTimelineActions
} from "../Actions/EpicTimelineActions";
import { getEpicById } from "../Selectors/EpicTimelineSelectors";
import { IEpic } from "../../Contracts";
import * as VSS_Service from "VSS/Service";
import { WorkItemTrackingHttpClient } from "TFS/WorkItemTracking/RestClient";
import { JsonPatchDocument } from "VSS/WebApi/Contracts";
import { PortfolioPlanningQueryInput, PortfolioPlanningFullContentQueryResult, MergeType, PortfolioPlanning } from "../../Models/PortfolioPlanningQueryModels";
import { PortfolioPlanningDataService } from "../../../Services/PortfolioPlanningDataService";
import {
    PlanDirectoryActionTypes,
    PlanDirectoryActions
} from "../Actions/PlanDirectoryActions";
import { LoadPortfolio } from "./LoadPortfolio";
import { ActionsOfType } from "../Helpers";

export function* epicTimelineSaga(): SagaIterator {
    yield takeEvery(EpicTimelineActionTypes.UpdateStartDate, onUpdateStartDate);
    yield takeEvery(EpicTimelineActionTypes.UpdateEndDate, onUpdateEndDate);
    yield takeEvery(EpicTimelineActionTypes.ShiftEpic, onShiftEpic);
    yield takeEvery(EpicTimelineActionTypes.AddEpics, onAddEpics);
    yield takeEvery(
        PlanDirectoryActionTypes.ToggleSelectedPlanId,
        onToggleSelectedPlanId
    );
    yield takeEvery(EpicTimelineActionTypes.RemoveEpic, onRemoveEpic);
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
    } = action.payload;

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

function* onRemoveEpic(
    action: ActionsOfType<
        EpicTimelineActions,
        EpicTimelineActionTypes.RemoveEpic
    >
): SagaIterator {

    const {
        planId,
        epicToRemove
    } = action.payload;

    const epic: IEpic = yield effects.select(getEpicById, epicToRemove);

    const portfolioService = PortfolioPlanningDataService.getInstance();
    const projectIdLowerCase = epic.project.toLowerCase();

    const storedPlan: PortfolioPlanning= yield effects.call(
        [portfolioService, portfolioService.GetPortfolioPlanById],
        planId);

    if(storedPlan.projects[projectIdLowerCase])
    {
        const updatedEpics = storedPlan.projects[projectIdLowerCase].WorkItemIds.filter(current => current !== epicToRemove);

        if(updatedEpics.length > 0)
        {
            storedPlan.projects[projectIdLowerCase].WorkItemIds = updatedEpics;
        }
        else
        {
            delete storedPlan.projects[projectIdLowerCase];
        }

        //  Save plan with epic removed.
        yield effects.call(
            [portfolioService, portfolioService.UpdatePortfolioPlan],
            storedPlan
        );
    }

    yield put(EpicTimelineActions.portfolioItemDeleted(action.payload));
}

function* onToggleSelectedPlanId(
    action: ActionsOfType<
        PlanDirectoryActions,
        PlanDirectoryActionTypes.ToggleSelectedPlanId
    >
): SagaIterator {
    const selectedPlanId = action.payload.id;

    if(selectedPlanId)
    {
        //  Only load portfolio when a valid plan id was provided.
        yield effects.call(LoadPortfolio, selectedPlanId);
    }
}