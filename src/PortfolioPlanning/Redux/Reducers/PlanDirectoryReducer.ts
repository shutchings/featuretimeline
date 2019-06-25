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

                draft.plans.push({
                    id: "6",
                    title: title,
                    description: description
                });

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
        plans: [
            {
                id: "1",
                title: "Q1 Planning",
                description: "Features we plan to deliver Q1 of this year"
            },
            {
                id: "2",
                title: "Q2 Roadmap",
                description:
                    "Roadmap of features our organization plans to deliver in Q2"
            },
            {
                id: "3",
                title: "Contoso Team's OKRs",
                description: "Contoso OKRs"
            },
            {
                id: "4",
                title: "Contoso Team's OKRs",
                description: "Contoso OKRs"
            },
            {
                id: "5",
                title: "Contoso Team's OKRs",
                description: "Contoso OKRs"
            }
        ],
        newPlanDialogVisible: false
    };
}
