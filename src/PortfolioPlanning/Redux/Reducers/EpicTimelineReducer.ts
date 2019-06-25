import { IEpicTimelineState } from "../Contracts";
import {
    EpicTimelineActions,
    EpicTimelineActionTypes,
    PortfolioItemsReceivedAction,
    PortfolioItemDeletedAction
} from "../Actions/EpicTimelineActions";
import produce from "immer";
import { ProgressTrackingCriteria } from "../../Contracts";
import { MergeType } from "../../Models/PortfolioPlanningQueryModels";

export function epicTimelineReducer(
    state: IEpicTimelineState,
    action: EpicTimelineActions
): IEpicTimelineState {
    return produce(state || getDefaultState(), (draft: IEpicTimelineState) => {
        switch (action.type) {
            case EpicTimelineActionTypes.UpdateStartDate: {
                const { epicId, startDate } = action.payload;

                const epicToUpdate = draft.epics.find(
                    epic => epic.id === epicId
                );

                epicToUpdate.startDate = startDate.toDate();

                break;
            }
            case EpicTimelineActionTypes.UpdateEndDate: {
                const { epicId, endDate } = action.payload;

                const epicToUpdate = draft.epics.find(
                    epic => epic.id === epicId
                );

                epicToUpdate.endDate = endDate.toDate();

                break;
            }
            case EpicTimelineActionTypes.ShiftEpic: {
                const { epicId, startDate } = action.payload;

                const epicToUpdate = draft.epics.find(
                    epic => epic.id === epicId
                );

                const epicDuration =
                    epicToUpdate.endDate.getTime() -
                    epicToUpdate.startDate.getTime();

                epicToUpdate.startDate = startDate.toDate();
                epicToUpdate.endDate = startDate
                    .add(epicDuration, "milliseconds")
                    .toDate();

                break;
            }
            case EpicTimelineActionTypes.ToggleSetDatesDialogHidden: {
                const { hidden } = action.payload;

                draft.setDatesDialogHidden = hidden;

                break;
            }
            case EpicTimelineActionTypes.SetSelectedItemId: {
                const { id } = action.payload;

                draft.selectedItemId = id;

                break;
            }
            case EpicTimelineActionTypes.PortfolioItemsReceived:
                return handlePortfolioItemsReceived(
                    state,
                    action as PortfolioItemsReceivedAction
                );

            case EpicTimelineActionTypes.OpenAddEpicDialog: {
                draft.addEpicDialogOpen = true;
                break;
            }
            case EpicTimelineActionTypes.CloseAddEpicDialog: {
                draft.addEpicDialogOpen = false;
                break;
            }
            case EpicTimelineActionTypes.PortfolioItemDeleted: {
                return handlePortfolioItemDeleted(
                    state,
                    action as PortfolioItemDeletedAction
                );
            }
            case EpicTimelineActionTypes.ToggleProgressTrackingCriteria: {
                draft.progressTrackingCriteria = action.payload.criteria;
                break;
            }
        }
    });
}

export function getDefaultState(): IEpicTimelineState {
    return {
        projects: [],
        epics: [],
        message: "Initial message",
        addEpicDialogOpen: false,
        setDatesDialogHidden: false,
        selectedItemId: null,
        progressTrackingCriteria: ProgressTrackingCriteria.StoryPoints
    };
}

function handlePortfolioItemsReceived(
    state: IEpicTimelineState,
    action: PortfolioItemsReceivedAction
): IEpicTimelineState {
    return produce(state, draft => {
        const { 
            items,
            projects,
            teamAreas,
            mergeStrategy
         } = action.payload;

        //  TODO    Handle exception message from OData query results.

         if(mergeStrategy === MergeType.Replace){

            draft.projects = projects.projects.map(project => {
                return {
                    id: project.ProjectSK,
                    title: project.ProjectName
                };
            });

            draft.epics = items.items.map(
                item => {
                    //  Using the first team found for the area, if available.
                    const teamIdValue: string = (teamAreas.teamsInArea[item.AreaId] && teamAreas.teamsInArea[item.AreaId][0]) ?
                        teamAreas.teamsInArea[item.AreaId][0].teamId :
                        null;

                    return {
                        id: item.WorkItemId,
                        project: item.ProjectId,
                        teamId: teamIdValue,
                        title: item.Title,
                        startDate: item.StartDate,
                        endDate: item.TargetDate,
                        completedCount: item.CompletedCount,
                        totalCount: item.TotalCount,
                        completedStoryPoints: item.CompletedStoryPoints,
                        totalStoryPoints: item.TotalStoryPoints,
                        storyPointsProgress: item.StoryPointsProgress,
                        countProgress: item.CountProgress
                    };
            });
        }
        else if (mergeStrategy === MergeType.Add)
        {
            projects.projects.forEach(newProjectInfo => {
                const filteredProjects = draft.projects.filter(p => p.id === newProjectInfo.ProjectSK);

                if(filteredProjects.length === 0)
                {
                    draft.projects.push({
                        id: newProjectInfo.ProjectSK,
                        title: newProjectInfo.ProjectName
                    });
                }
            });

            //  TODO    change draft.projects and draft.epics to maps
            items.items.forEach(newItemInfo => {
                const filteredItems = draft.epics.filter(p => p.id === newItemInfo.WorkItemId);

                if(filteredItems.length === 0)
                {
                    //  Using the first team found for the area, if available.
                    const teamIdValue: string = (teamAreas.teamsInArea[newItemInfo.AreaId] && teamAreas.teamsInArea[newItemInfo.AreaId][0]) ?
                        teamAreas.teamsInArea[newItemInfo.AreaId][0].teamId :
                        null;

                    draft.epics.push({
                        id: newItemInfo.WorkItemId,
                        project: newItemInfo.ProjectId,
                        teamId: teamIdValue,
                        title: newItemInfo.Title,
                        startDate: newItemInfo.StartDate,
                        endDate: newItemInfo.TargetDate,
                        completedCount: newItemInfo.CompletedCount,
                        totalCount: newItemInfo.TotalCount,
                        completedStoryPoints: newItemInfo.CompletedStoryPoints,
                        totalStoryPoints: newItemInfo.TotalStoryPoints,
                        storyPointsProgress: newItemInfo.StoryPointsProgress,
                        countProgress: newItemInfo.CountProgress
                    });
                }
            });
        }
    });
}

function handlePortfolioItemDeleted(
    state: IEpicTimelineState,
    action: PortfolioItemDeletedAction
): IEpicTimelineState {
    return produce(state, draft => {
        const { 
            epicToRemove
         } = action.payload;

         const indexToRemoveEpic = state.epics.findIndex(
             epic => epic.id === epicToRemove
         );

         const removedEpic = draft.epics.splice(indexToRemoveEpic, 1)[0];
         draft.selectedItemId = undefined;

         // Remove the project if it's the last epic in the project
         if (
             !draft.epics.some(
                 epic => epic.project === removedEpic.project
             )
         ) {
             const indexToRemoveProject = state.projects.findIndex(
                 project => project.id === removedEpic.project
             );
             draft.projects.splice(indexToRemoveProject, 1);
         }
    });
}