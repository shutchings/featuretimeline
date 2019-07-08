import * as React from "react";
import "./PlanSettingsPanel.scss";
import { Panel } from "azure-devops-ui/Panel";
import { ComboBox } from "office-ui-fabric-react/lib/ComboBox";
import { ProgressTrackingCriteria, ITimelineItem } from "../../Contracts";
import { Button } from "azure-devops-ui/Button";

export interface IPlanSettingsProps {
    selectedItem: ITimelineItem;
    progressTrackingCriteria: ProgressTrackingCriteria;
    onProgressTrackingCriteriaChanged: (item: { key: string; text: string }) => void;
    onDeletePlanClicked: () => void;
    onClosePlanSettingsPanel: () => void;
}

export const PlanSettingsPanel = (props: IPlanSettingsProps) => {
    const selectedProgressCriteriaKey =
        props.progressTrackingCriteria === ProgressTrackingCriteria.CompletedCount ? "completedCount" : "storyPoints";

    return (
        <Panel onDismiss={props.onClosePlanSettingsPanel} titleProps={{ text: "Settings" }}>
            <div className="settings-container">
                <div className="progress-options settings-item">
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
                <div className="delete-plan settings-item">
                    <div className="delete-message">
                        Delete this plan. This action can't be undone. All items in the plan will still be available in
                        your backlogs.
                    </div>
                    <Button danger={true} onClick={props.onDeletePlanClicked}>
                        Delete plan
                    </Button>
                </div>
            </div>
        </Panel>
    );
};
