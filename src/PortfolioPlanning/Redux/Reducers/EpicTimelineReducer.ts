import * as moment from "moment";
import { IEpicTimelineState } from "../Contracts";
import {
    EpicTimelineActions,
    EpicTimelineActionTypes,
    PortfolioItemsReceivedAction,
    PortfolioItemDeletedAction
} from "../Actions/EpicTimelineActions";
import produce from "immer";
import { ProgressTrackingCriteria, LoadingStatus } from "../../Contracts";
import { MergeType } from "../../Models/PortfolioPlanningQueryModels";

export function epicTimelineReducer(state: IEpicTimelineState, action: EpicTimelineActions): IEpicTimelineState {
    return produce(state || getDefaultState(), (draft: IEpicTimelineState) => {
        switch (action.type) {
            case EpicTimelineActionTypes.UpdateStartDate: {
                const { epicId, startDate } = action.payload;

                const epicToUpdate = draft.epics.find(epic => epic.id === epicId);

                epicToUpdate.startDate = startDate.toDate();

                break;
            }
            case EpicTimelineActionTypes.UpdateEndDate: {
                const { epicId, endDate } = action.payload;

                const epicToUpdate = draft.epics.find(epic => epic.id === epicId);

                epicToUpdate.endDate = endDate.toDate();

                break;
            }
            case EpicTimelineActionTypes.ShiftItem: {
                const { itemId, startDate } = action.payload;

                const epicToUpdate = draft.epics.find(epic => epic.id === itemId);

                const epicDuration = epicToUpdate.endDate.getTime() - epicToUpdate.startDate.getTime();

                epicToUpdate.startDate = startDate.toDate();
                epicToUpdate.endDate = startDate.add(epicDuration, "milliseconds").toDate();

                break;
            }
            case EpicTimelineActionTypes.ToggleItemDetailsDialogHidden: {
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
                draft.planLoadingStatus = LoadingStatus.Loaded;

                return handlePortfolioItemsReceived(draft, action as PortfolioItemsReceivedAction);

            case EpicTimelineActionTypes.OpenAddItemPanel: {
                draft.addEpicDialogOpen = true;
                break;
            }
            case EpicTimelineActionTypes.CloseAddItemPanel: {
                draft.addEpicDialogOpen = false;
                break;
            }
            case EpicTimelineActionTypes.PortfolioItemDeleted: {
                return handlePortfolioItemDeleted(state, action as PortfolioItemDeletedAction);
            }
            case EpicTimelineActionTypes.ToggleProgressTrackingCriteria: {
                draft.progressTrackingCriteria = action.payload.criteria;
                break;
            }
            case EpicTimelineActionTypes.ToggleLoadingStatus: {
                const { status } = action.payload;

                draft.planLoadingStatus = status;

                break;
            }
            case EpicTimelineActionTypes.ResetPlanState: {
                draft.planLoadingStatus = LoadingStatus.NotLoaded;
                draft.selectedItemId = undefined;
                draft.setDatesDialogHidden = true;
                draft.addEpicDialogOpen = false;
                draft.epics = [];
                draft.projects = [];
                draft.teams = {};

                break;
            }
            case EpicTimelineActionTypes.TogglePlanSettingsPanelOpen: {
                const { isOpen } = action.payload;

                draft.planSettingsPanelOpen = isOpen;

                break;
            }
            case EpicTimelineActionTypes.UpdateVisibleTimeStart: {
                draft.visibleTimeStart = action.payload.visibleTimeStart;
                break;
            }
            case EpicTimelineActionTypes.UpdateVisibleTimeEnd: {
                draft.visibleTimeEnd = action.payload.visibleTimeEnd;
                break;
            }
        }
    });
}

export function getDefaultState(): IEpicTimelineState {
    return {
        planLoadingStatus: LoadingStatus.NotLoaded,
        exceptionMessage: "",
        projects: [],
        projectConfiguration: {},
        teams: {},
        epics: [],
        message: "Initial message",
        addEpicDialogOpen: false,
        setDatesDialogHidden: true,
        planSettingsPanelOpen: false,
        selectedItemId: null,
        progressTrackingCriteria: ProgressTrackingCriteria.CompletedCount,
        visibleTimeStart: null,
        visibleTimeEnd: null,
    };
}

function handlePortfolioItemsReceived(
    state: IEpicTimelineState,
    action: PortfolioItemsReceivedAction
): IEpicTimelineState {
    return produce(state, draft => {
        const { items, projects, teamAreas, mergeStrategy } = action.payload;

        //  TODO    Handle exception message from OData query results.

        if (mergeStrategy === MergeType.Replace) {
            draft.projects = projects.projects.map(project => {
                const defaultProjectWiTypes = projects.projectConfigurations[project.ProjectSK.toLowerCase()];

                return {
                    id: project.ProjectSK,
                    title: project.ProjectName,
                    defaultEpicWorkItemType: defaultProjectWiTypes
                        ? defaultProjectWiTypes.defaultEpicWorkItemType
                        : null,
                    defaultRequirementWorkItemType: defaultProjectWiTypes
                        ? defaultProjectWiTypes.defaultRequirementWorkItemType
                        : null
                };
            });

            draft.projectConfiguration = {};
            Object.keys(projects.projectConfigurations).forEach(projectIdKey => {
                const projectConfig = projects.projectConfigurations[projectIdKey];
                const projectIdKeyLowercase = projectIdKey.toLowerCase();

                draft.projectConfiguration[projectIdKeyLowercase] = {
                    id: projectIdKeyLowercase,
                    defaultEpicWorkItemType: projectConfig.defaultEpicWorkItemType,
                    defaultRequirementWorkItemType: projectConfig.defaultRequirementWorkItemType,
                    effortWorkItemFieldRefName: projectConfig.effortFieldRefName,
                    effortODataColumnName: projectConfig.effortODataColumnName
                };
            });

            draft.epics = items.items.map(item => {
                //  Using the first team found for the area, if available.
                const teamIdValue: string =
                    teamAreas.teamsInArea[item.AreaId] && teamAreas.teamsInArea[item.AreaId][0]
                        ? teamAreas.teamsInArea[item.AreaId][0].teamId
                        : null;

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

            draft.teams = {};

            if (teamAreas.teamsInArea) {
                Object.keys(teamAreas.teamsInArea).forEach(areaId => {
                    const teams = teamAreas.teamsInArea[areaId];

                    teams.forEach(team => {
                        if (!draft.teams[team.teamId]) {
                            draft.teams[team.teamId] = {
                                teamId: team.teamId,
                                teamName: team.teamName
                            };
                        }
                    });
                });
            }
        } else if (mergeStrategy === MergeType.Add) {
            projects.projects.forEach(newProjectInfo => {
                const filteredProjects = draft.projects.filter(p => p.id === newProjectInfo.ProjectSK);

                if (filteredProjects.length === 0) {
                    const newProjectIdLowercase = newProjectInfo.ProjectSK.toLowerCase();
                    const projectConfig = projects.projectConfigurations[newProjectIdLowercase];

                    draft.projects.push({
                        id: newProjectInfo.ProjectSK,
                        title: newProjectInfo.ProjectName
                    });

                    draft.projectConfiguration[newProjectIdLowercase] = {
                        id: newProjectIdLowercase,
                        defaultEpicWorkItemType: projectConfig.defaultEpicWorkItemType,
                        defaultRequirementWorkItemType: projectConfig.defaultRequirementWorkItemType,
                        effortWorkItemFieldRefName: projectConfig.effortFieldRefName,
                        effortODataColumnName: projectConfig.effortODataColumnName
                    };
                }
            });

            //  TODO    change draft.projects and draft.epics to maps
            items.items.forEach(newItemInfo => {
                const filteredItems = draft.epics.filter(p => p.id === newItemInfo.WorkItemId);

                if (filteredItems.length === 0) {
                    //  Using the first team found for the area, if available.
                    const teamIdValue: string =
                        teamAreas.teamsInArea[newItemInfo.AreaId] && teamAreas.teamsInArea[newItemInfo.AreaId][0]
                            ? teamAreas.teamsInArea[newItemInfo.AreaId][0].teamId
                            : null;

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

                    // Add auto scroll to put newly added epic in view.
                    const newItemStartDate: number = moment(newItemInfo.StartDate).valueOf();
                    const newItemTargetDate: number = moment(newItemInfo.TargetDate).valueOf();
                    if(newItemStartDate < draft.visibleTimeStart) {
                        draft.visibleTimeStart = moment(newItemStartDate).add(-1, "months").valueOf();
                    }
                    if(newItemTargetDate > draft.visibleTimeEnd) {
                        draft.visibleTimeEnd = moment(newItemTargetDate).add(1, "months").valueOf();;
                    }
                }
            });

            if (teamAreas.teamsInArea && draft.teams) {
                Object.keys(teamAreas.teamsInArea).forEach(areaId => {
                    const teams = teamAreas.teamsInArea[areaId];

                    teams.forEach(team => {
                        if (!draft.teams[team.teamId]) {
                            draft.teams[team.teamId] = {
                                teamId: team.teamId,
                                teamName: team.teamName
                            };
                        }
                    });
                });
            }
        }
    });
}

function handlePortfolioItemDeleted(state: IEpicTimelineState, action: PortfolioItemDeletedAction): IEpicTimelineState {
    return produce(state, draft => {
        const { itemIdToRemove } = action.payload;

        const indexToRemoveEpic = state.epics.findIndex(epic => epic.id === itemIdToRemove);

        const removedEpic = draft.epics.splice(indexToRemoveEpic, 1)[0];
        draft.selectedItemId = undefined;

        // Remove the project if it's the last epic in the project
        if (!draft.epics.some(epic => epic.project === removedEpic.project)) {
            const indexToRemoveProject = state.projects.findIndex(project => project.id === removedEpic.project);
            draft.projects.splice(indexToRemoveProject, 1);
        }

        // Remove team if all team items have been removed.
        Object.keys(draft.teams).forEach(teamId => {
            if (!draft.epics.some(epic => epic.teamId === teamId)) {
                delete draft.teams[teamId];
            }
        });
    });
}
