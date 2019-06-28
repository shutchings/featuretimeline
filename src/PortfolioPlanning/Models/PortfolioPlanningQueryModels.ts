import { ODataQueryProjectInput } from "./ODataQueryModels";

export interface PortfolioPlanningQueryInput {
    /**
     * TODO Supporting one work item type for now (e.g. 'Epic').
     */
    PortfolioWorkItemType: string;

    /**
     * Requirement level work item types. e.g. User Story, Task, etc...
     */
    RequirementWorkItemTypes: string[];

    /**
     * Work item ids and their projects.
     */
    WorkItems: ODataQueryProjectInput[];
}

export interface PortfolioPlanningQueryResult extends IQueryResultError {
    items: PortfolioPlanningQueryResultItem[];
}

export interface PortfolioPlanningQueryResultItem {
    WorkItemId: number;
    WorkItemType: string;
    Title: string;
    State: string;

    StartDate: Date;
    TargetDate: Date;

    ProjectId: string;
    AreaId: string;
    TeamId: string;

    CompletedCount: number;
    TotalCount: number;

    CompletedStoryPoints: number;
    TotalStoryPoints: number;

    StoryPointsProgress: number;
    CountProgress: number;
}

export interface PortfolioPlanningProjectQueryInput {
    projectIds: string[];
}

export interface PortfolioPlanningProjectQueryResult extends IQueryResultError {
    projects: Project[];
}

export interface PortfolioPlanningWorkItemQueryResult extends IQueryResultError {
    workItems: WorkItem[];
}

export interface Project {
    ProjectSK: string;
    ProjectName: string;
}

export interface WorkItem {
    WorkItemId: number;
    WorkItemType: string;
    Title: string;
    State: string;
}

export interface IQueryResultError {
    exceptionMessage: string;
    status?: number;
}

export interface PortfolioPlanningMetadata {
    id: string;
    name: string;
    description: string;
    teamNames: string[];
    projectNames: string[];
    createdOn: Date;
}

export interface PortfolioPlanning extends PortfolioPlanningMetadata {
    projects: { [projectId: string]: ProjectPortfolioPlanning };
}

export interface ProjectPortfolioPlanning {
    ProjectId: string;
    PortfolioWorkItemType: string;
    RequirementWorkItemType: string;
    WorkItemIds: number[];
}

export interface PortfolioPlanningDirectory extends IQueryResultError {
    id: string;
    entries: PortfolioPlanningMetadata[];
}

export interface ExtensionStorageError {
    stack: string;
    message: string;
    name: string;
    status: number;
    responseText: string;
}

export interface PortfolioPlanningTeamsInAreaQueryInput {
    /**
     * AreaIds by project id.
     */
    [projectId: string]: string[];
}

export interface PortfolioPlanningTeamsInAreaQueryResult extends IQueryResultError {
    teamsInArea: TeamsInArea;
}

export interface TeamsInArea {
    [areaId: string]: Team[];
}

export interface Team {
    teamId: string;
    teamName: string;
}

export interface PortfolioPlanningFullContentQueryResult {
    items: PortfolioPlanningQueryResult;
    projects: PortfolioPlanningProjectQueryResult;
    teamAreas: PortfolioPlanningTeamsInAreaQueryResult;
    mergeStrategy: MergeType;
}

export enum MergeType {
    Add,
    Replace
}
