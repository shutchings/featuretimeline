import { put, call } from "redux-saga/effects";
import { 
    PortfolioPlanningDataService 
} from "../../../Services/PortfolioPlanningDataService";
import { 
    PortfolioPlanningQueryInput, 
    PortfolioPlanning,
    PortfolioPlanningFullContentQueryResult,
    MergeType,
} from "../../Models/PortfolioPlanningQueryModels";
import { EpicTimelineActions } from "../Actions/EpicTimelineActions";

export function* LoadPortfolio(planId: string) {
    //  TODO    User Story 1559920: Load epics and project information from extension storage
    //  These values are only for testing wiring of OData service to UI.
    //const workItemId = 5250;
    //const projectId = "FBED1309-56DB-44DB-9006-24AD73EEE785";

    const portfolioService = PortfolioPlanningDataService.getInstance();
    const planInfo: PortfolioPlanning = yield call(
        [portfolioService, portfolioService.GetPortfolioPlanById],
        planId
    );

    // No data for this plan, just return empty info
    if (!planInfo.projects || Object.keys(planInfo.projects).length === 0) {
        yield put(EpicTimelineActions.portfolioItemsReceived({
            items: { 
                exceptionMessage: null,
                items: [] 
            },
            projects: { 
                exceptionMessage: null,
                projects: [] 
            },
            teamAreas: {
                exceptionMessage: null,
                teamsInArea: {}
            },
            mergeStrategy: MergeType.Replace
        }));
        return;
    }

    const portfolioQueryInput: PortfolioPlanningQueryInput = {
        //  TODO    Only supporting one work item type per plan for now. Work item type should be per project.
        PortfolioWorkItemType: planInfo.projects[0].PortfolioWorkItemType,

        //  TODO    Only supporting one work item type per plan for now. Work item type should be per project.
        RequirementWorkItemTypes: [
            planInfo.projects[0].RequirementWorkItemType
        ],

        WorkItems: Object.keys(planInfo.projects).map((projectKey) => 
        {
            const projectInfo = planInfo.projects[projectKey];

            return {
                projectId: projectInfo.ProjectId,
                workItemIds: projectInfo.WorkItemIds
            };
        })
    };

    const queryResult: PortfolioPlanningFullContentQueryResult = yield call(
        [portfolioService, portfolioService.loadPortfolioContent], 
        portfolioQueryInput);

    //  Replace all values when merging. We are loading the full state of the portfolio here.
    queryResult.mergeStrategy = MergeType.Replace;

    yield put(EpicTimelineActions.portfolioItemsReceived(queryResult));
}
