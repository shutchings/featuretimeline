import * as React from "react";
import { Card } from "azure-devops-ui/Card";

import "./PlanCard.scss";

export interface PlanCardProps {
    id: string;
    name: string;
    description: string;
    onClick: (id: string) => void;
}

export default class PlanCard extends React.Component<PlanCardProps> {
    public render() {
        return (
            <div className="plan-card-container" onClick={() => this.props.onClick(this.props.id)}>
                <Card className="plan-card">
                    <div className="flex-column">
                        <div className="name">{this.props.name}</div>
                        <div className="description">{this.props.description}</div>
                        <div className="teams-container">
                            <div className="teams-label">Teams</div>
                            <div>Fabrikam, Contoso, WIT X</div>
                        </div>
                        <div className="projects-container">
                            <div className="projects-label">Projects</div>
                            <div>Fabrikam, AzureDevOps</div>
                        </div>
                    </div>
                </Card>
            </div>
        );
    }
}
