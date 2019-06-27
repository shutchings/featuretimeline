import * as React from "react";
import { ITeam } from "../Contracts";

export interface IPlanSummaryProps {
    projects: string[];
    teams: { [teamId: string]: ITeam };
}

export const PlanSummary = (props: IPlanSummaryProps) => {
    const projects = props.projects.join(", ");
    const teams = Object.keys(props.teams)
        .map(teamId => props.teams[teamId].teamName)
        .join(", ");

    return (
        <div style={{ display: "flex" }} className="page-content">
            <div>
                <div>Projects</div>
                <div>{projects}</div>
            </div>
            <div>
                <div>Teams</div>
                <div>{teams}</div>
            </div>
        </div>
    );
};
