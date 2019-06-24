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
        plans: [
            {
                title: "Q1 Planning",
                description: "Features we plan to deliver Q1 of this year",
                teams: ["Contoso"],
                projects: ["Fabrikam"],
                tags: ["Marketing", "Engineering"]
            },
            {
                title: "Q2 Roadmap",
                description:
                    "Roadmap of features our organization plans to deliver in Q2",
                teams: ["Contoso", "Adatum"],
                projects: ["Fabrikam"],
                tags: ["Some tag"]
            },
            {
                title: "Contoso Team's OKRs",
                description: "Contoso OKRs",
                teams: ["Contoso"],
                projects: ["Fabrikam"],
                tags: ["Some tag", "Engineering"]
            },
            {
                title: "Contoso Team's OKRs",
                description: "Contoso OKRs",
                teams: ["Contoso"],
                projects: ["Fabrikam"],
                tags: ["Some tag", "Engineering"]
            },
            {
                title: "Contoso Team's OKRs",
                description: "Contoso OKRs",
                teams: ["Contoso"],
                projects: ["Fabrikam"],
                tags: ["Some tag", "Engineering"]
            }
        ],
        newPlanDialogVisible: false
    };
}
