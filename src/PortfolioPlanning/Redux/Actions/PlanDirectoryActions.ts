import { createAction, ActionsUnion } from "../../../Common/redux/Helpers/ActionHelper";
import { PortfolioPlanningDirectory } from "../../Models/PortfolioPlanningQueryModels";
import { IdentityRef } from "VSS/WebApi/Contracts";

export const enum PlanDirectoryActionTypes {
    Initialize = "PlanDirectory/Initialize",
    CreatePlan = "PlanDirectory/CreatePlan",
    DeletePlan = "PlanDirectory/DeletePlan",
    UpdateProjectsAndTeamsMetadata = "PlanDirectory/UpdateProjectsAndTeamsMetadata",
    ToggleSelectedPlanId = "PlanDirectory/SelectPlan",
    ToggleNewPlanDialogVisible = "PlanDirectory/ToggleNewPlanDialogVisible"
}

export const PlanDirectoryActions = {
    initialize: (directoryData: PortfolioPlanningDirectory) =>
        createAction(PlanDirectoryActionTypes.Initialize, { directoryData }),
    createPlan: (id: string, name: string, description: string, owner: IdentityRef) =>
        createAction(PlanDirectoryActionTypes.CreatePlan, {
            id,
            name,
            description,
            owner
        }),
    deletePlan: (id: string) => createAction(PlanDirectoryActionTypes.DeletePlan, { id }),
    updateProjectsAndTeamsMetadata: (projectNames: string[], teamNames: string[]) =>
        createAction(PlanDirectoryActionTypes.UpdateProjectsAndTeamsMetadata, { projectNames, teamNames }),
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
