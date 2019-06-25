export interface ODataWorkItemQueryResult
{
    WorkItemId: number;
    WorkItemType: string;
    Title: string;
    State: string;
    StartDate: Date;
    TargetDate: Date;
    ProjectSK: string;
    AreaSK: string;
    Descendants: ODataWorkItemDescendants[]
}

export interface ODataWorkItemDescendants
{
    StoryPointsProgress: number;
    CountProgress: number;
    CompletedStoryPoints: number;
    TotalStoryPoints: number;
    CompletedCount: number;
    TotalCount: number;
}

export interface ODataQueryProjectInput
{
    projectId: string;
    workItemIds: number[];
}

export interface ODataAreaQueryResult
{
    ProjectSK: string;
    AreaSK: string;
    Teams : ODataTeamResult[];
}

export interface ODataTeamResult
{
    TeamSK: string;
    TeamName: string;
}