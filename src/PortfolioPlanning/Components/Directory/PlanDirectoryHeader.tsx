import * as React from "react";
import {
    TitleSize,
    CustomHeader,
    HeaderTitleArea,
    HeaderTitle,
    HeaderTitleRow
} from "azure-devops-ui/Header";
import { HeaderCommandBar } from "azure-devops-ui/HeaderCommandBar";
import "./PlanDirectoryHeader.scss";

export interface PlanDirectoryProps {
    onNewPlanClick: () => void;
}

export default class PlanDirectoryHeader extends React.Component<
    PlanDirectoryProps
> {
    constructor(props) {
        super(props);
    }

    public render() {
        return (
            <CustomHeader className="bolt-header-with-commandbar">
                <HeaderTitleArea>
                    <HeaderTitleRow>
                        <HeaderTitle titleSize={TitleSize.Large}>
                            Plans
                        </HeaderTitle>
                    </HeaderTitleRow>
                </HeaderTitleArea>
                <HeaderCommandBar
                    items={[
                        {
                            id: "new-plan",
                            text: "New plan",
                            onActivate: this.props.onNewPlanClick
                        }
                    ]}
                />
            </CustomHeader>
        );
    }
}
