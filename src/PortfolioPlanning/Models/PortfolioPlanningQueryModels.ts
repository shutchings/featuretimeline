import { ODataQueryProjectInput } from "./ODataQueryModels";
import { ProjectConfiguration } from "./ProjectBacklogModels";
import { IdentityRef } from "VSS/WebApi/Contracts";

export interface PortfolioPlanningQueryInput {
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

    CompletedEffort: number;
    TotalEffort: number;

    EffortProgress: number;
    CountProgress: number;
}

export interface PortfolioPlanningProjectQueryInput {
    projectIds: string[];
}

export interface PortfolioPlanningProjectQueryResult extends IQueryResultError {
    projects: Project[];
    projectConfigurations: { [projectId: string]: ProjectConfiguration };
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
    owner: IdentityRef;
    createdOn: Date;
}

export interface PortfolioPlanning extends PortfolioPlanningMetadata {
    projects: { [projectId: string]: ProjectPortfolioPlanning };
}

export interface ProjectPortfolioPlanning {
    ProjectId: string;
    PortfolioWorkItemType: string;
    RequirementWorkItemType: string;
    EffortODataColumnName: string;
    EffortWorkItemFieldRefName: string;
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

export interface PortfolioPlanningWorkitemTypeFieldNameQueryInput {
    ProjectSK: string;
    FieldReferenceName: string;
    WorkItemType: string;
}

export interface PortfolioPlanningWorkItemTypeFieldNameQueryResult extends IQueryResultError {
    FieldType: string;
    FieldName: string;
}
