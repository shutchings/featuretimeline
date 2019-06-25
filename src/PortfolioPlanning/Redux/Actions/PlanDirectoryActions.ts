import {
    createAction,
    ActionsUnion
} from "../../../Common/redux/Helpers/ActionHelper";
import { PortfolioPlanningDirectory } from "../../Models/PortfolioPlanningQueryModels";

export const enum PlanDirectoryActionTypes {
    Initialize = "PlanDirectory/Initialize",
    CreatePlan = "PlanDirectory/CreatePlan",
    ToggleSelectedPlanId = "PlanDirectory/SelectPlan",
    ToggleNewPlanDialogVisible = "PlanDirectory/ToggleNewPlanDialogVisible"
}

export const PlanDirectoryActions = {
    initialize: (directoryData: PortfolioPlanningDirectory) =>
        createAction(PlanDirectoryActionTypes.Initialize, { directoryData }),
    createPlan: (id: string, name: string, description: string) =>
        createAction(PlanDirectoryActionTypes.CreatePlan, {
            id,
            name,
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
