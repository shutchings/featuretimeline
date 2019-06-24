import * as React from "react";
import "./PlanDirectoryPage.scss";
import { Page } from "azure-devops-ui/Page";
import PlanDirectoryHeader from "./PlanDirectoryHeader";
import PlanCard from "./PlanCard";

export interface PlanDirectoryPageProps {}

export default class PlanDirectoryPage extends React.Component<
    PlanDirectoryPageProps
> {
    constructor(props) {
        super(props);
    }

    public render() {
        return (
            <Page className="plan-page">
                <PlanDirectoryHeader />
                <div className="page-content plan-directory-page-content">
                    <PlanCard
                        title={"Q1 Planning"}
                        description={
                            "Features we plan to deliver Q1 of this year"
                        }
                        teams={["Contoso"]}
                        projects={["Fabrikam"]}
                        tags={["Marketing", "Engineering"]}
                        owner={"Mona Kane"}
                    />
                    <PlanCard
                        title={"Q2 Roadmap"}
                        description={
                            "Roadmap of features our organization plans to deliver in Q2"
                        }
                        teams={["Contoso", "Adatum"]}
                        projects={["Fabrikam"]}
                        tags={["Some tag"]}
                        owner={"Colin Ballinger"}
                    />
                    <PlanCard
                        title={"Contoso Team's OKRs"}
                        description={"Contoso OKRs"}
                        teams={["Contoso"]}
                        projects={["Fabrikam"]}
                        tags={["Some tag", "Engineering"]}
                        owner={"Ashely McCarthy"}
                    />
                </div>
            </Page>
        );
    }
}
