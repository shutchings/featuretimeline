import { IPlanDirectoryState } from "../Contracts";
import produce from "immer";
import { PlanDirectoryActions, PlanDirectoryActionTypes } from "../Actions/PlanDirectoryActions";
import { LoadingStatus } from "../../Contracts";

export function planDirectoryReducer(state: IPlanDirectoryState, action: PlanDirectoryActions): IPlanDirectoryState {
    return produce(state || getDefaultState(), (draft: IPlanDirectoryState) => {
        switch (action.type) {
            case PlanDirectoryActionTypes.Initialize: {
                const { directoryData } = action.payload;

                draft.plans = directoryData.entries;
                draft.directoryLoadingStatus = LoadingStatus.Loaded;

                break;
            }
            case PlanDirectoryActionTypes.CreatePlan: {
                const { id, name, description } = action.payload;

                draft.plans.push({
                    id: id,
                    name: name,
                    description: description,
                    createdOn: new Date()
                });

                break;
            }
            case PlanDirectoryActionTypes.DeletePlan: {
                const { id } = action.payload;

                // Remove the plan from local state
                draft.plans = draft.plans.filter(plan => plan.id !== id);

                // Navigate back to directory page
                draft.selectedPlanId = undefined;

                break;
            }
            case PlanDirectoryActionTypes.ToggleSelectedPlanId: {
                const { id } = action.payload;

                draft.selectedPlanId = id;

                break;
            }
            case PlanDirectoryActionTypes.ToggleNewPlanDialogVisible: {
                const { visible } = action.payload;

                draft.newPlanDialogVisible = visible;

                break;
            }
        }
    });
}

export function getDefaultState(): IPlanDirectoryState {
    return {
        selectedPlanId: undefined,
        plans: [],
        newPlanDialogVisible: false,
        directoryLoadingStatus: LoadingStatus.NotLoaded
    };
}
