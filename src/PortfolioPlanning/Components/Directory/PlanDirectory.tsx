import * as React from "react";
import "./PlanDirectory.scss";
import { Page } from "azure-devops-ui/Page";
import PlanDirectoryHeader from "./PlanDirectoryHeader";
import PlanCard from "./PlanCard";
import NewPlanDialog from "./NewPlanDialog";
import { PlanDirectoryActions } from "../../Redux/Actions/PlanDirectoryActions";
import { connect } from "react-redux";
import { IPortfolioPlanningState } from "../../Redux/Contracts";

export interface IPlanDirectoryProps {}

interface IPlanDirectoryMappedProps {
    newPlanDialogVisible: boolean;
}

export class PlanDirectory extends React.Component<
    IPlanDirectoryProps & IPlanDirectoryMappedProps & typeof Actions
> {
    constructor(props) {
        super(props);
    }

    public render() {
        return (
            <Page className="plan-page">
                <PlanDirectoryHeader
                    onNewPlanClick={() => {
                        this.props.toggleNewPlanDialogVisible(true);
                    }}
                />
                <div className="page-content plan-directory-page-content">
                    <PlanCard
                        title={"Q1 Planning"}
                        description={
                            "Features we plan to deliver Q1 of this year"
                        }
                        teams={["Contoso"]}
                        projects={["Fabrikam"]}
                        tags={["Marketing", "Engineering"]}
                    />
                    <PlanCard
                        title={"Q2 Roadmap"}
                        description={
                            "Roadmap of features our organization plans to deliver in Q2"
                        }
                        teams={["Contoso", "Adatum"]}
                        projects={["Fabrikam"]}
                        tags={["Some tag"]}
                    />
                    <PlanCard
                        title={"Contoso Team's OKRs"}
                        description={"Contoso OKRs"}
                        teams={["Contoso"]}
                        projects={["Fabrikam"]}
                        tags={["Some tag", "Engineering"]}
                    />
                    <PlanCard
                        title={"Contoso Team's OKRs"}
                        description={"Contoso OKRs"}
                        teams={["Contoso"]}
                        projects={["Fabrikam"]}
                        tags={["Some tag", "Engineering"]}
                    />
                    <PlanCard
                        title={"Contoso Team's OKRs"}
                        description={"Contoso OKRs"}
                        teams={["Contoso"]}
                        projects={["Fabrikam"]}
                        tags={["Some tag", "Engineering"]}
                    />
                </div>
                {this.props.newPlanDialogVisible && (
                    <NewPlanDialog
                        onDismiss={() =>
                            this.props.toggleNewPlanDialogVisible(false)
                        }
                        onCreate={(name: string, description: string) => {
                            alert(`Created with ${name} : ${description}`);
                            this.props.toggleNewPlanDialogVisible(false);
                        }}
                    />
                )}
            </Page>
        );
    }
}

function mapStateToProps(
    state: IPortfolioPlanningState
): IPlanDirectoryMappedProps {
    return {
        newPlanDialogVisible: state.planDirectoryState.newPlanDialogVisible
    };
}

const Actions = {
    onCreatePlan: PlanDirectoryActions.createPlan,
    toggleNewPlanDialogVisible: PlanDirectoryActions.toggleNewPlanDialogVisible
};

export const ConnectedPlanDirectory = connect(
    mapStateToProps,
    Actions
)(PlanDirectory);
