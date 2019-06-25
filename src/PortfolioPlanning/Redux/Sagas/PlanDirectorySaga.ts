import { effects, SagaIterator } from "redux-saga";
import { PortfolioPlanningDataService } from "../../../Services/PortfolioPlanningDataService";
import { PlanDirectoryActions } from "../Actions/PlanDirectoryActions";

export function* planDirectorySaga(): SagaIterator {
    yield effects.call(initializePlanDirectory);
}

export function* initializePlanDirectory(): SagaIterator {
    const service = PortfolioPlanningDataService.getInstance();

    const allPlans = yield effects.call([
        service,
        service.GetAllPortfolioPlans
    ]);

    yield effects.put(PlanDirectoryActions.initialize(allPlans));
}
