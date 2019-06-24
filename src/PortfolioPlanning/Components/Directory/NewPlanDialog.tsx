import * as React from "react";
import "./NewPlanDialog.scss";
import { CustomDialog } from "azure-devops-ui/Dialog";
import { CustomHeader, HeaderTitleArea } from "azure-devops-ui/Header";
import { PanelContent, PanelFooter } from "azure-devops-ui/Panel";
import { TextField, TextFieldWidth } from "azure-devops-ui/TextField";
import { ObservableValue } from "azure-devops-ui/Core/Observable";
import { Button } from "azure-devops-ui/Button";
import { ButtonGroup } from "azure-devops-ui/ButtonGroup";

export interface NewPlanDialogProps {
    onDismiss: () => void;
    onCreate: (name: string, description: string) => void;
}

export default class NewPlanDialog extends React.Component<NewPlanDialogProps> {
    private nameObservable = new ObservableValue<string>("");
    private descriptionObservable = new ObservableValue<string>("");

    public render() {
        return (
            <CustomDialog
                className="new-plan-dialog"
                onDismiss={this.props.onDismiss}
                modal={true}
            >
                <CustomHeader>
                    <HeaderTitleArea className="title-m">
                        Create a new plan
                    </HeaderTitleArea>
                </CustomHeader>
                <PanelContent>
                    <div className="flex-column">
                        <TextField
                            className="text-field"
                            value={this.nameObservable}
                            onChange={(e, newValue) =>
                                (this.nameObservable.value = newValue)
                            }
                            width={TextFieldWidth.standard}
                            placeholder="Add your plan name"
                        />
                        <TextField
                            className="text-field"
                            value={this.descriptionObservable}
                            onChange={(e, newValue) =>
                                (this.descriptionObservable.value = newValue)
                            }
                            multiline
                            rows={4}
                            width={TextFieldWidth.standard}
                            placeholder="Add your plan description..."
                        />
                    </div>
                </PanelContent>
                <PanelFooter className="flex-end">
                    <ButtonGroup className="flex-row">
                        <Button text="Cancel" onClick={this.props.onDismiss} />
                        <Button
                            text="Create"
                            primary={true}
                            onClick={() => {
                                this.props.onCreate(
                                    this.nameObservable.value,
                                    this.descriptionObservable.value
                                );
                            }}
                            disabled={false} // TODO: Add disabled logic
                        />
                    </ButtonGroup>
                </PanelFooter>
            </CustomDialog>
        );
    }
}
