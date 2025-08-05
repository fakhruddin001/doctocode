// Dockerfile generation
export const createDockerfile = ({
  nodeVersion = "20",
  port = 3000,
  startCommand = "npm run start",
  envVars = {},
  workingDir = "/usr/src/app",
  nodeEnv = "production",
} = {}) => {
  const envLines = Object.entries(envVars)
    .map(([key, value]) => `ENV ${key}=${String(value).replace(/\n/g, "")}`)
    .join("\n");
  const cmdParts = startCommand.split(" ").filter(Boolean);
  const cmdLine = `CMD [${cmdParts.map((p) => `"${p}"`).join(", ")}]`;

  const dockerfile = [
    `FROM node:${nodeVersion}`,
    `WORKDIR ${workingDir}`,
    `COPY package*.json ./`,
    `RUN npm install --omit=dev`,
    `COPY . .`,
    envLines,
    `ENV NODE_ENV=${nodeEnv}`,
    `EXPOSE ${port}`,
    cmdLine,
  ]
    .filter(Boolean)
    .join("\n")
    .trim();
  return dockerfile;
};
