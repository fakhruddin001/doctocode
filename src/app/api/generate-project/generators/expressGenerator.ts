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
  const envContent = `PORT=4000\nDB_NAME='SMAXProdDashboard'\nDB_USER='etlunidashbrd'\nDB_PASS='zxQaL7#dbo'\nDB_HOST='sql-sdp-feu-pr.bureauveritas.com'\n`;

  // routes/index.js content
  let routesContent = `const express = require('express');\nconst router = express.Router();\n`;
  
  // Import middlewares
  routesContent += `const { validatePayload } = require('../middlewares/validation');\n`;
  routesContent += `const errorHandler = require('../middlewares/errorHandler');\n`;
  routesContent += `const { sequelize } = require('../models');\n`;
  routesContent += `const { authenticate, authorize } = require('../middlewares/auth');\n\n`;
  
  // Import controllers - get unique controller names
  const controllerNamesSet = new Set(endpoints.map((endpoint: any) => endpoint.name || 'default'));
  const controllerNames = Array.from(controllerNamesSet);
  controllerNames.forEach(controllerName => {
    routesContent += `const ${controllerName}Controller = require('../controllers/${controllerName}Controller');\n`;
  });
  routesContent += `\n`;

  // Generate routes with controller integration
  for (const endpoint of endpoints) {
    const method = (endpoint?.urlType || "get").toLowerCase();
    const fullPath = `${basePath}/${endpoint.path}`;
    const expressPath = fullPath.replace(/\{([^}]+)\}/g, ":$1");
    const controllerName = endpoint.name || 'default';
    const methodName = generateControllerMethodName(method, endpoint.path);
    const description = endpoint.description ? `// ${endpoint.description}\n` : "";
    const payload = endpoint.payload || null;

    routesContent += `${description}`;
    
    // Build middleware chain
    let middlewareChain = '';
    
    // Add authentication 
    // middlewareChain += 'authenticate, ';
    
    // Add validation middleware for methods with payload
    if (payload && (method === "post" || method === "put" || method === "patch")) {
      const validationSchema = Array.isArray(payload) && payload.length > 0 ? payload[0] : payload;
      middlewareChain += `validatePayload(${JSON.stringify(validationSchema)}), `;
    }
    
    // Generate route with controller method
    routesContent += `router.${method}('${expressPath}', ${middlewareChain}${controllerName}Controller.${methodName});\n\n`;
  }

  routesContent += `module.exports = router;\n`;

  // Updated entry point with error handling middleware
  const entryPointContent = `require('dotenv').config();\nconst { sequelize } = require('./models');\nconst express = require('express');\nconst app = express();\nconst routes = require('./routes');\nconst errorHandler = require('./middlewares/errorHandler');\n\napp.use(express.json());\napp.use('/', routes);\n\n// 404 handler\napp.use((req, res, next) => {\n  res.status(404).json({ error: 'Not Found' });\n});\n\n// Global error handler\napp.use(errorHandler);\n\nconst PORT = process.env.PORT || 3000;\nsequelize.sync().then(()=>{app.listen(PORT, () => console.log('API running on ' + PORT));})\n`;

  return {
    "index.js": entryPointContent,
    ".env": envContent,
    "routes/index.js": routesContent,
  };
};

// Helper function to generate controller method names
const generateControllerMethodName = (method: string, path: string): string => {
  const hasParam = path.includes('{') && path.includes('}');
  const baseName = path.split('/').pop()?.replace(/[{}]/g, '') || 'resource';
  
  switch (method) {
    case 'get':
      return hasParam ? `get${capitalize(baseName)}ById` : `getAll${capitalize(baseName)}`;
    case 'post':
      return `create${capitalize(baseName)}`;
    case 'put':
      return `update${capitalize(baseName)}`;
    case 'patch':
      return `patch${capitalize(baseName)}`;
    case 'delete':
      return `delete${capitalize(baseName)}`;
    default:
      return `handle${capitalize(baseName)}`;
  }
};

const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);