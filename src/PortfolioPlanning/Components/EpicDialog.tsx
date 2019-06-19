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
    onClose: (id: number, startDate: Moment, endDate: Moment) => void;
}

export class EpicDialog extends React.Component<IEpicDialogProps> {
    public render() {
        return (
            <Dialog
                hidden={false}
                dialogContentProps={{
                    type: DialogType.normal,
                    title: "Set Dates"
                }}
            >
                <div>ID: {this.props.id}</div>
                <div>Start Date: {this.props.startDate.toLocaleString()}</div>
                <div>End Date: {this.props.endDate.toLocaleString()}</div>
                <DialogFooter>
                    <PrimaryButton onClick={this._closeDialog} text="Save" />
                    <DefaultButton onClick={this._closeDialog} text="Cancel" />
                </DialogFooter>
            </Dialog>
        );
    }

    private _closeDialog = (): void => {
        this.props.onClose(
            this.props.id,
            this.props.startDate,
            this.props.endDate
        );
    };
}
