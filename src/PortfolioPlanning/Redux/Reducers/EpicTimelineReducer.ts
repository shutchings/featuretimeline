import { IEpicTimelineState } from "../Contracts";
import { Projects, Epics, OtherEpics } from "../SampleData";
import {
    EpicTimelineActions,
    EpicTimelineActionTypes,
    PortfolioItemsReceivedAction
} from "../Actions/EpicTimelineActions";
import produce from "immer";

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
            case EpicTimelineActionTypes.SetSelectedEpicId: {
                const { id } = action.payload;

                draft.selectedEpicId = id;

                break;
            }

            case EpicTimelineActionTypes.PortfolioItemsReceived:
                return handlePortfolioItemsReceived(state, action as PortfolioItemsReceivedAction);

                case EpicTimelineActionTypes.OpenAddEpicDialog: {
                draft.addEpicDialogOpen = true;
                break;
            }
            case EpicTimelineActionTypes.CloseAddEpicDialog: {
                draft.addEpicDialogOpen = false;
                break;
            }
            case EpicTimelineActionTypes.AddEpics: {
                draft.epics.push(...action.payload.epicsToAdd);
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
        selectedEpicId: null
    };
}

function handlePortfolioItemsReceived(
    state: IEpicTimelineState, 
    action: PortfolioItemsReceivedAction): IEpicTimelineState {

    return produce(state, draft => {
        const {
            portfolioQueryResult,
            projectsQueryResult
        } = action.payload;

        //  TODO    Handle exception message from OData query results.

        draft.projects = projectsQueryResult.projects.map(
            (project) =>
            {
                return {
                    id: project.ProjectSK,
                    title: project.ProjectName
                };
            });

        draft.epics = portfolioQueryResult.items.map(
            (item) =>
            {
                return {
                    id: item.WorkItemId,
                    project: item.ProjectId,
                    title: item.Title,
                    startDate: item.StartDate,
                    endDate: item.TargetDate,
                    completedCount: item.CompletedCount,
                    totalCount: item.TotalCount,
                    completedStoryPoints: item.CompletedStoryPoints,
                    totalStoryPoints: item.TotalStoryPoints,
                    storyPointsProgress: item.StoryPointsProgress,
                    countProgress: item.CountProgress
                }
            });
    });
}