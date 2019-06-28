import { effects, SagaIterator } from "redux-saga";
import { PortfolioPlanningDataService } from "../../Common/Services/PortfolioPlanningDataService";
import { PlanDirectoryActions, PlanDirectoryActionTypes } from "../Actions/PlanDirectoryActions";
import { ActionsOfType } from "../Helpers";
import { PortfolioPlanningDirectory, PortfolioPlanningMetadata } from "../../Models/PortfolioPlanningQueryModels";
import { EpicTimelineActionTypes, EpicTimelineActions } from "../Actions/EpicTimelineActions";
import { getSelectedPlanId } from "../Selectors/PlanDirectorySelectors";

export function* planDirectorySaga(): SagaIterator {
    yield effects.call(initializePlanDirectory);
    yield effects.takeEvery(PlanDirectoryActionTypes.DeletePlan, deletePlan);
    yield effects.takeEvery(EpicTimelineActionTypes.PortfolioItemsReceived, updateProjectsAndTeamsMetadata);
}

export function* initializePlanDirectory(): SagaIterator {
    const service = PortfolioPlanningDataService.getInstance();

    const allPlans: PortfolioPlanningDirectory = yield effects.call([service, service.GetAllPortfolioPlans]);

    yield effects.put(PlanDirectoryActions.initialize(allPlans));
}

export function* deletePlan(
    action: ActionsOfType<PlanDirectoryActions, PlanDirectoryActionTypes.DeletePlan>
): SagaIterator {
    const { id } = action.payload;

    const service = PortfolioPlanningDataService.getInstance();

    yield effects.call([service, service.DeletePortfolioPlan], id);
}

export function* updateProjectsAndTeamsMetadata(
    action: ActionsOfType<EpicTimelineActions, EpicTimelineActionTypes.PortfolioItemsReceived>
): SagaIterator {
    const { projects, teamAreas } = action.payload;

    const planId = yield effects.select(getSelectedPlanId);

    const service = PortfolioPlanningDataService.getInstance();

    const planToUpdate: PortfolioPlanningMetadata = yield effects.call(
        [service, service.GetPortfolioPlanDirectoryEntry],
        planId
    );

    // Update metadata to contain teams and projects for directory
    const addedProjects = projects.projects.map(project => project.ProjectName);
    const addedTeams = Object.keys(teamAreas.teamsInArea)
        .map(areaId => teamAreas.teamsInArea[areaId])
        .reduce((teamList, allTeamList) => allTeamList.concat(teamList), [])
        .map(team => team.teamName);

    addedProjects.forEach(projectName => {
        if (!planToUpdate.projectNames.find(existingName => existingName === projectName)) {
            planToUpdate.projectNames.push(projectName);
        }
    });
    addedTeams.forEach(teamName => {
        if (!planToUpdate.teamNames.find(existingName => existingName === teamName)) {
            planToUpdate.teamNames.push(teamName);
        }
    });

    yield effects.call([service, service.UpdatePortfolioPlanDirectoryEntry], planToUpdate);

    yield effects.put(
        PlanDirectoryActions.updateProjectsAndTeamsMetadata(planToUpdate.projectNames, planToUpdate.teamNames)
    );
}
