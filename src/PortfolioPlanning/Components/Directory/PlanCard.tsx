import * as React from "react";
import { Card } from "azure-devops-ui/Card";

import "./PlanCard.scss";

export interface IPlanCardProps {
    id: string;
    name: string;
    description: string;
    projects: string[];
    teams: string[];
    onClick: (id: string) => void;
}

export const PlanCard = (props: IPlanCardProps) => {
    return (
        <div className="plan-card-container" onClick={() => props.onClick(props.id)}>
            <Card className="plan-card">
                <div className="flex-column">
                    <div className="name">{props.name}</div>
                    <div className="description">{props.description}</div>
                    {props.projects &&
                        props.projects.length > 0 && (
                            <div className="projects-container">
                                <div className="projects-label">Projects</div>
                                <div>{props.projects.join(", ")}</div>
                            </div>
                        )}
                    {props.teams &&
                        props.teams.length > 0 && (
                            <div className="teams-container">
                                <div className="teams-label">Teams</div>
                                <div>{props.teams.join(", ")}</div>
                            </div>
                        )}
                </div>
            </Card>
        </div>
    );
};
