import * as React from "react";
import * as moment from "moment";
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
import { initializeIcons } from "office-ui-fabric-react/lib/Icons";

initializeIcons();

export interface ISetDatesDialogProps {
    id: number;
    title: string;
    startDate: moment.Moment;
    endDate: moment.Moment;
    hidden: boolean;
    save: (
        id: number,
        startDate: moment.Moment,
        endDate: moment.Moment
    ) => void;
    close: () => void;
}

interface ISetDatesDialogState {
    startDate: moment.Moment;
    endDate: moment.Moment;
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

export class SetDatesDialog extends React.Component<
    ISetDatesDialogProps,
    ISetDatesDialogState
> {
    constructor(props) {
        super(props);

        this.state = {
            startDate: this.props.startDate,
            endDate: this.props.endDate
        };
    }

    public render() {
        return (
            <Dialog
                hidden={this.props.hidden}
                dialogContentProps={{
                    type: DialogType.normal,
                    title: `Set Dates for ${this.props.title}`
                }}
            >
                Start Date:
                <DatePicker
                    value={this.state.startDate.toDate()}
                    onSelectDate={date =>
                        this.setState({ startDate: moment(date) })
                    }
                    strings={datePickerStrings}
                />
                End Date:
                <DatePicker
                    value={this.state.endDate.toDate()}
                    onSelectDate={date =>
                        this.setState({ endDate: moment(date) })
                    }
                    strings={datePickerStrings}
                />
                <div>
                    Start Date (State): {this.state.startDate.toLocaleString()}
                </div>
                <div>
                    End Date (State): {this.state.endDate.toLocaleString()}
                </div>
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
            this.state.startDate,
            this.state.endDate
        );
        this.props.close();
    };

    private _onCancelDialog = (): void => {
        this.props.close();
    };
}
