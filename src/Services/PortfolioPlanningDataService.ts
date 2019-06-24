import
{
    PortfolioPlanningQueryInput,
    PortfolioPlanningQueryResult, 
    PortfolioPlanningQueryResultItem,
    PortfolioPlanningProjectQueryInput,
    PortfolioPlanningProjectQueryResult,
    IQueryResultError,
    Project,
    WorkItem,
    PortfolioPlanningWorkItemQueryResult,
    PortfolioPlanningDirectory,
    PortfolioPlanning,
    ExtensionStorageError
} from "../PortfolioPlanning/Models/PortfolioPlanningQueryModels";
import { ODataClient } from "../Common/OData/ODataClient";
import { ODataWorkItemQueryResult } from "../PortfolioPlanning/Models/ODataQueryModels";
import { GUIDUtil } from "../Common/GUIDUtil";

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

    public async getAllProjects() : Promise<PortfolioPlanningProjectQueryResult> {

        const odataQueryString = ODataQueryBuilder.AllProjectsQueryString();

        const client = await ODataClient.getInstance();
        const fullQueryUrl = client.generateProjectLink(undefined, odataQueryString);

        return client.runGetQuery(fullQueryUrl).then(
            (results: any) => this.ParseODataProjectQueryResultResponse(results),
            (error) => this.ParseODataErrorResponse(error));
    }

    public async getAllWorkItemsOfTypeInProject(
        projectGuid : string,
        workItemType: string
    ) : Promise<PortfolioPlanningWorkItemQueryResult> {

        const odataQueryString = ODataQueryBuilder.WorkItemsOfTypeQueryString(workItemType);

        const client = await ODataClient.getInstance();
        const fullQueryUrl = client.generateProjectLink(projectGuid, odataQueryString);

        return client.runGetQuery(fullQueryUrl).then(
            (results: any) => this.ParseODataWorkItemQueryResultResponse(results),
            (error) => this.ParseODataErrorResponse(error));
    }

    public async GetAllPortfolioPlans() : Promise<PortfolioPlanningDirectory>
    {
        const client = await this.GetStorageClient();

        return client.getDocument(
            PortfolioPlanningDataService.DirectoryCollectionName,
            PortfolioPlanningDataService.DirectoryDocumentId).then(
                (doc) => this.ParsePortfolioDirectory(doc),
                (error) => {
                    const parsedError = this.ParseStorageError(error);

                    if(parsedError.status === 404)
                    {
                        //  Collection has not been created, initialize it.
                        const newDirectory: PortfolioPlanningDirectory = {
                            exceptionMessage: null,
                            id: PortfolioPlanningDataService.DirectoryDocumentId,
                            entries: []
                        };

                        return client.createDocument(
                            PortfolioPlanningDataService.DirectoryCollectionName,
                            newDirectory).then(
                                (newDirectory) => newDirectory,
                                //  We failed while creating the collection for the first time.
                                (error) => this.ParseStorageError(error)
                            );
                    }

                    return parsedError;
                }
        );
    }

    private static readonly DirectoryDocumentId:string = "Default";
    private static readonly DirectoryCollectionName:string = "Directory";
    private static readonly PortfolioPlansCollectionName:string = "PortfolioPlans";

    public async AddPortfolioPlan(newPlanName: string) : Promise<PortfolioPlanning> 
    {
        const client = await this.GetStorageClient();
        const newPlan : PortfolioPlanning = {
            id: GUIDUtil.newGuid(),
            name: newPlanName,
            createdOn: new Date(),
            projects: []
        };

        const savedPlan = await client.setDocument(PortfolioPlanningDataService.PortfolioPlansCollectionName, newPlan);
        let allPlans = await this.GetAllPortfolioPlans();

        if(!allPlans)
        {
            allPlans = {
                exceptionMessage: null,
                id: PortfolioPlanningDataService.DirectoryDocumentId,
                entries: []
            };
        }

        allPlans.entries.push(savedPlan);

        await client.updateDocument(PortfolioPlanningDataService.DirectoryCollectionName, allPlans);

        return newPlan;
    }

    public async GetPortfolioPlanById(portfolioPlanId: string) : Promise<PortfolioPlanning> {
        const client = await this.GetStorageClient();

        return client.getDocument(PortfolioPlanningDataService.PortfolioPlansCollectionName, portfolioPlanId);
    }

    public async UpdatePortfolioPlan(newPlan: PortfolioPlanning) : Promise<PortfolioPlanning> {
        const client = await this.GetStorageClient();

        return client.updateDocument(PortfolioPlanningDataService.PortfolioPlansCollectionName, newPlan).then(
            (doc) => doc
        );
    }

    public async DeletePortfolioPlan(newPlan: PortfolioPlanning) : Promise<void> {
        const client = await this.GetStorageClient();

        return client.deleteDocument(PortfolioPlanningDataService.PortfolioPlansCollectionName, newPlan.id);
    }

    public async DeleteAllData() : Promise<number> {
        const client = await this.GetStorageClient();
        let totalThatWillBeDeleted = 0;

        //  Delete documents in Directory collection.
        const allEntriesInDirectory = await client.getDocuments(PortfolioPlanningDataService.DirectoryCollectionName);
        totalThatWillBeDeleted += allEntriesInDirectory.length;

        allEntriesInDirectory.forEach((doc) => {
            client.deleteDocument(
                PortfolioPlanningDataService.DirectoryCollectionName, 
                doc.id).then(
                    (deletedDoc) => console.log(`Deleted Directory collection document: ${doc.id}`)
                );
        });

        //  Delete documents in Portfolio plans collection.
        const allEntriesInPlans = await client.getDocuments(PortfolioPlanningDataService.PortfolioPlansCollectionName);
        totalThatWillBeDeleted += allEntriesInPlans.length;

        allEntriesInPlans.forEach((doc) => {
            client.deleteDocument(
                PortfolioPlanningDataService.PortfolioPlansCollectionName, 
                doc.id).then(
                    (deletedDoc) => console.log(`Deleted Plans collection document: ${doc.id}`)
               );
        });

        return totalThatWillBeDeleted;
    }    

    private async GetStorageClient() : Promise<IExtensionDataService> {
        return VSS.getService<IExtensionDataService>(VSS.ServiceIds.ExtensionData);
    }

    private ParsePortfolioDirectory(doc : any) : PortfolioPlanningDirectory {
        if(!doc) {
            return {
                exceptionMessage: null,
                id: null,
                entries: null
            };
        }

        const directory : PortfolioPlanningDirectory = doc;
        return directory;
    }

    private ParseStorageError(error: any) : IQueryResultError {
        if(!error)
        {
            return {
                exceptionMessage: "no error information"
            };
        }

        const parsedError: ExtensionStorageError = error;

        return {
            exceptionMessage: parsedError.message,
            status: parsedError.status
        };
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

    private ParseODataWorkItemQueryResultResponse(results : any) : PortfolioPlanningWorkItemQueryResult {
        if(!results || !results["value"]) {
            return null;
        }

        const rawResult : WorkItem[] = results.value;

        return {
            exceptionMessage: null,
            workItems: rawResult
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

    private static readonly ProjectEntitySelect: string = "ProjectSK,ProjectName";

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
            `$select=${ODataQueryBuilder.ProjectEntitySelect}` +
        "&" +
            `$filter=${this.ProjectsQueryFilter(input)}`;
    }

    public static AllProjectsQueryString() : string {
        return "Projects" +
        "?" + 
            `$select=${ODataQueryBuilder.ProjectEntitySelect}`;
    }

    public static WorkItemsOfTypeQueryString(workItemType: string) : string {
        return "WorkItems" +
        "?" +
            "$select=WorkItemId,WorkItemType,Title,State" +
        "&" +
            `$filter=WorkItemType eq '${workItemType}'`;
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