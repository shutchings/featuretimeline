import { effects, SagaIterator } from "redux-saga";
import { PortfolioPlanningDataService } from "../../../Services/PortfolioPlanningDataService";
import { PlanDirectoryActions, PlanDirectoryActionTypes } from "../Actions/PlanDirectoryActions";
import { ActionsOfType } from "../Helpers";
import { PortfolioPlanningDirectory } from "../../Models/PortfolioPlanningQueryModels";

export function* planDirectorySaga(): SagaIterator {
    yield effects.call(initializePlanDirectory);
    yield effects.takeEvery(PlanDirectoryActionTypes.DeletePlan, deletePlan);
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
