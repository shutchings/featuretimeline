import { takeEvery, put } from "redux-saga/effects";
import { SagaIterator, effects } from "redux-saga";
import { EpicTimelineActionTypes, EpicTimelineActions } from "../Actions/EpicTimelineActions";
import { getEpicById, getProjectConfigurationById } from "../Selectors/EpicTimelineSelectors";
import { IEpic, IProjectConfiguration } from "../../Contracts";
import * as VSS_Service from "VSS/Service";
import { WorkItemTrackingHttpClient } from "TFS/WorkItemTracking/RestClient";
import { JsonPatchDocument } from "VSS/WebApi/Contracts";
import {
    PortfolioPlanningQueryInput,
    PortfolioPlanningFullContentQueryResult,
    MergeType,
    PortfolioPlanning
} from "../../Models/PortfolioPlanningQueryModels";
import { PortfolioPlanningDataService } from "../../../Services/PortfolioPlanningDataService";
import { PlanDirectoryActionTypes, PlanDirectoryActions } from "../Actions/PlanDirectoryActions";
import { LoadPortfolio } from "./LoadPortfolio";
import { ActionsOfType } from "../Helpers";

export function* epicTimelineSaga(): SagaIterator {
    yield takeEvery(EpicTimelineActionTypes.UpdateStartDate, onUpdateStartDate);
    yield takeEvery(EpicTimelineActionTypes.UpdateEndDate, onUpdateEndDate);
    yield takeEvery(EpicTimelineActionTypes.ShiftEpic, onShiftEpic);
    yield takeEvery(EpicTimelineActionTypes.AddEpics, onAddEpics);
    yield takeEvery(PlanDirectoryActionTypes.ToggleSelectedPlanId, onToggleSelectedPlanId);
    yield takeEvery(EpicTimelineActionTypes.RemoveEpic, onRemoveEpic);
}

function* onUpdateStartDate(
    action: ActionsOfType<EpicTimelineActions, EpicTimelineActionTypes.UpdateStartDate>
): SagaIterator {
    const epicId = action.payload.epicId;
    yield effects.call(saveDatesToServer, epicId);
}

function* onUpdateEndDate(
    action: ActionsOfType<EpicTimelineActions, EpicTimelineActionTypes.UpdateEndDate>
): SagaIterator {
    const epicId = action.payload.epicId;
    yield effects.call(saveDatesToServer, epicId);
}

function* onShiftEpic(action: ActionsOfType<EpicTimelineActions, EpicTimelineActionTypes.ShiftEpic>): SagaIterator {
    const epicId = action.payload.epicId;
    yield effects.call(saveDatesToServer, epicId);
}

/*
This method is called from two places:
1. setting dates for a selected epic from UI
2. set default dates for newly added epic.
In second case, epic is not saved into state yet.
*/
function* saveDatesToServer(epicId: number, defaultStartDate?: Date, defaultEndDate?: Date): SagaIterator {
    const epic: IEpic = yield effects.select(getEpicById, epicId);
    let startDate: Date = defaultStartDate;
    let endDate: Date = defaultEndDate;

    if (epic && epic.startDate && epic.endDate) {
        startDate = epic.startDate;
        endDate = epic.endDate;
    }

    const doc: JsonPatchDocument = [
        {
            op: "add",
            path: "/fields/Microsoft.VSTS.Scheduling.StartDate",
            value: startDate
        },
        {
            op: "add",
            path: "/fields/Microsoft.VSTS.Scheduling.TargetDate",
            value: endDate
        }
    ];

    const witHttpClient: WorkItemTrackingHttpClient = yield effects.call(
        [VSS_Service, VSS_Service.getClient],
        WorkItemTrackingHttpClient
    );

    yield effects.call([witHttpClient, witHttpClient.updateWorkItem], doc, epicId);

    // TODO: Error experience
}

function* onAddEpics(action: ActionsOfType<EpicTimelineActions, EpicTimelineActionTypes.AddEpics>): SagaIterator {
    const {
        planId,
        projectId,
        epicsToAdd,
        //  TODO    Once "Add Epic Dialog" uses redux, project configuration will be available in the state,
        //          so there won't be a need to pass these values when adding epics.
        workItemType,
        requirementWorkItemType,
        effortWorkItemFieldRefName
        //  END of TODO
    } = action.payload;

    //  TODO    sanitize input epics ids (unique ids only)

    const portfolioService = PortfolioPlanningDataService.getInstance();
    const projectIdLowerCase = projectId.toLowerCase();

    //  Check if we have project configuration information from this project already.
    let projectConfig: IProjectConfiguration = yield effects.select(getProjectConfigurationById, projectIdLowerCase);

    if (!projectConfig) {
        //  Find out OData column name for this project. We don't have the project config in the state, which means
        //  this is the first time we see this project.
        const effortODataColumnName = yield effects.call(
            [portfolioService, portfolioService.getODataColumnNameFromWorkItemFieldReferenceName],
            effortWorkItemFieldRefName
        );

        projectConfig = {
            id: projectIdLowerCase,
            defaultEpicWorkItemType: workItemType,
            defaultRequirementWorkItemType: requirementWorkItemType,
            effortWorkItemFieldRefName: effortWorkItemFieldRefName,
            effortODataColumnName: effortODataColumnName
        };
    }

    //  Updating plan data first.
    const storedPlan: PortfolioPlanning = yield effects.call(
        [portfolioService, portfolioService.GetPortfolioPlanById],
        planId
    );

    if (!storedPlan.projects[projectIdLowerCase]) {
        storedPlan.projects[projectIdLowerCase] = {
            ProjectId: projectConfig.id,
            PortfolioWorkItemType: projectConfig.defaultEpicWorkItemType,
            RequirementWorkItemType: projectConfig.defaultRequirementWorkItemType,
            EffortWorkItemFieldRefName: projectConfig.effortWorkItemFieldRefName,
            EffortODataColumnName: projectConfig.effortODataColumnName,
            WorkItemIds: epicsToAdd
        };
    } else {
        //  TODO    Check work item ids are not duplicated.
        storedPlan.projects[projectIdLowerCase].WorkItemIds.push(...epicsToAdd);
    }

    //  Save plan with new epics added.
    yield effects.call([portfolioService, portfolioService.UpdatePortfolioPlan], storedPlan);

    const portfolioQueryInput: PortfolioPlanningQueryInput = {
        WorkItems: [
            {
                projectId: projectId,
                WorkItemTypeFilter: projectConfig.defaultEpicWorkItemType,
                DescendantsWorkItemTypeFilter: projectConfig.defaultRequirementWorkItemType,
                EffortWorkItemFieldRefName: projectConfig.effortWorkItemFieldRefName,
                EffortODataColumnName: projectConfig.effortODataColumnName,
                workItemIds: epicsToAdd
            }
        ]
    };

    const queryResult: PortfolioPlanningFullContentQueryResult = yield effects.call(
        [portfolioService, portfolioService.loadPortfolioContent],
        portfolioQueryInput
    );

    let epicsWithoutDates: number[] = [];
    let now, oneMonthFromNow;

    queryResult.items.items.map(item => {
        if (item.StartDate === undefined || item.TargetDate === undefined) {
            now = new Date();
            oneMonthFromNow = new Date();
            oneMonthFromNow.setDate(now.getDate() + 30);
            epicsWithoutDates.push(item.WorkItemId);
            item.StartDate = now;
            item.TargetDate = oneMonthFromNow;
        }
    });

    for (let index = 0; index < epicsWithoutDates.length; index++) {
        yield effects.call(saveDatesToServer, epicsWithoutDates[index], now, oneMonthFromNow);
    }

    //  Add new epics selected by customer to existing ones in the plan.
    queryResult.mergeStrategy = MergeType.Add;

    yield put(EpicTimelineActions.portfolioItemsReceived(queryResult));
}

function* onRemoveEpic(action: ActionsOfType<EpicTimelineActions, EpicTimelineActionTypes.RemoveEpic>): SagaIterator {
    const { planId, epicToRemove } = action.payload;

    const epic: IEpic = yield effects.select(getEpicById, epicToRemove);

    const portfolioService = PortfolioPlanningDataService.getInstance();
    const projectIdLowerCase = epic.project.toLowerCase();

    const storedPlan: PortfolioPlanning = yield effects.call(
        [portfolioService, portfolioService.GetPortfolioPlanById],
        planId
    );

    if (storedPlan.projects[projectIdLowerCase]) {
        const updatedEpics = storedPlan.projects[projectIdLowerCase].WorkItemIds.filter(
            current => current !== epicToRemove
        );

        if (updatedEpics.length > 0) {
            storedPlan.projects[projectIdLowerCase].WorkItemIds = updatedEpics;
        } else {
            delete storedPlan.projects[projectIdLowerCase];
        }

        //  Save plan with epic removed.
        yield effects.call([portfolioService, portfolioService.UpdatePortfolioPlan], storedPlan);
    }

    yield put(EpicTimelineActions.portfolioItemDeleted(action.payload));
}

function* onToggleSelectedPlanId(
    action: ActionsOfType<PlanDirectoryActions, PlanDirectoryActionTypes.ToggleSelectedPlanId>
): SagaIterator {
    const selectedPlanId = action.payload.id;

    if (selectedPlanId) {
        //  Only load portfolio when a valid plan id was provided.
        yield effects.call(LoadPortfolio, selectedPlanId);
    }
}
