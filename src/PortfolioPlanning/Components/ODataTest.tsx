import * as React from 'react';
import * as PortfolioModels from '../Models/PortfolioPlanningQueryModels';
import { PortfolioPlanningDataService } from '../../Services/PortfolioPlanningDataService';

export interface ODataTestState
{
    results: PortfolioModels.PortfolioPlanningQueryResult;
    allProjects: string;
    workItemsOfTypeInProject: string;
    input: string;
}

export class ODataTest extends React.Component<{}, ODataTestState> {

    constructor(props) {
        super(props);

        const initialTestData:PortfolioModels.PortfolioPlanningQueryInput = {
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
            input: JSON.stringify(initialTestData, null, '    '),
            workItemsOfTypeInProject: null,
            allProjects: null
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
                <label>
                    All projects
                    <textarea style={inputStyle} value={this.state.allProjects}/>
                </label>
                <label>
                    Work Items of Type in Project
                    <textarea style={inputStyle} value={this.state.workItemsOfTypeInProject}/>
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

        this.GetAllProjects().then(
            (allProjects) => {
                const stringValue = JSON.stringify(allProjects, null, '    ');
                this.setState({allProjects: stringValue})
            },
            (error) => this.setState({results: error})
        );

        this.GetWorkItemsOfTypeInProject().then(
            (workItems) => {
                const stringValue = JSON.stringify(workItems, null, '    ');
                this.setState({workItemsOfTypeInProject: stringValue})
            },
            (error) => this.setState({results: error})
        );
    }

    public HandleInputChange(event)
    {
        this.setState({
            input: event.target.value
        });
    }

    public RunQuery(inputString: string): IPromise<PortfolioModels.PortfolioPlanningQueryResult> {
        const input: PortfolioModels.PortfolioPlanningQueryInput = JSON.parse(inputString);
        return PortfolioPlanningDataService.getInstance().runPortfolioItemsQuery(input);
    }

    public GetAllProjects(): IPromise<PortfolioModels.PortfolioPlanningProjectQueryResult> {
        return PortfolioPlanningDataService.getInstance().getAllProjects();
    }

    public GetWorkItemsOfTypeInProject(): IPromise<PortfolioModels.PortfolioPlanningWorkItemQueryResult> {
        return PortfolioPlanningDataService.getInstance().getAllWorkItemsOfTypeInProject(
            "fbed1309-56db-44db-9006-24ad73eee785",
            "Epic");
    }

}

