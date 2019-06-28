export interface ODataWorkItemQueryResult {
    WorkItemId: number;
    WorkItemType: string;
    Title: string;
    State: string;
    StartDate: Date;
    TargetDate: Date;
    ProjectSK: string;
    AreaSK: string;
    Descendants: ODataWorkItemDescendants[];
}

export interface ODataWorkItemDescendants {
    TotalCount: number;
    CompletedCount: number;

    TotalEffort: number;
    CompletedEffort: number;

    CountProgress: number;
    EffortProgress: number;
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
