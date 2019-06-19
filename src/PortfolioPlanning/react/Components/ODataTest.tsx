import * as React from 'react';
import { ODataClient } from '../../../Common/OData/ODataClient';

export interface ODataTestState
{
    results: ODataWorkItemQueryResult[];
    input: string;
}

export interface ODataQueryProjectInput
{
    projectName: string;
    workItemIds: number[];
}

export interface ODataWorkItemQueryResult
{
    WorkItemId: number;
    ProjectName: string;
    WorkItemType: string;
    Title: string;
    State: string;
    CompletedCount: number;
    TotalCount: number;
    CompletedStoryPoints: number;
    TotalStoryPoints: number;
}

export class ODataTest extends React.Component<{}, ODataTestState> {

    constructor(props) {
        super(props);

        const initialTestData:ODataQueryProjectInput[] = [
            {projectName: "p", workItemIds: [5249]}
        ];

        this.state = { 
            results: null, 
            input: JSON.stringify(initialTestData, null, '    ')
        };

        this.RunQuery(this.state.input).then((blah) => {
            this.setState({
                results: blah
            })
        });

        this.HandleSubmit = this.HandleSubmit.bind(this);
        this.HandleInputChange = this.HandleInputChange.bind(this);
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
                <div>
                {
                    this.state.results.map(
                        (wi) => (
                            <div>{wi.WorkItemId} - {wi.Title}</div>
                        )) 
                } 
                </div>
            </div>
        );
    }

    public HandleSubmit(event){
        alert(this.state.input);
    }

    public HandleInputChange(event)
    {
        this.setState({
            input: event.target.value
        });
    }

    public RunQuery(inputString: string): IPromise<ODataWorkItemQueryResult[]> {

        const input: ODataQueryProjectInput[] = JSON.parse(inputString);
        const odataQueryString = this.BuildODataQueryString(input);

        return ODataClient.getInstance().then((client) => {
            const fullQueryUrl = client.generateProjectLink(undefined, odataQueryString);
            return client.runGetQuery(fullQueryUrl).then((results: any) => {
                return this.ParseODataResponse(results);
            }, (error) => console.log(error));
        });
    }

    private ParseODataResponse(results : any) : ODataWorkItemQueryResult[] {
        if(!results || !results["value"]) {
            return null;
        }

        return results.value;
    }

    private BuildODataQueryString(input: ODataQueryProjectInput[]) : string {
        return "WorkItems?$select=WorkItemId,WorkItemType,Title,State&$filter=WorkItemType eq 'Epic' and WorkItemId eq 5249";
    }
}

