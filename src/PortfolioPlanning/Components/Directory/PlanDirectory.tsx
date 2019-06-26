import * as React from "react";
import "./PlanDirectory.scss";
import { Page } from "azure-devops-ui/Page";
import PlanDirectoryHeader from "./PlanDirectoryHeader";
import PlanCard from "./PlanCard";
import NewPlanDialog from "./NewPlanDialog";
import { PlanDirectoryActions } from "../../Redux/Actions/PlanDirectoryActions";
import { connect } from "react-redux";
import { IPortfolioPlanningState } from "../../Redux/Contracts";
import PlanPage from "../PlanPage";
import { PortfolioPlanningDataService } from "../../../Services/PortfolioPlanningDataService";
import { PortfolioPlanningMetadata } from "../../Models/PortfolioPlanningQueryModels";
import { EpicTimelineActions } from "../../Redux/Actions/EpicTimelineActions";
import { LoadingStatus } from "../../Contracts";
import { Spinner, SpinnerSize } from "azure-devops-ui/Spinner";

export interface IPlanDirectoryProps {}

interface IPlanDirectoryMappedProps {
    selectedPlanId: string;
    plans: PortfolioPlanningMetadata[];
    newPlanDialogVisible: boolean;
    directoryLoadingStatus: LoadingStatus;
}

export class PlanDirectory extends React.Component<IPlanDirectoryProps & IPlanDirectoryMappedProps & typeof Actions> {
    constructor(props) {
        super(props);
    }

    public render() {
        if (this.props.selectedPlanId) {
            const selectedPlan = this.props.plans.find(plan => plan.id === this.props.selectedPlanId);

            return (
                <PlanPage
                    id={selectedPlan.id}
                    title={selectedPlan.name}
                    description={selectedPlan.description}
                    backButtonClicked={() => {
                        this.props.toggleSelectedPlanId(undefined);
                        this.props.resetPlanState();
                    }}
                    deleteButtonClicked={(id: string) => {
                        this.props.deletePlan(id);
                        this.props.resetPlanState();
                    }}
                />
            );
        } else {
            if (this.props.directoryLoadingStatus === LoadingStatus.NotLoaded) {
                return <Spinner label="Loading..." size={SpinnerSize.large} />;
            } else {
                return (
                    <Page className="plan-page">
                        <PlanDirectoryHeader
                            onNewPlanClick={() => {
                                this.props.toggleNewPlanDialogVisible(true);
                            }}
                        />
                        <div className="page-content plan-directory-page-content">
                            {this.props.plans.map(plan => (
                                <PlanCard
                                    id={plan.id}
                                    name={plan.name}
                                    description={plan.description}
                                    onClick={id => this.props.toggleSelectedPlanId(id)}
                                />
                            ))}
                        </div>
                        {this.props.newPlanDialogVisible && (
                            <NewPlanDialog
                                existingPlanNames={this.props.plans.map(plan => plan.name)}
                                onDismiss={() => this.props.toggleNewPlanDialogVisible(false)}
                                onCreate={(name: string, description: string) => {
                                    PortfolioPlanningDataService.getInstance()
                                        .AddPortfolioPlan(name, description)
                                        .then(
                                            newPlan => {
                                                this.props.createPlan(newPlan.id, newPlan.name, newPlan.description);
                                                this.props.toggleNewPlanDialogVisible(false);
                                            },
                                            reason => {
                                                alert(`Create new plan failed: ${reason}`);
                                            }
                                        );
                                }}
                            />
                        )}
                    </Page>
                );
            }
        }
    }
}

function mapStateToProps(state: IPortfolioPlanningState): IPlanDirectoryMappedProps {
    return {
        selectedPlanId: state.planDirectoryState.selectedPlanId,
        plans: state.planDirectoryState.plans,
        newPlanDialogVisible: state.planDirectoryState.newPlanDialogVisible,
        directoryLoadingStatus: state.planDirectoryState.directoryLoadingStatus
    };
}

const Actions = {
    createPlan: PlanDirectoryActions.createPlan,
    deletePlan: PlanDirectoryActions.deletePlan,
    toggleSelectedPlanId: PlanDirectoryActions.toggleSelectedPlanId,
    toggleNewPlanDialogVisible: PlanDirectoryActions.toggleNewPlanDialogVisible,
    togglePlanLoadingStatus: EpicTimelineActions.toggleLoadingStatus,
    resetPlanState: EpicTimelineActions.resetPlanState
};

export const ConnectedPlanDirectory = connect(
    mapStateToProps,
    Actions
)(PlanDirectory);
