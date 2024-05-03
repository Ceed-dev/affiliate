import { ProjectData } from "./projectData";

export type ExtendedProjectData = ProjectData & {
  selectedToken: string;
};