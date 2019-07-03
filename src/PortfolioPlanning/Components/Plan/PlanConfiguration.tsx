import * as React from "react";
import "./PlanConfiguration.scss";
import { ComboBox } from "office-ui-fabric-react/lib/ComboBox";
import { ProgressTrackingCriteria, ITimelineItem } from "../../Contracts";

export interface IPlanConfigurationProps {
    selectedItem: ITimelineItem;
    progressTrackingCriteria: ProgressTrackingCriteria;
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
        </div>
    );
};
