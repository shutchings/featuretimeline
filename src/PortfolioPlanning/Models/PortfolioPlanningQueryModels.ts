import { ODataQueryProjectInput } from "./ODataQueryModels";

export interface PortfolioPlanningQueryInput
{
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

export interface PortfolioPlanningQueryResult extends IQueryResultError
{
    items: PortfolioPlanningQueryResultItem[];
}

export interface PortfolioPlanningQueryResultItem
{
    WorkItemId: number;
    WorkItemType: string;
    Title: string;
    State: string;

    StartDate: Date;
    TargetDate: Date;

    ProjectId: string;

    CompletedCount: number;
    TotalCount: number;

    CompletedStoryPoints: number;
    TotalStoryPoints: number;

    StoryPointsProgress: number;
    CountProgress: number;
}

export interface PortfolioPlanningProjectQueryInput
{
    projectIds: string[];
}

export interface PortfolioPlanningProjectQueryResult extends IQueryResultError
{
    projects: Project[];
}

export interface PortfolioPlanningWorkItemQueryResult extends IQueryResultError
{
    workItems: WorkItem[];
}

export interface Project 
{
    ProjectSK: string;
    ProjectName: string;
}

export interface WorkItem
{
    WorkItemId: number;
    WorkItemType: string;
    Title: string;
    State: string;
}

export interface IQueryResultError
{
    exceptionMessage: string;
}