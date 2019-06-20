import
{
    PortfolioPlanningQueryInput,
    PortfolioPlanningQueryResult, 
    PortfolioPlanningQueryResultItem
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

    public async runQuery(queryInput: PortfolioPlanningQueryInput) : Promise<PortfolioPlanningQueryResult> {
        const odataQueryString = ODataQueryBuilder.BuildODataQueryString(queryInput);

        const client = await ODataClient.getInstance();
        const fullQueryUrl = client.generateProjectLink(undefined, odataQueryString);

        return client.runGetQuery(fullQueryUrl).then(
            (results: any) => this.ParseODataResponse(results),
            (error) => this.ParseODataErrorResponse(error));
    }

    private ParseODataResponse(results : any) : PortfolioPlanningQueryResult {
        if(!results || !results["value"]) {
            return null;
        }

        const rawResult : ODataWorkItemQueryResult[] = results.value;

        return {
            exceptionMessage: null,
            items: this.PortfolioPlanningQueryResultItems(rawResult)
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

    private ParseODataErrorResponse(results : any) : PortfolioPlanningQueryResult {
        return {
            exceptionMessage: results.responseJSON.error.message,
            items: null
        };
    }
}

export class ODataQueryBuilder {
    public static BuildODataQueryString(input: PortfolioPlanningQueryInput) : string {
        return "WorkItems" +
        "?" +
            "$select=WorkItemId,WorkItemType,ProjectSK" +
        "&" +
            `$filter=${this.BuildODataQueryFilter(input)}` +
        "&" +
            `$expand=${this.BuildODataDescendantsQuery(input)}`;
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