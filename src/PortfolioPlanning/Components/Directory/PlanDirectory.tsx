import * as React from "react";
import "./PlanDirectory.scss";
import { Page } from "azure-devops-ui/Page";
import PlanDirectoryHeader from "./PlanDirectoryHeader";
import PlanCard from "./PlanCard";
import NewPlanDialog from "./NewPlanDialog";
import { PlanDirectoryActions } from "../../Redux/Actions/PlanDirectoryActions";
import { connect } from "react-redux";
import { IPortfolioPlanningState } from "../../Redux/Contracts";
import { IPlan } from "../../Contracts";

export interface IPlanDirectoryProps {}

interface IPlanDirectoryMappedProps {
    selectedPlanId: string;
    plans: IPlan[];
    newPlanDialogVisible: boolean;
}

export class PlanDirectory extends React.Component<
    IPlanDirectoryProps & IPlanDirectoryMappedProps & typeof Actions
> {
    constructor(props) {
        super(props);
    }

    public render() {
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
                            title={plan.title}
                            description={plan.description}
                            onClick={id => alert(id)}
                        />
                    ))}
                </div>
                {this.props.newPlanDialogVisible && (
                    <NewPlanDialog
                        onDismiss={() =>
                            this.props.toggleNewPlanDialogVisible(false)
                        }
                        onCreate={(name: string, description: string) => {
                            this.props.createPlan(name, description);
                            this.props.toggleNewPlanDialogVisible(false);
                        }}
                    />
                )}
            </Page>
        );
    }
}

function mapStateToProps(
    state: IPortfolioPlanningState
): IPlanDirectoryMappedProps {
    return {
        selectedPlanId: state.planDirectoryState.selectedPlanId,
        plans: state.planDirectoryState.plans,
        newPlanDialogVisible: state.planDirectoryState.newPlanDialogVisible
    };
}

const Actions = {
    createPlan: PlanDirectoryActions.createPlan,
    toggleNewPlanDialogVisible: PlanDirectoryActions.toggleNewPlanDialogVisible
};

export const ConnectedPlanDirectory = connect(
    mapStateToProps,
    Actions
)(PlanDirectory);
