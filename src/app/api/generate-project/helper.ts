// Re-export helpers from split files
export { generateExpressApp } from './generators/expressGenerator';
export { sqlTypeMap, generateCreateTableSqlFiles } from './generators/sqlGenerator';
export { createDockerfile } from './generators/dockerfileGenerator';
export { createPackageJson } from './generators/packageJsonGenerator';
export { zipFiles } from './generators/zipUtils';
export { generateModels } from './generators/modelGenerator';
export { generateControllers, generateMiddlewares } from './generators/controllerGenerator';

// Helper to create project files in memory (Express app + SQL tables + Dockerfile)
import { generateCreateTableSqlFiles } from './generators/sqlGenerator';
import { generateExpressApp } from './generators/expressGenerator';
import { createPackageJson } from './generators/packageJsonGenerator';
import { createReadme } from './generators/readmeGenerator';
import { createDockerfile } from './helper';
import { generateModels } from './generators/modelGenerator';
import { generateControllers, generateMiddlewares } from './generators/controllerGenerator';


export const createProjectFiles = async (projectSpec: any) => {
  const fileMap: { [key: string]: string } = {};
  Object.assign(fileMap, generateExpressApp(projectSpec));
  Object.assign(fileMap, generateModels(projectSpec));
  Object.assign(fileMap, generateControllers(projectSpec));
  Object.assign(fileMap, generateMiddlewares(projectSpec)); 
  fileMap["package.json"] = createPackageJson(projectSpec);
  Object.assign(fileMap, generateCreateTableSqlFiles(projectSpec));
  fileMap["README.md"] = createReadme(projectSpec);
  fileMap["Dockerfile"] = createDockerfile(projectSpec);
  return fileMap;
};
