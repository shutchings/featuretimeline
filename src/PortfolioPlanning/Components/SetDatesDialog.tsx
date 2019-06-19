import * as React from "react";
import { Moment } from "moment";
import {
    Dialog,
    DialogType,
    DialogFooter
} from "office-ui-fabric-react/lib/Dialog";
import {
    PrimaryButton,
    DefaultButton
} from "office-ui-fabric-react/lib/Button";
import {
    DatePicker,
    IDatePickerStrings
} from "office-ui-fabric-react/lib/DatePicker";

export interface ISetDatesDialogProps {
    id: number;
    title: string;
    startDate: Moment;
    endDate: Moment;
    hidden: boolean;
    save: (id: number, startDate: Moment, endDate: Moment) => void;
    close: () => void;
}

const datePickerStrings: IDatePickerStrings = {
    months: [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December"
    ],

    shortMonths: [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec"
    ],

    days: [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday"
    ],

    shortDays: ["S", "M", "T", "W", "T", "F", "S"],

    goToToday: "Go to today",
    prevMonthAriaLabel: "Go to previous month",
    nextMonthAriaLabel: "Go to next month",
    prevYearAriaLabel: "Go to previous year",
    nextYearAriaLabel: "Go to next year"
};

export class SetDatesDialog extends React.Component<ISetDatesDialogProps> {
    public render() {
        return (
            <Dialog
                hidden={this.props.hidden}
                dialogContentProps={{
                    type: DialogType.normal,
                    title: `Set Dates for ${this.props.title}`
                }}
            >
                <DatePicker
                    value={this.props.startDate.toDate()}
                    strings={datePickerStrings}
                />
                <DatePicker
                    value={this.props.endDate.toDate()}
                    strings={datePickerStrings}
                />
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
        this.props.close();
    };

    private _onCancelDialog = (): void => {
        this.props.close();
    };
}
