import { effects, SagaIterator } from "redux-saga";
import { PortfolioPlanningDataService } from "../../../Services/PortfolioPlanningDataService";
import { PlanDirectoryActions, PlanDirectoryActionTypes } from "../Actions/PlanDirectoryActions";
import { ActionsOfType } from "../Helpers";
import { PortfolioPlanningDirectory, PortfolioPlanningMetadata } from "../../Models/PortfolioPlanningQueryModels";

export function* planDirectorySaga(): SagaIterator {
    yield effects.call(initializePlanDirectory);
    yield effects.takeEvery(PlanDirectoryActionTypes.DeletePlan, deletePlan);
    yield effects.takeEvery(PlanDirectoryActionTypes.UpdateProjectsAndTeamsMetadata, updateProjectsAndTeamsMetadata);
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
    action: ActionsOfType<PlanDirectoryActions, PlanDirectoryActionTypes.UpdateProjectsAndTeamsMetadata>
): SagaIterator {
    const { id, projectNames, teamNames } = action.payload;

    const service = PortfolioPlanningDataService.getInstance();

    const planToUpdate: PortfolioPlanningMetadata = yield effects.call(
        [service, service.GetPortfolioPlanDirectoryEntry],
        id
    );
    planToUpdate.projectNames = projectNames;
    planToUpdate.teamNames = teamNames;

    yield effects.call([service, service.UpdatePortfolioPlanDirectoryEntry], planToUpdate);
}
