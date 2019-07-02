import * as React from "react";
import "./PlanConfiguration.scss";
import { ComboBox } from "office-ui-fabric-react/lib/ComboBox";
import { ProgressTrackingCriteria } from "../Contracts";

export interface IPlanConfigurationProps {
    selectedItemId: number;
    progressTrackingCriteria: ProgressTrackingCriteria;
    onAddItemClick: () => void;
    onRemoveSelectedItemClick: () => void;
    onProgressTrackingCriteriaChanged: (item: { key: string; text: string }) => void;
}

export const PlanConfiguration = (props: IPlanConfigurationProps) => {
    const selectedProgressCriteriaKey =
        props.progressTrackingCriteria === ProgressTrackingCriteria.CompletedCount ? "completedCount" : "storyPoints";

    return (
        <div className="configuration-container">
            <div className="progress-options">
                <div className="progress-options-label">Track Progress Using: </div>
                <ComboBox
                    className="progress-options-dropdown"
                    selectedKey={selectedProgressCriteriaKey}
                    allowFreeform={false}
                    autoComplete="off"
                    options={[
                        {
                            key: "completedCount",
                            text: ProgressTrackingCriteria.CompletedCount
                        },
                        {
                            key: "storyPoints",
                            text: ProgressTrackingCriteria.StoryPoints
                        }
                    ]}
                    onChanged={props.onProgressTrackingCriteriaChanged}
                />
            </div>
            <button className="add-item-button" onClick={props.onAddItemClick}>
                Add Epic
            </button>
            <button
                className="remove-item-button"
                disabled={!props.selectedItemId}
                onClick={props.onRemoveSelectedItemClick}
            >
                Remove selected epic from plan
            </button>
        </div>
    );
};
