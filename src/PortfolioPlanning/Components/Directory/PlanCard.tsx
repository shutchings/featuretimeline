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
            <div
                className="plan-card-container"
                onClick={() => this.props.onClick(this.props.id)}
            >
                <Card className="plan-card">
                    <div className="flex-column">
                        <div className="title-s name">{this.props.name}</div>
                        <div className="body-m description">
                            {this.props.description}
                        </div>
                    </div>
                </Card>
            </div>
        );
    }
}
