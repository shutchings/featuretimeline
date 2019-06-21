import { IProject, IEpic } from "../Contracts";

const firstProjectId = "1";
const firstProjectName = "Project 1";
const secondProjectId = "2";
const secondProjectName = "Project 2";
const thirdProjectId = "3";
const thirdProjectName = "Project 3";

export const Projects: IProject[] = [
    { id: firstProjectId, title: firstProjectName },
    { id: secondProjectId, title: secondProjectName },
    { id: thirdProjectId, title: thirdProjectName }
];

export const Epics: IEpic[] = [
    {
        id: 1,
        project: firstProjectId,
        title: "Epic 1",
        startDate: new Date(2019, 5, 1),
        endDate: new Date(2019, 6, 1),
        completedCount: 10,
        totalCount: 10,
        completedStoryPoints: 70,
        totalStoryPoints: 70,
        storyPointsProgress: 1.0,
        countProgress: 1.0
    },
    {
        id: 2,
        project: firstProjectId,
        title: "Epic 2",
        startDate: new Date(2019, 4, 1),
        endDate: new Date(2019, 7, 15),
        completedCount: 3,
        totalCount: 9,
        completedStoryPoints: 30,
        totalStoryPoints: 90,
        storyPointsProgress: 0.333,
        countProgress: 0.333
    },
    {
        id: 3,
        project: firstProjectId,
        title: "Epic 3",
        startDate: new Date(2019, 4, 15),
        endDate: new Date(2019, 6, 30),
        completedCount: 0,
        totalCount: 5,
        completedStoryPoints: 0,
        totalStoryPoints: 30,
        storyPointsProgress: 0.0,
        countProgress: 0.0
    },
    {
        id: 4,
        project: secondProjectId,
        title: "Epic 4",
        startDate: new Date(2019, 5, 1),
        endDate: new Date(2019, 6, 1),
        completedCount: 0,
        totalCount: 0,
        completedStoryPoints: 0,
        totalStoryPoints: 0,
        storyPointsProgress: 0.0,
        countProgress: 0.0
    },
    {
        id: 5,
        project: secondProjectId,
        title: "Epic 5",
        startDate: new Date(2019, 4, 1),
        endDate: new Date(2019, 7, 15),
        completedCount: 0,
        totalCount: 0,
        completedStoryPoints: 0,
        totalStoryPoints: 0,
        storyPointsProgress: 0.0,
        countProgress: 0.0
    },
    {
        id: 6,
        project: thirdProjectId,
        title: "Epic 6",
        startDate: new Date(2019, 4, 15),
        endDate: new Date(2019, 6, 30),
        completedCount: 0,
        totalCount: 0,
        completedStoryPoints: 0,
        totalStoryPoints: 0,
        storyPointsProgress: 0.0,
        countProgress: 0.0
    }
];

export const OtherEpics: IEpic[] = [
    {
        id: 7,
        project: firstProjectId,
        title: "Epic 7",
        startDate: new Date(2019, 2, 1),
        endDate: new Date(2019, 6, 1),
        completedCount: 0,
        totalCount: 0,
        completedStoryPoints: 0,
        totalStoryPoints: 0,
        storyPointsProgress: 0.0,
        countProgress: 0.0
    },
    {
        id: 8,
        project: firstProjectId,
        title: "Epic 8",
        startDate: new Date(2019, 3, 1),
        endDate: new Date(2019, 7, 15),
        completedCount: 0,
        totalCount: 0,
        completedStoryPoints: 0,
        totalStoryPoints: 0,
        storyPointsProgress: 0.0,
        countProgress: 0.0
    },
    {
        id: 9,
        project: secondProjectId,
        title: "Epic 9",
        startDate: new Date(2019, 5, 15),
        endDate: new Date(2019, 9, 30),
        completedCount: 0,
        totalCount: 0,
        completedStoryPoints: 0,
        totalStoryPoints: 0,
        storyPointsProgress: 0.0,
        countProgress: 0.0
    }
];
