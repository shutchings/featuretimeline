import { IPortfolioPlanningState } from "../Contracts";

export function getSelectedPlanId(state: IPortfolioPlanningState): string {
    return state.planDirectoryState.selectedPlanId;
}
