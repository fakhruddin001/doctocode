export const generateModels = (apiSpec: any): { [key: string]: string } => {
  const tables = apiSpec?.tables || [];
  const models: { [key: string]: string } = {};

  for (const table of tables) {
    const modelName = table.name;
    const tableName = table.name;
    const schema = table.schema || 'public';
    const columns = table.columns || [];

    let modelContent = `const { DataTypes } = require('sequelize');\nconst sequelize = require('../config/database');\n\n`;
    
    modelContent += `const ${modelName} = sequelize.define('${modelName}', {\n`;

    // Generate column definitions
    for (let i = 0; i < columns.length; i++) {
      const column = columns[i];
      const columnName = column.name;
      const columnType = mapDataType(column.type);
      const isRequired = column.isRequired || false;
      const isPrimaryKey = columnName.toLowerCase().includes('id') && i === 0;

      modelContent += `  ${columnName}: {\n`;
      modelContent += `    type: DataTypes.${columnType},\n`;
      
      if (isPrimaryKey) {
        modelContent += `    primaryKey: true,\n`;
        modelContent += `    autoIncrement: true,\n`;
      }
      
      modelContent += `    allowNull: ${!isRequired},\n`;
      
      if (isRequired && !isPrimaryKey) {
        modelContent += `    validate: {\n`;
        modelContent += `      notEmpty: true,\n`;
        modelContent += `      notNull: true\n`;
        modelContent += `    }\n`;
      }
      
      modelContent += `  }${i < columns.length - 1 ? ',' : ''}\n`;
    }

modelContent += `}, {\n`;
modelContent += `  tableName: '${tableName}',\n`;
// if (schema && schema !== 'dbo') {  // 'dbo' is default schema in SQL Server
//   modelContent += `  schema: '${schema}',\n`;
// }
modelContent += `  schema: 'dbo',\n`;
modelContent += `  timestamps: false,\n`;
modelContent += `});\n\n`;
    
    modelContent += `module.exports = ${modelName};\n`;

    models[`models/${modelName}.js`] = modelContent;
  }

  // Generate database config
  models['config/database.js'] = generateDatabaseConfig();

  // Generate index file for models
  let indexContent = `const sequelize = require('../config/database');\n\n`;
  
  for (const table of tables) {
    const modelName = table.name;
    indexContent += `const ${modelName} = require('./${modelName}');\n`;
  }
  
  indexContent += `\n// Define associations here if needed\n`;
  indexContent += `// Example: User.hasMany(Post);\n\n`;
  
  indexContent += `module.exports = {\n`;
  indexContent += `  sequelize,\n`;
  for (const table of tables) {
    indexContent += `  ${table.name},\n`;
  }
  indexContent += `};\n`;
  
  models['models/index.js'] = indexContent;

  return models;
};

const generateDatabaseConfig = (): string => {
  return `const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  process.env.DB_NAME || 'your_database',
  process.env.DB_USER || 'username',
  process.env.DB_PASS || 'password',
  {
    host: process.env.DB_HOST || 'localhost',
    dialect: 'mssql',
    logging: false
  }
);

module.exports = sequelize;
`;
};

const mapDataType = (type: string): string => {
  switch (type.toLowerCase()) {
    case 'int':
    case 'integer':
      return 'INTEGER';
    case 'string':
    case 'varchar':
    case 'text':
      return 'STRING';
    case 'bool':
    case 'boolean':
      return 'BOOLEAN';
    case 'datetime':
    case 'timestamp':
      return 'DATE';
    case 'decimal':
    case 'float':
      return 'FLOAT';
    case 'double':
      return 'DOUBLE';
    default:
      return 'STRING';
  }
};