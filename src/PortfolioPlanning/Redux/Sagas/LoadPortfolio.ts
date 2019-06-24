import { all, put, call } from "redux-saga/effects";
import { 
    PortfolioPlanningDataService 
} from "../../../Services/PortfolioPlanningDataService";
import { 
    PortfolioPlanningQueryInput, 
    PortfolioPlanningProjectQueryInput, 
    PortfolioPlanningDirectory,
    PortfolioPlanning
} from "../../Models/PortfolioPlanningQueryModels";
import { 
    EpicTimelineActions 
} from "../Actions/EpicTimelineActions";

export function* LoadPortfolio() {

    //  TODO    User Story 1559920: Load epics and project information from extension storage
    //  These values are only for testing wiring of OData service to UI.
    //const workItemId = 5250;
    //const projectId = "FBED1309-56DB-44DB-9006-24AD73EEE785";

    const portfolioService = PortfolioPlanningDataService.getInstance();

    const allPlans:PortfolioPlanningDirectory = yield call([portfolioService, portfolioService.GetAllPortfolioPlans]);
    
    const planId = allPlans.entries[0].id;
    const planInfo:PortfolioPlanning = yield call([portfolioService, portfolioService.GetPortfolioPlanById], planId);

    const portfolioQueryInput: PortfolioPlanningQueryInput = {
        //  TODO    Only supporting one work item type per plan for now. Work item type should be per project.
        PortfolioWorkItemType: planInfo.projects[0].PortfolioWorkItemType,

        //  TODO    Only supporting one work item type per plan for now. Work item type should be per project.
        RequirementWorkItemTypes: [planInfo.projects[0].RequirementWorkItemType],

        WorkItems: planInfo.projects.map((projectInfo) => 
        {
            return {
                projectId: projectInfo.ProjectId,
                workItemIds: projectInfo.WorkItemIds
            };
        })
    };

    const projectsQueryInput: PortfolioPlanningProjectQueryInput = {
        projectIds: planInfo.projects.map((projectInfo) => projectInfo.ProjectId)
    };

    const [portfolioQueryResult, projectQueryResult] = yield all(
        [
            call([portfolioService, portfolioService.runPortfolioItemsQuery], portfolioQueryInput),
            call([portfolioService, portfolioService.runProjectQuery], projectsQueryInput)
        ]);

    yield put(EpicTimelineActions.portfolioItemsReceived(portfolioQueryResult, projectQueryResult));
}