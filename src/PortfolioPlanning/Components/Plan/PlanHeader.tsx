import * as React from "react";
import "./PlanHeader.scss";
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
                    commandBarClassName="plan-header-command-bar"
                    commandBarItems={[
                        {
                            id: "add-item",
                            iconProps: {
                                iconName: "Add"
                            },
                            important: true,
                            subtle: true,
                            onActivate: () => {
                                this.props.onAddItemClicked();
                            }
                        },
                        {
                            id: "settings",
                            iconProps: {
                                iconName: "Settings"
                            },
                            important: true,
                            subtle: true
                        },
                        {
                            id: "remove-item",
                            iconProps: {
                                iconName: "Delete"
                            },
                            text: "Remove selected epic",
                            important: false,
                            subtle: true,
                            disabled: !this.props.itemIsSelected,
                            onActivate: () => {
                                this.props.onRemoveSelectedItemClicked();
                            }
                        },
                        {
                            id: "delete-plan",
                            iconProps: {
                                iconName: "Delete"
                            },
                            text: "Delete plan",
                            important: false,
                            subtle: true,
                            onActivate: () => {
                                this.props.onDeleteButtonClicked(this.props.id);
                            }
                        }
                    ]}
                />
            </>
        );
    }
}
