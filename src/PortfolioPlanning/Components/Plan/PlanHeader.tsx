import * as React from "react";
import { TitleSize, Header } from "azure-devops-ui/Header";

export interface PlanHeaderProps {
    id: string;
    name: string;
    description: string;
    itemIsSelected: boolean;
    onBackButtonClicked: () => void;
    onAddItemClicked: () => void;
    onRemoveSelectedItemClicked: () => void;
    onDeleteButtonClicked: (id: string) => void;
}

export default class PlanHeader extends React.Component<PlanHeaderProps> {
    public render() {
        return (
            <>
                <Header
                    title={this.props.name}
                    titleSize={TitleSize.Large}
                    description={this.props.description}
                    backButtonProps={{ onClick: this.props.onBackButtonClicked }}
                    commandBarItems={[
                        {
                            id: "add-item",
                            important: true,
                            onActivate: () => {
                                this.props.onAddItemClicked();
                            },
                            text: "Add epic"
                        },
                        {
                            id: "remove-item",
                            important: true,
                            onActivate: () => {
                                this.props.onRemoveSelectedItemClicked();
                            },
                            text: "Remove selected epic",
                            disabled: !this.props.itemIsSelected
                        },
                        {
                            iconProps: {
                                iconName: "Delete"
                            },
                            id: "delete-plan",
                            important: false,
                            onActivate: () => {
                                this.props.onDeleteButtonClicked(this.props.id);
                            },
                            text: "Delete plan"
                        }
                    ]}
                />
            </>
        );
    }
}
