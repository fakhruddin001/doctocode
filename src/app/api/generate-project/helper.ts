// Re-export helpers from split files
export { generateExpressApp } from './generators/expressGenerator';
export { sqlTypeMap, generateCreateTableSqlFiles } from './generators/sqlGenerator';
export { createDockerfile } from './generators/dockerfileGenerator';
export { createPackageJson } from './generators/packageJsonGenerator';
export { zipFiles } from './generators/zipUtils';

// Helper to create project files in memory (Express app + SQL tables + Dockerfile)
import { generateCreateTableSqlFiles } from './generators/sqlGenerator';
import { generateExpressApp } from './generators/expressGenerator';
import { createPackageJson } from './generators/packageJsonGenerator';


export const createProjectFiles = async (projectSpec: any) => {
  const fileMap: { [key: string]: string } = {};
  Object.assign(fileMap, generateExpressApp(projectSpec));
  fileMap["package.json"] = createPackageJson(projectSpec);
  Object.assign(fileMap, generateCreateTableSqlFiles(projectSpec));
  return fileMap;
};
