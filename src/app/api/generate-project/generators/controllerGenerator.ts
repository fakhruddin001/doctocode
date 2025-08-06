export const generateControllers = (apiSpec: any): { [key: string]: string } => {
  const endpoints = apiSpec?.api?.endpoints || [];
  const tables = apiSpec?.tables || [];
  const controllers: { [key: string]: string } = {};

  // Group endpoints by controller name
  const endpointsByController = groupEndpointsByController(endpoints);

  for (const [controllerName, controllerEndpoints] of Object.entries(endpointsByController)) {
    const relatedTable = findRelatedTable(controllerName, tables);
    const controllerContent = generateControllerContent(controllerName, controllerEndpoints, relatedTable);
    controllers[`controllers/${controllerName}Controller.js`] = controllerContent;
  }

  // Generate base controller
  controllers['controllers/baseController.js'] = generateBaseController();

  return controllers;
};

export const generateMiddlewares = (apiSpec: any): { [key: string]: string } => {
  const middlewares: { [key: string]: string } = {};

  // Generate validation middleware
  middlewares['middlewares/validation.js'] = generateValidationMiddleware();
  
  // Generate error handling middleware
  middlewares['middlewares/errorHandler.js'] = generateErrorHandlerMiddleware();
  
  // Generate auth middleware (basic structure)
  middlewares['middlewares/auth.js'] = generateAuthMiddleware();

  return middlewares;
};

const groupEndpointsByController = (endpoints: any[]) => {
  const grouped: { [key: string]: any[] } = {};
  
  endpoints.forEach(endpoint => {
    const controllerName = endpoint.name || 'default';
    if (!grouped[controllerName]) {
      grouped[controllerName] = [];
    }
    grouped[controllerName].push(endpoint);
  });
  
  return grouped;
};

const findRelatedTable = (controllerName: string, tables: any[]) => {
  return tables.find(table => 
    table?.name?.toLowerCase().includes(controllerName?.toLowerCase()) ||
    controllerName?.toLowerCase().includes(table?.name?.toLowerCase())
  );
};

const generateControllerContent = (controllerName: string, endpoints: any[], relatedTable: any): string => {
  const modelName = relatedTable?.name || controllerName;
  
  let content = `const { ${modelName} } = require('../models');\nconst BaseController = require('./baseController');\n\n`;
  content += `class ${capitalize(controllerName)}Controller extends BaseController {\n`;
  
  // Generate methods based on endpoints
  endpoints.forEach(endpoint => {
    const method = endpoint?.urlType?.toLowerCase();
    const methodName = generateMethodName(method, endpoint.path);
    
    content += `\n  async ${methodName}(req, res, next) {\n`;
    content += `    try {\n`;
    
    switch (method) {
      case 'get':
        if (endpoint.path.includes('{') && endpoint.path.includes('}')) {
          // GET by ID
          content += `      const { ${extractPathParam(endpoint.path)} } = req.params;\n`;
          content += `      const result = await ${modelName}.findByPk(${extractPathParam(endpoint.path)});\n`;
          content += `      \n      if (!result) {\n`;
          content += `        return res.status(404).json({ error: 'Resource not found' });\n`;
          content += `      }\n`;
          content += `      \n      res.status(200).json(result);\n`;
        } else {
          // GET all
          content += `      const { page = 1, limit = 10, ...filters } = req.query;\n`;
          content += `      const offset = (page - 1) * limit;\n`;
          content += `      \n      const result = await ${modelName}.findAndCountAll({\n`;
          content += `        where: filters,\n`;
          content += `        limit: parseInt(limit),\n`;
          content += `        offset: parseInt(offset)\n`;
          content += `      });\n`;
          content += `      \n      res.status(200).json({\n`;
          content += `        data: result.rows,\n`;
          content += `        total: result.count,\n`;
          content += `        page: parseInt(page),\n`;
          content += `        totalPages: Math.ceil(result.count / limit)\n`;
          content += `      });\n`;
        }
        break;
        
      case 'post':
        content += `      const newRecord = await ${modelName}.create(req.body);\n`;
        content += `      res.status(201).json(newRecord);\n`;
        break;
        
      case 'put':
      case 'patch':
        content += `      const { ${extractPathParam(endpoint.path)} } = req.params;\n`;
        content += `      const [updatedRowsCount] = await ${modelName}.update(req.body, {\n`;
        content += `        where: { ${getPrimaryKeyField(relatedTable)}: ${extractPathParam(endpoint.path)} }\n`;
        content += `      });\n`;
        content += `      \n      if (updatedRowsCount === 0) {\n`;
        content += `        return res.status(404).json({ error: 'Resource not found' });\n`;
        content += `      }\n`;
        content += `      \n      const updatedRecord = await ${modelName}.findByPk(${extractPathParam(endpoint.path)});\n`;
        content += `      res.status(200).json(updatedRecord);\n`;
        break;
        
      case 'delete':
        content += `      const { ${extractPathParam(endpoint.path)} } = req.params;\n`;
        content += `      const deletedRowsCount = await ${modelName}.destroy({\n`;
        content += `        where: { ${getPrimaryKeyField(relatedTable)}: ${extractPathParam(endpoint.path)} }\n`;
        content += `      });\n`;
        content += `      \n      if (deletedRowsCount === 0) {\n`;
        content += `        return res.status(404).json({ error: 'Resource not found' });\n`;
        content += `      }\n`;
        content += `      \n      res.status(204).send();\n`;
        break;
    }
    
    content += `    } catch (error) {\n`;
    content += `      next(error);\n`;
    content += `    }\n`;
    content += `  }\n`;
  });
  
  content += `}\n\n`;
  content += `module.exports = new ${capitalize(controllerName)}Controller();\n`;
  
  return content;
};

const generateBaseController = (): string => {
  return `class BaseController {
  // Common methods that all controllers can inherit
  
  validateRequired(data, requiredFields) {
    const missing = requiredFields.filter(field => !data[field]);
    if (missing.length > 0) {
      throw new Error(\`Missing required fields: \${missing.join(', ')}\`);
    }
  }
  
  formatResponse(data, message = 'Success') {
    return {
      success: true,
      message,
      data
    };
  }
  
  formatError(message, statusCode = 500) {
    return {
      success: false,
      message,
      statusCode
    };
  }
}

module.exports = BaseController;
`;
};

const generateValidationMiddleware = (): string => {
  return `const validatePayload = (schema) => {
  return (req, res, next) => {
    try {
      // Basic validation - you can enhance this with joi, yup, etc.
      if (schema && typeof schema === 'object') {
        const body = req.body;
        
        // Check required fields
        for (const [field, type] of Object.entries(schema)) {
          if (body[field] === undefined) {
            return res.status(400).json({
              error: \`Missing required field: \${field}\`
            });
          }
          
          // Basic type validation
          if (type === 'number' && typeof body[field] !== 'number') {
            return res.status(400).json({
              error: \`Field \${field} must be a number\`
            });
          }
          
          if (type === 'string' && typeof body[field] !== 'string') {
            return res.status(400).json({
              error: \`Field \${field} must be a string\`
            });
          }
          
          if (type === 'boolean' && typeof body[field] !== 'boolean') {
            return res.status(400).json({
              error: \`Field \${field} must be a boolean\`
            });
          }
        }
      }
      
      next();
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  };
};

module.exports = { validatePayload };
`;
};

const generateErrorHandlerMiddleware = (): string => {
  return `const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  // Sequelize validation errors
  if (err.name === 'SequelizeValidationError') {
    return res.status(400).json({
      error: 'Validation Error',
      details: err.errors.map(e => ({
        field: e.path,
        message: e.message
      }))
    });
  }

  // Sequelize unique constraint errors
  if (err.name === 'SequelizeUniqueConstraintError') {
    return res.status(409).json({
      error: 'Duplicate entry',
      details: err.errors.map(e => ({
        field: e.path,
        message: e.message
      }))
    });
  }

  // Sequelize foreign key constraint errors
  if (err.name === 'SequelizeForeignKeyConstraintError') {
    return res.status(400).json({
      error: 'Foreign key constraint violation',
      message: err.message
    });
  }

  // Default error
  res.status(err.statusCode || 500).json({
    error: err.message || 'Internal Server Error'
  });
};

module.exports = errorHandler;
`;
};

const generateAuthMiddleware = (): string => {
  return `const authenticate = (req, res, next) => {
  // Basic authentication middleware structure
  // You can implement JWT, API key, or other authentication methods here
  
  const token = req.headers.authorization;
  
  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  try {
    // TODO: Implement your authentication logic here
    // For example: verify JWT token, check API key, etc.
    
    // Mock user for now
    req.user = { id: 1, role: 'user' };
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid authentication' });
  }
};

const authorize = (roles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    if (roles.length && !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    
    next();
  };
};

module.exports = { authenticate, authorize };
`;
};

// Helper functions
const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);

const generateMethodName = (method: string, path: string): string => {
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

const extractPathParam = (path: string): string => {
  const match = path.match(/\{([^}]+)\}/);
  return match ? match[1] : 'id';
};

const getPrimaryKeyField = (table: any): string => {
  if (!table || !table.columns) return 'id';
  
  const pkColumn = table.columns.find((col: any) => 
    col?.name?.toLowerCase().includes('id') && 
    table.columns.indexOf(col) === 0
  );
  
  return pkColumn ? pkColumn.name : 'id';
};