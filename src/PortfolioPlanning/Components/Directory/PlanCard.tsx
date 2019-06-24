import * as React from "react";
import { Card } from "azure-devops-ui/Card";
import "./PlanCard.scss";

export interface PlanCardProps {
    title: string;
    description: string;
    teams: string[];
    projects: string[];
    tags: string[];
    owner: string;
}

export default class PlanCard extends React.Component<PlanCardProps> {
    public render() {
        return <Card />;
    }
}
