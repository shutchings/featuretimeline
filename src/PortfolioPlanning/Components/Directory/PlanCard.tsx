import * as React from "react";
import "./PlanCard.scss";
import { Card } from "azure-devops-ui/Card";
import { IdentityView } from "../../Common/Components/IdentityView";
import { IdentityRef } from "VSS/WebApi/Contracts";

export interface IPlanCardProps {
    planId: string;
    name: string;
    description: string;
    projects: string[];
    teams: string[];
    owner: IdentityRef;
    onClick: (id: string) => void;
}

export const PlanCard = (props: IPlanCardProps) => {
    return (
        <div className="plan-card-container" onClick={() => props.onClick(props.planId)}>
            <Card className="plan-card">
                <div className="plan-card-details">
                    <div className="flex-column summary">
                        <div className="name">{props.name}</div>
                        <div className="description">{props.description}</div>
                        {props.projects &&
                            props.projects.length > 0 && (
                                <div className="projects-container">
                                    <div className="projects-label">Projects</div>
                                    <div className="projects-list">{props.projects.join(", ")}</div>
                                </div>
                            )}
                        {props.teams &&
                            props.teams.length > 0 && (
                                <div className="teams-container">
                                    <div className="teams-label">Teams</div>
                                    <div className="teams-list">{props.teams.join(", ")}</div>
                                </div>
                            )}
                    </div>
                    <IdentityView className="owner-container" value={props.owner} />
                </div>
            </Card>
        </div>
    );
};
