import
{
    PortfolioPlanningQueryInput,
    PortfolioPlanningQueryResult, 
    PortfolioPlanningQueryResultItem,
    PortfolioPlanningProjectQueryInput,
    PortfolioPlanningProjectQueryResult,
    IQueryResultError,
    Project
} from "../PortfolioPlanning/Models/PortfolioPlanningQueryModels";
import { ODataClient } from "../Common/OData/ODataClient";
import { ODataWorkItemQueryResult } from "../PortfolioPlanning/Models/ODataQueryModels";


export class PortfolioPlanningDataService {

    private static _instance: PortfolioPlanningDataService;
    public static getInstance(): PortfolioPlanningDataService {
        if (!PortfolioPlanningDataService._instance) {

            PortfolioPlanningDataService._instance = new PortfolioPlanningDataService();
        }
        return PortfolioPlanningDataService._instance;
    }

    public async runPortfolioItemsQuery(
        queryInput: PortfolioPlanningQueryInput) : Promise<PortfolioPlanningQueryResult> {

        const odataQueryString = ODataQueryBuilder.WorkItemsQueryString(queryInput);

        const client = await ODataClient.getInstance();
        const fullQueryUrl = client.generateProjectLink(undefined, odataQueryString);

        return client.runGetQuery(fullQueryUrl).then(
            (results: any) => this.ParseODataPortfolioPlanningQueryResultResponse(results),
            (error) => this.ParseODataErrorResponse(error));
    }

    public async runProjectQuery(
        queryInput: PortfolioPlanningProjectQueryInput) : Promise<PortfolioPlanningProjectQueryResult> {

        const odataQueryString = ODataQueryBuilder.ProjectsQueryString(queryInput);

        const client = await ODataClient.getInstance();
        const fullQueryUrl = client.generateProjectLink(undefined, odataQueryString);

        return client.runGetQuery(fullQueryUrl).then(
            (results: any) => this.ParseODataProjectQueryResultResponse(results),
            (error) => this.ParseODataErrorResponse(error));
    }

    private ParseODataPortfolioPlanningQueryResultResponse(results : any) : PortfolioPlanningQueryResult {
        if(!results || !results["value"]) {
            return null;
        }

        const rawResult : ODataWorkItemQueryResult[] = results.value;

        return {
            exceptionMessage: null,
            items: this.PortfolioPlanningQueryResultItems(rawResult)
        }
    }

    private ParseODataProjectQueryResultResponse(results : any) : PortfolioPlanningProjectQueryResult {
        if(!results || !results["value"]) {
            return null;
        }

        const rawResult : Project[] = results.value;

        return {
            exceptionMessage: null,
            projects: rawResult
        }
    }    

    private PortfolioPlanningQueryResultItems(rawItems: ODataWorkItemQueryResult[]) : PortfolioPlanningQueryResultItem[] {
        if(!rawItems)
        {
            return null;
        }

        return  rawItems.map(
            (rawItem) => {
                const result: PortfolioPlanningQueryResultItem = {
                    WorkItemId: rawItem.WorkItemId,
                    WorkItemType: rawItem.WorkItemType,
                    Title: rawItem.Title,
                    State: rawItem.State,
                    StartDate: rawItem.StartDate,
                    TargetDate: rawItem.TargetDate,
                    ProjectId: rawItem.ProjectSK,
                    CompletedCount: 0,
                    TotalCount: 0,
                    CompletedStoryPoints: 0,
                    TotalStoryPoints: 0,
                    StoryPointsProgress: 0.0,
                    CountProgress: 0.0
                };

                if(rawItem.Descendants && rawItem.Descendants.length === 1) {
                    result.CompletedCount = rawItem.Descendants[0].CompletedCount;
                    result.TotalCount = rawItem.Descendants[0].TotalCount;
                
                    result.CompletedStoryPoints = rawItem.Descendants[0].CompletedStoryPoints;
                    result.TotalStoryPoints = rawItem.Descendants[0].TotalStoryPoints;
                
                    result.StoryPointsProgress = rawItem.Descendants[0].StoryPointsProgress;
                    result.CountProgress = rawItem.Descendants[0].CountProgress;
                }
                
                return result;
            });
    }

    private ParseODataErrorResponse(results : any) : IQueryResultError {
        return {
            exceptionMessage: results.responseJSON.error.message
        };
    }
}

export class ODataQueryBuilder {
    public static WorkItemsQueryString(input: PortfolioPlanningQueryInput) : string {
        return "WorkItems" +
        "?" +
            "$select=WorkItemId,WorkItemType,Title,State,StartDate,TargetDate,ProjectSK" +
        "&" +
            `$filter=${this.BuildODataQueryFilter(input)}` +
        "&" +
            `$expand=${this.BuildODataDescendantsQuery(input)}`;
    }

    public static ProjectsQueryString(input: PortfolioPlanningProjectQueryInput) : string {
        return "Projects" +
        "?" +
            "$select=ProjectSK,ProjectName" +
        "&" +
            `$filter=${this.ProjectsQueryFilter(input)}`;
    }

    /**
     *  (
                ProjectId eq FBED1309-56DB-44DB-9006-24AD73EEE785
        ) or (
                ProjectId eq 6974D8FE-08C8-4123-AD1D-FB830A098DFB
        )
     * @param input 
     */
    private static ProjectsQueryFilter(input: PortfolioPlanningProjectQueryInput) : string {
        return input.projectIds
            .map((pid) => `(ProjectId eq ${pid})`)
            .join(" or ");
    }

    /**
     *  (
                Project/ProjectId eq FBED1309-56DB-44DB-9006-24AD73EEE785
            and WorkItemType eq 'Epic'
            and (
                    WorkItemId eq 5250
                or  WorkItemId eq 5251
                )
        ) or (
                Project/ProjectId eq 6974D8FE-08C8-4123-AD1D-FB830A098DFB
            and WorkItemType eq 'Epic'
            and (
                    WorkItemId eq 5249
            )
        )
     * @param input 
     */
    private static BuildODataQueryFilter(input: PortfolioPlanningQueryInput) : string {
        const projectFilters = input.WorkItems.map(
            (wi) =>
            {
                const wiIdClauses = wi.workItemIds.map((id) => `WorkItemId eq ${id}`);

                const parts: string[] = [];
                parts.push(`Project/ProjectId eq ${wi.projectId}`);
                parts.push(`WorkItemType eq '${input.PortfolioWorkItemType}'`);
                parts.push(`(${wiIdClauses.join(" or ")})`);

                return `(${parts.join(" and ")})`;
            });

        return projectFilters.join(" or ");
    }

    /**
     * Descendants(
        $apply=
            filter(WorkItemType eq 'User Story' or WorkItemType eq 'Task')
            /aggregate(
                $count as TotalCount,
                iif(StateCategory eq 'Completed',1,0) with sum as CompletedCount,
                StoryPoints with sum as TotalStoryPoints,
                iif(StateCategory eq 'Completed',StoryPoints,0) with sum as CompletedStoryPoints
            )
            /compute(
                (CompletedCount div cast(TotalCount, Edm.Decimal)) as CountProgress,
                (CompletedStoryPoints div TotalStoryPoints) as StoryPointsProgress
            )
        )
     * @param input 
     */
    private static BuildODataDescendantsQuery(input: PortfolioPlanningQueryInput) : string {
        const requirementWiTypes = input.RequirementWorkItemTypes.map((id) => `WorkItemType eq '${id}'`);

        return "Descendants(" + 
                    "$apply=" +
                        `filter(${requirementWiTypes.join(" or ")})` + 
                        "/aggregate(" +
                            "$count as TotalCount," +
                            "iif(StateCategory eq 'Completed',1,0) with sum as CompletedCount," +
                            "StoryPoints with sum as TotalStoryPoints," +
                            "iif(StateCategory eq 'Completed',StoryPoints,0) with sum as CompletedStoryPoints" +
                        ")" +
                        "/compute(" +
                            "(CompletedCount div cast(TotalCount, Edm.Decimal)) as CountProgress," +
                            "(CompletedStoryPoints div TotalStoryPoints) as StoryPointsProgress" +
                        ")" +
                    ")";
    }
}