import * as React from "react";
import {
    TitleSize,
    CustomHeader,
    HeaderTitleArea,
    HeaderTitle,
    HeaderTitleRow,
    HeaderDescription
} from "azure-devops-ui/Header";

import { Button } from "azure-devops-ui/Button";

export interface PlanHeaderProps {
    title: string;
    description: string;
    backButtonClicked: () => void;
}

export default class PlanHeader extends React.Component<PlanHeaderProps> {
    public render() {
        return (
            <CustomHeader className="bolt-header-with-back-button">
                <Button
                    className="bolt-header-back-button"
                    iconProps={{ iconName: "Back" }}
                    subtle={true}
                    onClick={this.props.backButtonClicked}
                />
                <HeaderTitleArea>
                    <HeaderTitleRow>
                        <HeaderTitle titleSize={TitleSize.Large}>
                            {this.props.title}
                        </HeaderTitle>
                    </HeaderTitleRow>
                    <HeaderDescription>
                        {this.props.description}
                    </HeaderDescription>
                </HeaderTitleArea>
            </CustomHeader>
        );
    }
}
