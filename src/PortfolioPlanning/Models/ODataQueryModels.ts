export interface ODataWorkItemQueryResult
{
    WorkItemId: number;
    WorkItemType: string;
    ProjectSK: string;
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