import * as React from "react";
import { Card } from "azure-devops-ui/Card";

import "./PlanCard.scss";

export interface PlanCardProps {
    title: string;
    description: string;
}

export default class PlanCard extends React.Component<PlanCardProps> {
    public render() {
        return (
            <Card className="plan-card">
                <div className="flex-column">
                    <div className="title-s title">{this.props.title}</div>
                    <div className="body-m description">
                        {this.props.description}
                    </div>
                </div>
            </Card>
        );
    }
}
