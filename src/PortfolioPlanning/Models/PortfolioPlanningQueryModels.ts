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

export interface PortfolioPlanningQueryResult
{
    exceptionMessage: string;
    items: PortfolioPlanningQueryResultItem[];
}

export interface PortfolioPlanningQueryResultItem
{
    WorkItemId: number;
    WorkItemType: string;
    ProjectId: string;

    CompletedCount: number;
    TotalCount: number;

    CompletedStoryPoints: number;
    TotalStoryPoints: number;

    StoryPointsProgress: number;
    CountProgress: number;
}