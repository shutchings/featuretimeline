import { all, put, call } from "redux-saga/effects";
import { PortfolioPlanningDataService } from "../../../Services/PortfolioPlanningDataService";
import {
    PortfolioPlanningQueryInput,
    PortfolioPlanningProjectQueryInput,
    PortfolioPlanning,
    PortfolioPlanningQueryResult,
    PortfolioPlanningTeamsInAreaQueryInput
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
    if (!planInfo.projects || planInfo.projects.length === 0) {
        yield put(
            EpicTimelineActions.portfolioItemsReceived(
                {
                    items: [],
                    exceptionMessage: ""
                },
                {
                    projects: [],
                    exceptionMessage: ""
                },
                {
                    teamsInArea: {},
                    exceptionMessage: ""
                }
            )
        );

        return;
    }

    const portfolioQueryInput: PortfolioPlanningQueryInput = {
        //  TODO    Only supporting one work item type per plan for now. Work item type should be per project.
        PortfolioWorkItemType: planInfo.projects[0].PortfolioWorkItemType,

        //  TODO    Only supporting one work item type per plan for now. Work item type should be per project.
        RequirementWorkItemTypes: [
            planInfo.projects[0].RequirementWorkItemType
        ],

        WorkItems: planInfo.projects.map(projectInfo => {
            return {
                projectId: projectInfo.ProjectId,
                workItemIds: projectInfo.WorkItemIds
            };
        })
    };

    //  TODO    Move this logic to a separate service in PortfolioPlanningDataService, so it can also be used when
    //          loading data for a single Epic.
    const projectsQueryInput: PortfolioPlanningProjectQueryInput = {
        projectIds: planInfo.projects.map(projectInfo => projectInfo.ProjectId)
    };

    const [portfolioQueryResult, projectQueryResult] = yield all([
        call(
            [portfolioService, portfolioService.runPortfolioItemsQuery],
            portfolioQueryInput
        ),
        call(
            [portfolioService, portfolioService.runProjectQuery],
            projectsQueryInput
        )
    ]);

    const teamsInAreaQueryInput: PortfolioPlanningTeamsInAreaQueryInput = {};
    for (let entry of (portfolioQueryResult as PortfolioPlanningQueryResult)
        .items) {
        const projectIdKey = entry.ProjectId.toLowerCase();
        const areaIdKey = entry.AreaId.toLowerCase();

        if (!teamsInAreaQueryInput[projectIdKey]) {
            teamsInAreaQueryInput[projectIdKey] = [];
        }

        if (teamsInAreaQueryInput[projectIdKey].indexOf(areaIdKey) === -1) {
            teamsInAreaQueryInput[projectIdKey].push(areaIdKey);
        }
    }

    const teamAreasQueryResult = yield call(
        [portfolioService, portfolioService.runTeamsInAreasQuery],
        teamsInAreaQueryInput
    );

    yield put(
        EpicTimelineActions.portfolioItemsReceived(
            portfolioQueryResult,
            projectQueryResult,
            teamAreasQueryResult
        )
    );
}
