export const generateExpressApp = (
  apiSpec: any
): {
  "index.js": string;
  ".env": string;
  "routes/index.js": string;
} => {
  const basePath = apiSpec?.api?.basePath || "";
  const endpoints = apiSpec?.api?.endpoints || [];

  // .env file content
  const envContent = `PORT=3000\n`;

  // routes/index.js content
  let routesContent = `const express = require('express');\nconst router = express.Router();\n\n`;
  for (const endpoint of endpoints) {
    const method = (endpoint?.urlType || "get").toLowerCase();
    const fullPath = `${basePath}${endpoint.path}`;
    const description = endpoint.description
      ? `  // ${endpoint.description}\n`
      : "";
    routesContent += `router.${method}('${fullPath}', async (req, res) => {\n${description}  try {\n    res.status(200).json({ message: 'OK' });\n  } catch (err) {\n    console.error(err);\n    res.status(500).json({ error: 'Internal Server Error' });\n  }\n});\n\n`;
  }
  routesContent += `module.exports = router;\n`;

  const entryPointContent = `require('dotenv').config();\nconst express = require('express');\nconst app = express();\nconst routes = require('./routes');\n\napp.use(express.json());\napp.use('/', routes);\n\n// 404 handler\napp.use((req, res, next) => {\n  res.status(404).json({ error: 'Not Found' });\n});\n\n// Error handler\napp.use((err, req, res, next) => {\n  console.error(err.stack);\n  res.status(500).json({ error: 'Internal Server Error' });\n});\n\nconst PORT = process.env.PORT || 3000;\napp.listen(PORT, () => console.log('API running on ' + PORT));\n`;

  return {
    "index.js": entryPointContent,
    ".env": envContent,
    "routes/index.js": routesContent,
  };
};
