import * as React from "react";
import {
    TitleSize,
    Header
} from "azure-devops-ui/Header";
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
            <Header
                title="Plans"
                titleSize={TitleSize.Large}
                commandBarItems={[
                        {
                            id: "new-plan",
                            text: "New plan",
                            onActivate: this.props.onNewPlanClick
                        }
                    ]}
            />
        );
    }
}
