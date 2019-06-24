import * as React from "react";
import "./PlanDirectoryPage.scss";
import { Page } from "azure-devops-ui/Page";
import PlanDirectoryHeader from "./PlanDirectoryHeader";
import PlanCard from "./PlanCard";
import NewPlanDialog from "./NewPlanDialog";

export interface PlanDirectoryPageProps {}

interface PlanDirectoryPageState {
    createNewPlanDialogOpen: boolean;
}

export default class PlanDirectoryPage extends React.Component<
    PlanDirectoryPageProps,
    PlanDirectoryPageState
> {
    constructor(props) {
        super(props);

        this.state = { createNewPlanDialogOpen: false };
    }

    public render() {
        return (
            <Page className="plan-page">
                <PlanDirectoryHeader
                    onNewPlanClick={() => {
                        this.setState({
                            createNewPlanDialogOpen: true
                        });
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
                {this.state.createNewPlanDialogOpen && (
                    <NewPlanDialog
                        onDismiss={() =>
                            this.setState({ createNewPlanDialogOpen: false })
                        }
                        onCreate={(name: string, description: string) => {
                            alert(`Created with ${name} : ${description}`);
                            this.setState({ createNewPlanDialogOpen: false });
                        }}
                    />
                )}
            </Page>
        );
    }
}
