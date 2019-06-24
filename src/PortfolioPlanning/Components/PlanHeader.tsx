import * as React from "react";
import { Header, TitleSize } from "azure-devops-ui/Header";

export interface PlanHeaderProps {
    title: string;
}

export default class PlanHeader extends React.Component<PlanHeaderProps> {
    public render() {
        return (
            <Header
                title={this.props.title}
                titleSize={TitleSize.Medium}
                backButtonProps={{
                    onClick: () => alert("Back button Clicked!!")
                }}
            />
        );
    }
}
