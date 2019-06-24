import {
    createAction,
    ActionsUnion
} from "../../../Common/redux/Helpers/ActionHelper";

export const enum PlanDirectoryActionTypes {
    CreatePlan = "PlanDirectory/CreatePlan",
    ToggleNewPlanDialogVisible = "PlanDirectory/ToggleNewPlanDialogVisible"
}

export const PlanDirectoryActions = {
    createPlan: (title: string, description: string) =>
        createAction(PlanDirectoryActionTypes.CreatePlan, {
            title,
            description
        }),
    toggleNewPlanDialogVisible: (visible: boolean) =>
        createAction(PlanDirectoryActionTypes.ToggleNewPlanDialogVisible, {
            visible
        })
};

export type PlanDirectoryActions = ActionsUnion<typeof PlanDirectoryActions>;
