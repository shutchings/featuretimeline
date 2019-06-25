import { IEpicTimelineState } from "../Contracts";
import { Projects, Epics, OtherEpics } from "../SampleData";
import {
    EpicTimelineActions,
    EpicTimelineActionTypes,
    PortfolioItemsReceivedAction
} from "../Actions/EpicTimelineActions";
import produce from "immer";
import { ProgressTrackingCriteria } from "../../Contracts";

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
            case EpicTimelineActionTypes.AddEpics: {
                const { epicsToAdd } = action.payload;

                draft.epics.push(...epicsToAdd);

                for (let epic of epicsToAdd) {
                    if (
                        !draft.projects.find(
                            project => project.id === epic.project
                        )
                    ) {
                        draft.projects.push({
                            id: epic.project,
                            title: "Newly added project" // TODO: Add real project name once we work the real scenario with Ed
                        });
                    }
                }

                break;
            }
            case EpicTimelineActionTypes.RemoveEpic: {
                const { id } = action.payload;
                const indexToRemoveEpic = state.epics.findIndex(
                    epic => epic.id === id
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

                break;
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
        projects: Projects,
        epics: Epics,
        otherEpics: OtherEpics,
        message: "Initial message",
        addEpicDialogOpen: false,
        setDatesDialogHidden: false,
        selectedItemId: null,
        progressTrackingCriteria: ProgressTrackingCriteria.StoryPoints
    };
}

function handlePortfolioItemsReceived(
    state: IEpicTimelineState,
    action: PortfolioItemsReceivedAction,
): IEpicTimelineState {
    return produce(state, draft => {
        const { 
            portfolioQueryResult, 
            projectsQueryResult,
            teamAreasQueryResult
         } = action.payload;

        //  TODO    Handle exception message from OData query results.

        draft.projects = projectsQueryResult.projects.map(project => {
            return {
                id: project.ProjectSK,
                title: project.ProjectName
            };
        });

        draft.epics = portfolioQueryResult.items.map(
            item => {
                //  Using the first team found for the area, if available.
                const teamIdValue: string = (teamAreasQueryResult.teamsInArea[item.AreaId] && teamAreasQueryResult.teamsInArea[item.AreaId][0]) ?
                    teamAreasQueryResult.teamsInArea[item.AreaId][0].teamId :
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
    });
}
