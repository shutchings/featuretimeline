import * as React from "react";
import { Dialog, DialogType, DialogFooter } from "office-ui-fabric-react/lib/Dialog";
import { PrimaryButton, DefaultButton } from "office-ui-fabric-react/lib/Button";
import { Dropdown, IDropdownOption } from "office-ui-fabric-react/lib/Dropdown";
import { Project, WorkItem } from "../Models/PortfolioPlanningQueryModels";
import { IEpic, IProject, IAddEpics } from "../Contracts";
import { PortfolioPlanningDataService } from "../../Services/PortfolioPlanningDataService";
import "./AddEpicDialog.scss";

export interface IAddEpicDialogProps {
    planId: string;
    onCloseAddEpicDialog: () => void;
    onAddEpics: (epicsToAdd: IAddEpics) => void;
}

interface IAddEpicDialogState {
    epicsToAdd: IEpic[];
    projects: IDropdownOption[];
    selectedProject: IProject;
    epics: IDropdownOption[];
    selectedEpics: number[];
    epicsLoaded: boolean;
}
export class AddEpicDialog extends React.Component<IAddEpicDialogProps, IAddEpicDialogState> {
    constructor(props) {
        super(props);
        this.state = {
            epicsToAdd: [],
            projects: [],
            selectedProject: null,
            epics: [],
            selectedEpics: [],
            epicsLoaded: false
        };

        this._getAllProjects().then(projects => {
            const allProjects: IDropdownOption[] = [...this.state.projects];
            projects.forEach(project => {
                allProjects.push({
                    key: project.ProjectSK,
                    text: project.ProjectName
                });
            });
            this.setState({ projects: allProjects });
        });
    }

    public render() {
        return (
            <Dialog
                hidden={false}
                onDismiss={() => this.props.onCloseAddEpicDialog()}
                dialogContentProps={{
                    type: DialogType.close,
                    title: "Add Epic"
                }}
                modalProps={{
                    isBlocking: true
                }}
            >
                {this._renderProjectPicker()}
                {this._renderEpicsPicker()}
                <DialogFooter>
                    <PrimaryButton onClick={() => this._onAddEpics()} text="Add" />
                    <DefaultButton onClick={() => this.props.onCloseAddEpicDialog()} text="Cancel" />
                </DialogFooter>
            </Dialog>
        );
    }

    private _renderProjectPicker = () => {
        return (
            <Dropdown
                placeHolder="Select an option"
                label="Please select a project"
                options={this.state.projects}
                onChanged={(Option, index) => this._onProjectChange(index)}
            />
        );
    };

    private _onProjectChange = (index: number): void => {
        const selectedItem = this.state.projects[index];
        this.setState({
            selectedProject: {
                id: selectedItem.key.toString(),
                title: selectedItem.text
            }
        });
        this._getEpicsInProject(selectedItem.key.toString()).then(epics => {
            const allEpics: IDropdownOption[] = [];
            epics.forEach(epic => {
                allEpics.push({
                    key: epic.WorkItemId,
                    text: epic.Title
                });
            });
            this.setState({ epics: allEpics, epicsLoaded: true });
        });
    };

    private _renderEpicsPicker = () => {
        if (this.state.selectedProject && this.state.epicsLoaded) {
            if (this.state.epics.length > 0) {
                return (
                    <Dropdown
                        placeHolder="Select an option"
                        label="Please select Epics you want to add"
                        options={this.state.epics}
                        multiSelect
                        onChanged={this._onEpicChange}
                    />
                );
            }
            return (
                <div className="errorMessage">
                    The project {this.state.selectedProject.title} doesn't have any epic.
                </div>
            );
        }
    };

    private _onEpicChange = (item: IDropdownOption): void => {
        let newSelectedEpics = [...this.state.selectedEpics];

        const workItemId = Number(item.key.toString());

        if (item.selected) {
            // add the work item id, if it's checked
            newSelectedEpics.push(workItemId);
        } else {
            // remove the option if it's unchecked
            newSelectedEpics = newSelectedEpics.filter(currentWorkItemId => workItemId !== currentWorkItemId);
        }

        this.setState({
            selectedEpics: newSelectedEpics
        });
    };

    private _onAddEpics = (): void => {
        this.props.onAddEpics({
            planId: this.props.planId,
            projectId: this.state.selectedProject.id,
            epicsToAdd: this.state.selectedEpics,
            workItemType: "Epic", // TODO get from state
            requirementWorkItemType: "User story" // TODO get from state
        });

        this.props.onCloseAddEpicDialog();
    };

    private _getAllProjects = async (): Promise<Project[]> => {
        const projects = await PortfolioPlanningDataService.getInstance().getAllProjects();
        return projects.projects;
    };

    private _getEpicsInProject = async (projectId: string, workItemType?: string): Promise<WorkItem[]> => {
        const epics = await PortfolioPlanningDataService.getInstance().getAllWorkItemsOfTypeInProject(
            projectId,
            workItemType || "Epic"
        );
        return epics.workItems;
    };
}
