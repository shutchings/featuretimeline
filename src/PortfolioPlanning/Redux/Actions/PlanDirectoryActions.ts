import {
    createAction,
    ActionsUnion
} from "../../../Common/redux/Helpers/ActionHelper";

export const enum PlanDirectoryActionTypes {
    CreatePlan = "PlanDirectory/CreatePlan",
    ToggleSelectedPlanId = "PlanDirectory/SelectPlan",
    ToggleNewPlanDialogVisible = "PlanDirectory/ToggleNewPlanDialogVisible"
}

export const PlanDirectoryActions = {
    createPlan: (title: string, description: string) =>
        createAction(PlanDirectoryActionTypes.CreatePlan, {
            title,
            description
        }),
    toggleSelectedPlanId: (id: string) =>
        createAction(PlanDirectoryActionTypes.ToggleSelectedPlanId, {
            id
        }),
    toggleNewPlanDialogVisible: (visible: boolean) =>
        createAction(PlanDirectoryActionTypes.ToggleNewPlanDialogVisible, {
            visible
        })
};

export type PlanDirectoryActions = ActionsUnion<typeof PlanDirectoryActions>;
