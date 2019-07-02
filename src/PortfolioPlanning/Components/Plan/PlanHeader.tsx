import * as React from "react";
import { TitleSize, Header } from "azure-devops-ui/Header";

export interface PlanHeaderProps {
    id: string;
    name: string;
    description: string;
    backButtonClicked: () => void;
    deleteButtonClicked: (id: string) => void;
}

export default class PlanHeader extends React.Component<PlanHeaderProps> {
    public render() {
        return (
            <>
                <Header
                    title={this.props.name}
                    titleSize={TitleSize.Large}
                    description={this.props.description}
                    backButtonProps={{ onClick: this.props.backButtonClicked }}
                    commandBarItems={[
                        {
                            iconProps: {
                                iconName: "Delete"
                            },
                            id: "delete-plan",
                            important: false,
                            onActivate: () => {
                                this.props.deleteButtonClicked(this.props.id);
                            },
                            text: "Delete plan"
                        }
                    ]}
                />
            </>
        );
    }
}
