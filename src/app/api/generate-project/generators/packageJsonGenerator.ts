// package.json generation
export const createPackageJson = (projectSpec: any) => {
  const {
    project = "generated-api",
    version = "1.0.0",
    main = "index.js",
    description = "",
    author = "",
    license = "MIT",
    testing = false,
    scripts = {},
    dependencies = {},
    devDependencies = {},
  } = projectSpec;

  // Default scripts and devDependencies
  const baseScripts: Record<string, string> = {
    start: scripts.start || `node ${main}`,
    dev: scripts.dev || `nodemon ${main}`,
    ...scripts,
  };
  const baseDependencies = { express: "^5.1.0", dotenv: "^17.2.1", ...dependencies };
  const baseDevDependencies = { nodemon: "^3.1.10", ...devDependencies };

  // Add testing dependencies and scripts if requested
  if (testing) {
    baseScripts.test = baseScripts.test || "mocha";
    baseDevDependencies.mocha = "^11.7.1";
    baseDevDependencies.chai = "^5.2.1";
  }

  const pkg: any = {
    name: project,
    version,
    description,
    main,
    author,
    license,
    scripts: baseScripts,
    dependencies: baseDependencies,
    devDependencies: baseDevDependencies,
  };

  if (testing) {
    pkg.mocha = {
      require: ["chai"],
      spec: "test/**/*.js",
      reporter: "spec",
      timeout: 5000,
    };
  }

  return JSON.stringify(pkg, null, 2);
};

