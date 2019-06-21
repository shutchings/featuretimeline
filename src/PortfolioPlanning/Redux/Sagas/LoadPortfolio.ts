import { all, put, call } from "redux-saga/effects";
import { 
    PortfolioPlanningDataService 
} from "../../../Services/PortfolioPlanningDataService";
import { 
    PortfolioPlanningQueryInput, 
    PortfolioPlanningProjectQueryInput 
} from "../../Models/PortfolioPlanningQueryModels";
import { 
    EpicTimelineActions 
} from "../Actions/EpicTimelineActions";

export function* LoadPortfolio() {

    //  TODO    User Story 1559920: Load epics and project information from extension storage
    //  These values are only for testing wiring of OData service to UI.
    const workItemId = 5250;
    const projectId = "FBED1309-56DB-44DB-9006-24AD73EEE785";

    const service = PortfolioPlanningDataService.getInstance();
    const portfolioQueryInput: PortfolioPlanningQueryInput = {
        //  TODO    Update with values from backlog configuration
        PortfolioWorkItemType: "Epic",
        //  TODO    Update with values from backlog configuration
        RequirementWorkItemTypes: ["User Story"],
        WorkItems: [
            {
                projectId: projectId,
                workItemIds: [workItemId]
            }
        ]
    };

    const projectsQueryInput: PortfolioPlanningProjectQueryInput = {
        projectIds: [projectId]
    };

    const [portfolioQueryResult, projectQueryResult] = yield all(
        [
            call([service, service.runPortfolioItemsQuery], portfolioQueryInput),
            call([service, service.runProjectQuery], projectsQueryInput)
        ]);

    yield put(EpicTimelineActions.portfolioItemsReceived(portfolioQueryResult, projectQueryResult));
}