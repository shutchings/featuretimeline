import * as React from "react";
import "./PlanSettingsPanel.scss";
import { Panel } from "azure-devops-ui/Panel";
import { ComboBox } from "office-ui-fabric-react/lib/ComboBox";
import { ProgressTrackingCriteria, ITimelineItem } from "../../Contracts";

export interface IPlanSettingsProps {
    selectedItem: ITimelineItem;
    progressTrackingCriteria: ProgressTrackingCriteria;
    onProgressTrackingCriteriaChanged: (item: { key: string; text: string }) => void;
    onClosePlanSettingsPanel: () => void;
}

export const PlanSettingsPanel = (props: IPlanSettingsProps) => {
    const selectedProgressCriteriaKey =
        props.progressTrackingCriteria === ProgressTrackingCriteria.CompletedCount ? "completedCount" : "storyPoints";

    return (
        <Panel
            onDismiss={props.onClosePlanSettingsPanel}
            titleProps={{ text: "Settings" }}
            footerButtonProps={[{ text: "Close", primary: true, onClick: props.onClosePlanSettingsPanel }]}
        >
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
        </Panel>
    );
};
