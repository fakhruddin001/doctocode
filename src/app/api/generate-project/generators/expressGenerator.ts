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
    const fullPath = `${basePath}/${endpoint.path}`;
    const expressPath = fullPath.replace(/\{([^}]+)\}/g, ":$1");
    const description = endpoint.description
      ? `  // ${endpoint.description}\n`
      : "";
    const payload = endpoint.payload || null;
    const responseStructure = endpoint.response || null;
    // routesContent += `router.${method}('${fullPath}', async (req, res) => {\n${description}  try {\n    res.status(200).json({ message: 'OK' });\n  } catch (err) {\n    console.error(err);\n    res.status(500).json({ error: 'Internal Server Error' });\n  }\n});\n\n`;
    routesContent += `router.${method}('${expressPath}', async (req, res) => {\n${description}  try {\n`;

    // Add request body validation for methods with payload
    if (
      payload &&
      (method === "post" || method === "put" || method === "patch")
    ) {
      routesContent += `    const requestBody = req.body;\n`;
      routesContent += `    \n    // Validate request body structure\n`;

      // Generate validation for each field in payload
      if (Array.isArray(payload) && payload.length > 0) {
        const payloadStructure = payload[0]; // Get first object as template
        Object.keys(payloadStructure).forEach((key) => {
          const fieldType = payloadStructure[key];
          routesContent += `    if (requestBody.${key} === undefined) {\n`;
          routesContent += `      return res.status(400).json({ error: 'Missing required field: ${key}' });\n`;
          routesContent += `    }\n`;

          // Add type validation
          if (fieldType === "number") {
            routesContent += `    if (typeof requestBody.${key} !== 'number') {\n`;
            routesContent += `      return res.status(400).json({ error: 'Field ${key} must be a number' });\n`;
            routesContent += `    }\n`;
          } else if (fieldType === "boolean") {
            routesContent += `    if (typeof requestBody.${key} !== 'boolean') {\n`;
            routesContent += `      return res.status(400).json({ error: 'Field ${key} must be a boolean' });\n`;
            routesContent += `    }\n`;
          } else if (fieldType === "string") {
            routesContent += `    if (typeof requestBody.${key} !== 'string') {\n`;
            routesContent += `      return res.status(400).json({ error: 'Field ${key} must be a string' });\n`;
            routesContent += `    }\n`;
          }
        });
      }
      routesContent += `    \n`;
    }

    // Use response structure if available, otherwise default message
    if (responseStructure) {
      routesContent += `    res.status(200).json(${JSON.stringify(
        responseStructure
      )});\n`;
    } else {
      // For PATCH/PUT/POST without defined response, return the payload structure or success message
      if (
        payload &&
        (method === "patch" || method === "put" || method === "post")
      ) {
        routesContent += `    res.status(200).json(${JSON.stringify(
          payload
        )});\n`;
      } else {
        routesContent += `    res.status(200).json({ message: 'OK' });\n`;
      }
    }

    routesContent += `  } catch (err) {\n    console.error(err);\n    res.status(500).json({ error: 'Internal Server Error' });\n  }\n});\n\n`;
  }
  routesContent += `module.exports = router;\n`;

  const entryPointContent = `require('dotenv').config();\nconst express = require('express');\nconst app = express();\nconst routes = require('./routes');\n\napp.use(express.json());\napp.use('/', routes);\n\n// 404 handler\napp.use((req, res, next) => {\n  res.status(404).json({ error: 'Not Found' });\n});\n\n// Error handler\napp.use((err, req, res, next) => {\n  console.error(err.stack);\n  res.status(500).json({ error: 'Internal Server Error' });\n});\n\nconst PORT = process.env.PORT || 3000;\napp.listen(PORT, () => console.log('API running on ' + PORT));\n`;

  return {
    "index.js": entryPointContent,
    ".env": envContent,
    "routes/index.js": routesContent,
  };
};
