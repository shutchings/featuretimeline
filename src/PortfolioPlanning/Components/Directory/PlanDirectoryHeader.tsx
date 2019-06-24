import * as React from "react";
import {
    TitleSize,
    CustomHeader,
    HeaderTitleArea,
    HeaderTitle,
    HeaderTitleRow
} from "azure-devops-ui/Header";
import {
    HeaderCommandBar,
    IHeaderCommandBarItem
} from "azure-devops-ui/HeaderCommandBar";

export interface PlanDirectoryProps {}

export default class PlanDirectoryHeader extends React.Component<
    PlanDirectoryProps
> {
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
                <HeaderCommandBar items={this._getHeaderCommandBarItems()} />
            </CustomHeader>
        );
    }

    private _getHeaderCommandBarItems = (): IHeaderCommandBarItem[] => {
        return [
            {
                id: "new-plan",
                text: "New plan",
                onActivate: () => {
                    alert("Adding a new plan");
                }
            }
        ];
    };
}
