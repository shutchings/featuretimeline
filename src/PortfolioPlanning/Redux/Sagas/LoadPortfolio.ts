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

    const allProjectKeys = Object.keys(planInfo.projects);
    const firstProject = (allProjectKeys.length > 0) ?
        planInfo.projects[allProjectKeys[0]] :
        null;

    const portfolioQueryInput: PortfolioPlanningQueryInput = {
        //  TODO    Only supporting one work item type per plan for now. Work item type should be per project.
        PortfolioWorkItemType: (firstProject) ? firstProject.PortfolioWorkItemType : "Epic",

        //  TODO    Only supporting one work item type per plan for now. Work item type should be per project.
        RequirementWorkItemTypes: [
            (firstProject) ? firstProject.RequirementWorkItemType : "User story"
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
