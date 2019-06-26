import * as React from "react";
import { TitleSize, Header } from "azure-devops-ui/Header";
import { IHeaderCommandBarItem } from "azure-devops-ui/HeaderCommandBar";

export interface PlanHeaderProps {
    id: string;
    title: string;
    description: string;
    backButtonClicked: () => void;
}

const commandBarItemsSimple: IHeaderCommandBarItem[] = [
    {
        iconProps: {
            iconName: "Add"
        },
        id: "testCreate",
        important: true,
        onActivate: () => {
            alert("This would normally trigger a modal popup");
        },
        text: "Action",
        tooltipProps: {
            text: "Custom tooltip for create"
        }
    },
    {
        iconProps: {
            iconName: "Delete"
        },
        id: "testDelete",
        important: false,
        onActivate: () => {
            alert("submenu clicked");
        },
        text: "Menu row with delete icon"
    },
    {
        iconProps: {
            iconName: "Share"
        },
        id: "testShare",
        important: false,
        onActivate: () => {
            alert("submenu clicked");
        },
        text: "Menu row with share icon"
    }
];

export default class PlanHeader extends React.Component<PlanHeaderProps> {
    public render() {
        return (
            <Header
                title={this.props.title}
                titleSize={TitleSize.Large}
                description={this.props.description}
                backButtonProps={{ onClick: this.props.backButtonClicked }}
                commandBarItems={commandBarItemsSimple}
            />
        );
    }
}
