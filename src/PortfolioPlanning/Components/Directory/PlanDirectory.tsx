import * as React from "react";
import "./PlanDirectory.scss";
import { Page } from "azure-devops-ui/Page";
import PlanDirectoryHeader from "./PlanDirectoryHeader";
import { PlanCard } from "./PlanCard";
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
import { MessageCard, MessageCardSeverity } from "azure-devops-ui/MessageCard";

export interface IPlanDirectoryProps {}

interface IPlanDirectoryMappedProps {
    directoryLoadingStatus: LoadingStatus;
    exceptionMessage: string;
    selectedPlanId: string;
    plans: PortfolioPlanningMetadata[];
    newPlanDialogVisible: boolean;
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
            return (
                <Page className="plan-page">
                    <PlanDirectoryHeader
                        newPlanButtonDisabled={this.props.directoryLoadingStatus !== LoadingStatus.Loaded}
                        onNewPlanClick={() => {
                            this.props.toggleNewPlanDialogVisible(true);
                        }}
                    />
                    {this._renderDirectoryContent()}
                    {this._renderNewPlanDialog()}
                </Page>
            );
        }
    }

    private _renderDirectoryContent = (): JSX.Element => {
        if (this.props.directoryLoadingStatus === LoadingStatus.NotLoaded) {
            return (
                <Spinner
                    className="page-content directory-loading-spinner"
                    label="Loading..."
                    size={SpinnerSize.large}
                />
            );
        } else {
            const exceptionMessageCard = (
                <MessageCard className="flex-self-stretch exception-message-card" severity={MessageCardSeverity.Error}>
                    {this.props.exceptionMessage}
                </MessageCard>
            );

            const plans = this.props.plans.map(plan => (
                <PlanCard
                    id={plan.id}
                    name={plan.name}
                    description={plan.description}
                    teams={["Contoso", "WIT X"]}
                    projects={["Fabrikam", "AzureDevOps"]}
                    onClick={id => this.props.toggleSelectedPlanId(id)}
                />
            ));

            return (
                <div className="page-content plan-directory-page-content">
                    {this.props.exceptionMessage && exceptionMessageCard}
                    <div className="plan-cards-container">{plans}</div>
                </div>
            );
        }
    };

    private _renderNewPlanDialog = (): JSX.Element => {
        return (
            this.props.newPlanDialogVisible && (
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
            )
        );
    };
}

function mapStateToProps(state: IPortfolioPlanningState): IPlanDirectoryMappedProps {
    return {
        directoryLoadingStatus: state.planDirectoryState.directoryLoadingStatus,
        exceptionMessage: state.planDirectoryState.exceptionMessage,
        selectedPlanId: state.planDirectoryState.selectedPlanId,
        plans: state.planDirectoryState.plans,
        newPlanDialogVisible: state.planDirectoryState.newPlanDialogVisible
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
