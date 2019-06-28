import * as React from "react";
import { Dialog, DialogType, DialogFooter } from "office-ui-fabric-react/lib/Dialog";
import { PrimaryButton, DefaultButton } from "office-ui-fabric-react/lib/Button";
import { Dropdown, IDropdownOption } from "office-ui-fabric-react/lib/Dropdown";
import { Project, WorkItem } from "../Models/PortfolioPlanningQueryModels";
import { IEpic, IProject, IAddEpics } from "../Contracts";
import { PortfolioPlanningDataService } from "../../Services/PortfolioPlanningDataService";
import "./AddEpicDialog.scss";
import { BacklogConfigurationDataService } from "../../Services/BacklogConfigurationDataService";
import { Spinner, SpinnerSize } from "office-ui-fabric-react/lib/Spinner";
import { ProjectBacklogConfiguration } from "../Models/ProjectBacklogModels";

export interface IAddEpicDialogProps {
    planId: string;
    onCloseAddEpicDialog: () => void;
    onAddEpics: (epicsToAdd: IAddEpics) => void;
}

interface IAddEpicDialogState {
    loadingProjects: boolean;
    epicsToAdd: IEpic[];
    projects: IDropdownOption[];
    selectedProject: IProject;
    selectedProjectBacklogConfiguration: ProjectBacklogConfiguration;
    epics: IDropdownOption[];
    selectedEpics: number[];
    epicsLoaded: boolean;
}
export class AddEpicDialog extends React.Component<IAddEpicDialogProps, IAddEpicDialogState> {
    constructor(props) {
        super(props);
        this.state = {
            loadingProjects: true,
            epicsToAdd: [],
            projects: [],
            selectedProject: null,
            selectedProjectBacklogConfiguration: null,
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
            this.setState({
                loadingProjects: false,
                projects: allProjects
            });
        });
    }

    public render() {
        const loadingStyle = {
            margin: "10px"
        };
        const projectsSection = this.state.loadingProjects ? (
            <Spinner size={SpinnerSize.large} style={loadingStyle} label="Loading..." />
        ) : (
            this._renderProjectPicker()
        );

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
                {projectsSection}
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
                selectedKey={this.state.selectedProject ? this.state.selectedProject.id : null}
                onChanged={(Option, index) => this._onProjectChange(index)}
            />
        );
    };

    private _onProjectChange = (index: number): void => {
        if (!this.state.loadingProjects) {
            this.setState({ loadingProjects: true });

            const selectedItem = this.state.projects[index];

            this._getEpicsInProject(selectedItem.key.toString()).then(
                epics => {
                    const allEpics: IDropdownOption[] = [];
                    epics.workItems.forEach(epic => {
                        allEpics.push({
                            key: epic.WorkItemId,
                            text: epic.Title
                        });
                    });

                    this.setState({
                        loadingProjects: false,
                        selectedProject: {
                            id: selectedItem.key.toString(),
                            title: selectedItem.text
                        },
                        selectedProjectBacklogConfiguration: epics.projectBacklogConfig,
                        epics: allEpics,
                        epicsLoaded: true
                    });
                },
                error => {
                    this.setState({ loadingProjects: false });
                    console.log(JSON.stringify(error, null, "    "));
                }
            );
        }
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
            workItemType: this.state.selectedProjectBacklogConfiguration.defaultEpicWorkItemType,
            requirementWorkItemType: this.state.selectedProjectBacklogConfiguration.defaultRequirementWorkItemType,
            effortWorkItemFieldRefName: this.state.selectedProjectBacklogConfiguration.effortFieldRefName
        });

        this.props.onCloseAddEpicDialog();
    };

    private _getAllProjects = async (): Promise<Project[]> => {
        const projects = await PortfolioPlanningDataService.getInstance().getAllProjects();
        return projects.projects;
    };

    private _getEpicsInProject = async (
        projectId: string
    ): Promise<{ workItems: WorkItem[]; projectBacklogConfig: ProjectBacklogConfiguration }> => {
        const projectConfig = await BacklogConfigurationDataService.getInstance().getProjectBacklogConfiguration(
            projectId
        );

        const epics = await PortfolioPlanningDataService.getInstance().getAllWorkItemsOfTypeInProject(
            projectId,
            projectConfig.defaultEpicWorkItemType
        );

        return {
            workItems: epics.workItems,
            projectBacklogConfig: projectConfig
        };
    };
}
