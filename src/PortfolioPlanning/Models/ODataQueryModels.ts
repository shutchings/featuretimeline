export interface ODataWorkItemQueryResult {
    WorkItemId: number;
    WorkItemType: string;
    Title: string;
    State: string;
    StartDate: Date;
    TargetDate: Date;
    ProjectSK: string;
    AreaSK: string;
}

export interface ODataQueryProjectInput {
    projectId: string;
    WorkItemTypeFilter: string;
    DescendantsWorkItemTypeFilter: string;
    EffortODataColumnName: string;
    EffortWorkItemFieldRefName: string;
    workItemIds: number[];
}

export interface ODataAreaQueryResult {
    ProjectSK: string;
    AreaSK: string;
    Teams: ODataTeamResult[];
}

export interface ODataTeamResult {
    TeamSK: string;
    TeamName: string;
}

export enum WellKnownEffortODataColumnNames {
    Size = "Size",
    StoryPoints = "StoryPoints",
    Effort = "Effort"
}

export interface WorkItemTypeAggregationClauses {
    aliasMap: {
        [projectId: string]: {
            [portfolioWorkItemType: string]: {
                totalEffortAlias: string;
                completedEffortAlias: string;
            };
        };
    };
    allClauses: { [clause: string]: string };
    allDescendantsWorkItemTypes: { [workItemType: string]: string };
}

export enum ODataConstants {
    Descendants = "Descendants",
    TotalCount = "TotalCount",
    CompletedCount = "CompletedCount"
}
