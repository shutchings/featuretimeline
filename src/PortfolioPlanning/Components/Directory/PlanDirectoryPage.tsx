import * as React from "react";
import "./PlanDirectoryPage.scss";
import { Page } from "azure-devops-ui/Page";
import PlanDirectoryHeader from "./PlanDirectoryHeader";

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
                    stuff
                </div>
            </Page>
        );
    }
}
