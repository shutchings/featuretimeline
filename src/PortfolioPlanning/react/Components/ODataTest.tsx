import * as React from 'react';
import { ODataClient } from '../../../Common/OData/ODataClient';

export interface ODataTestState
{
    results: PortfolioPlanningQueryResult;
    input: string;
}

export interface ODataQueryProjectInput
{
    projectId: string;
    workItemIds: number[];
}

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

export class ODataTest extends React.Component<{}, ODataTestState> {

    constructor(props) {
        super(props);

        const initialTestData:PortfolioPlanningQueryInput = {
            PortfolioWorkItemType: "Epic",
            RequirementWorkItemTypes: ["User Story"],
            WorkItems: [
                {
                    projectId: "FBED1309-56DB-44DB-9006-24AD73EEE785",
                    workItemIds: [5250, 5251]
                },
                {
                    projectId: "6974D8FE-08C8-4123-AD1D-FB830A098DFB",
                    workItemIds: [5249]
                }
            ]
        };

        this.state = { 
            results: null, 
            input: JSON.stringify(initialTestData, null, '    ')
        };

        this.HandleSubmit = this.HandleSubmit.bind(this);
        this.HandleInputChange = this.HandleInputChange.bind(this);

        //  Run initial query.
        this.HandleSubmit(null);
    }

    public render() {
        const inputStyle ={
            width: '100%',
            height: '150px'
        };
        const input  = (
            <form onSubmit={this.HandleSubmit}>
                <label>
                    OData Query Input (json):
                    <textarea style={inputStyle} value={this.state.input} onChange={this.HandleInputChange}/>
                </label>
                <input type="submit" value="Submit" />
            </form>
        );

        if(!this.state || !this.state.results)
        {
            return input;
        }

        return (
            <div>
                {input}
                <textarea style={inputStyle} value={JSON.stringify(this.state.results, null, '    ')} />
            </div>
        );
    }

    public HandleSubmit(event){
        this.RunQuery(this.state.input).then(
            (results) => this.setState({results}),
            (error) => this.setState({results: error})
        );
    }

    public HandleInputChange(event)
    {
        this.setState({
            input: event.target.value
        });
    }

    public RunQuery(inputString: string): IPromise<PortfolioPlanningQueryResult> {
        const input: PortfolioPlanningQueryInput = JSON.parse(inputString);
        return this.RunQueryInternal(input);
    }

    private RunQueryInternal(input: PortfolioPlanningQueryInput): IPromise<PortfolioPlanningQueryResult>
    {
        const odataQueryString = this.BuildODataQueryString(input);

        return ODataClient.getInstance().then((client) => {
            const fullQueryUrl = client.generateProjectLink(undefined, odataQueryString);
            return client.runGetQuery(fullQueryUrl).then(
                (results: any) => this.ParseODataResponse(results),
                (error) => this.ParseODataErrorResponse(error));
        });
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

    private BuildODataQueryString(input: PortfolioPlanningQueryInput) : string {
        return `WorkItems?$select=WorkItemId,WorkItemType,ProjectSK&$filter=${this.BuildODataQueryFilter(input)}&$expand=${this.BuildODataDescendantsQuery(input)}`;
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
    private BuildODataQueryFilter(input: PortfolioPlanningQueryInput) : string {
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
    private BuildODataDescendantsQuery(input: PortfolioPlanningQueryInput) : string {
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

