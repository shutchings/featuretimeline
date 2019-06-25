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
            case PlanDirectoryActionTypes.Initialize: {
                const { directoryData } = action.payload;

                draft.plans = directoryData.entries;

                break;
            }
            case PlanDirectoryActionTypes.CreatePlan: {
                const { name, description } = action.payload;

                draft.plans.push({
                    id: "6",
                    name: name,
                    description: description,
                    createdOn: new Date()
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
        plans: [],
        newPlanDialogVisible: false
        // plans: [
        //     {
        //         id: "1",
        //         name: "Q1 Planning",
        //         description: "Features we plan to deliver Q1 of this year",
        //         createdOn: new Date()
        //     },
        //     {
        //         id: "2",
        //         name: "Q2 Roadmap",
        //         description:
        //             "Roadmap of features our organization plans to deliver in Q2",
        //         createdOn: new Date()
        //     },
        //     {
        //         id: "3",
        //         name: "Contoso Team's OKRs",
        //         description: "Contoso OKRs",
        //         createdOn: new Date()
        //     },
        //     {
        //         id: "4",
        //         name: "Contoso Team's OKRs",
        //         description: "Contoso OKRs",
        //         createdOn: new Date()
        //     },
        //     {
        //         id: "5",
        //         name: "Contoso Team's OKRs",
        //         description: "Contoso OKRs",
        //         createdOn: new Date()
        //     }
        // ],
    };
}
