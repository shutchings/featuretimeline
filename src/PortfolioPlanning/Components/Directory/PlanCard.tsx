import * as React from "react";
import { Card } from "azure-devops-ui/Card";
import { Pill, PillVariant } from "azure-devops-ui/Pill";
import { PillGroup } from "azure-devops-ui/PillGroup";
import { IColor } from "azure-devops-ui/Utilities/Color";

import "./PlanCard.scss";

export interface PlanCardProps {
    title: string;
    description: string;
    teams: string[];
    projects: string[];
    tags: string[];
}

export default class PlanCard extends React.Component<PlanCardProps> {
    public render() {
        const teamsLabel = this.props.teams.length > 1 ? "Teams" : "Team";
        const projectsLabel =
            this.props.teams.length > 1 ? "Projects" : "Project";

        return (
            <Card className="plan-card">
                <div className="flex-column">
                    <div className="title-s title">{this.props.title}</div>
                    <div className="body-m description">
                        {this.props.description}
                    </div>
                    <div className="title-xs">{teamsLabel}</div>
                    <div className="teams">{this.props.teams.join(" | ")}</div>
                    <div className="title-xs">{projectsLabel}</div>
                    <div className="projects">
                        {this.props.projects.join(" | ")}
                    </div>
                    <PillGroup className="flex-row">
                        {this.props.tags.map(tag => (
                            <Pill
                                variant={PillVariant.colored}
                                color={this.darkColor}
                            >
                                {tag}
                            </Pill>
                        ))}
                    </PillGroup>
                </div>
            </Card>
        );
    }

    private darkColor: IColor = {
        red: 151,
        green: 30,
        blue: 79
    };
}
