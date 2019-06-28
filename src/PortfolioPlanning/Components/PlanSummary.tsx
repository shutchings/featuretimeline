import * as React from "react";
import "./PlanSummary.scss";
import { ITeam } from "../Contracts";
import { IdentityRef } from "VSS/WebApi/Contracts";
import { IdentityView } from "../Common/Components/IdentityView";

export interface IPlanSummaryProps {
    owner: IdentityRef;
    projects: string[];
    teams: { [teamId: string]: ITeam };
}

export const PlanSummary = (props: IPlanSummaryProps) => {
    const projects = props.projects.join(", ");
    const teams = Object.keys(props.teams)
        .map(teamId => props.teams[teamId].teamName)
        .join(", ");

    return (
        <div className="plan-summary">
            <IdentityView className="owner" value={props.owner} />
            {projects && (
                <div className="summary-item">
                    <div className="projects-teams-label">Teams</div>
                    <div className="projects-teams-content">{teams}</div>
                </div>
            )}
            {teams && (
                <div className="summary-item">
                    <div className="projects-teams-label">Projects</div>
                    <div className="projects-teams-content">{projects}</div>
                </div>
            )}
        </div>
    );
};
