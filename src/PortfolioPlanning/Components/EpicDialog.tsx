import * as React from "react";
import {
    Dialog,
    DialogType,
    DialogFooter
} from "office-ui-fabric-react/lib/Dialog";
import { Moment } from "moment";
import {
    PrimaryButton,
    DefaultButton
} from "office-ui-fabric-react/lib/Button";

export interface IEpicDialogProps {
    id: number;
    startDate: Moment;
    endDate: Moment;
    hidden: boolean;
    save: (id: number, startDate: Moment, endDate: Moment) => void;
    cancel: () => void;
}

export class EpicDialog extends React.Component<IEpicDialogProps> {
    public render() {
        return (
            <Dialog
                hidden={this.props.hidden}
                dialogContentProps={{
                    type: DialogType.normal,
                    title: "Set Dates"
                }}
            >
                <div>ID: {this.props.id}</div>
                <div>Start Date: {this.props.startDate.toLocaleString()}</div>
                <div>End Date: {this.props.endDate.toLocaleString()}</div>
                <DialogFooter>
                    <PrimaryButton onClick={this._onSaveDialog} text="Save" />
                    <DefaultButton
                        onClick={this._onCancelDialog}
                        text="Cancel"
                    />
                </DialogFooter>
            </Dialog>
        );
    }

    private _onSaveDialog = (): void => {
        this.props.save(
            this.props.id,
            this.props.startDate,
            this.props.endDate
        );
    };

    private _onCancelDialog = (): void => {
        this.props.cancel();
    };
}
