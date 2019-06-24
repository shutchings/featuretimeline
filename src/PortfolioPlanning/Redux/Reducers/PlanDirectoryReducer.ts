import { IPlanDirectoryState } from "../Contracts";
import produce from "immer";
import {
    PlanDirectoryActions,
    PlanDirectoryActionTypes
} from "../Actions/PlanDirectoryActions";

export function planDirectoryReducer(
    state: IPlanDirectoryState,
    action: PlanDirectoryActions
): IPlanDirectoryState {
    return produce(state || getDefaultState(), (draft: IPlanDirectoryState) => {
        switch (action.type) {
            case PlanDirectoryActionTypes.CreatePlan: {
                const { title, description } = action.payload;

                alert(`Created with ${title} : ${description}`);

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
        plans: [],
        newPlanDialogVisible: false
    };
}
