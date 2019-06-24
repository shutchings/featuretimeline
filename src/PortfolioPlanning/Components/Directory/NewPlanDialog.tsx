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
}

const nameObservable = new ObservableValue<string>("");
const descriptionObservable = new ObservableValue<string>("");

export default class NewPlanDialog extends React.Component<NewPlanDialogProps> {
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
                            value={nameObservable}
                            onChange={(e, newValue) =>
                                (nameObservable.value = newValue)
                            }
                            width={TextFieldWidth.standard}
                            placeholder="Add your plan name"
                        />
                        <TextField
                            className="text-field"
                            value={descriptionObservable}
                            onChange={(e, newValue) =>
                                (descriptionObservable.value = newValue)
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
                            onClick={() =>
                                alert(
                                    `Created plan ${nameObservable.value}: ${
                                        descriptionObservable.value
                                    }`
                                )
                            }
                        />
                    </ButtonGroup>
                </PanelFooter>
            </CustomDialog>
        );
    }
}
