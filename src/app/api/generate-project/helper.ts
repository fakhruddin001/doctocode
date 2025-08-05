import archiver from "archiver";
import {  PassThrough } from "stream";

// Helper to generate Express app code from JSON

export const generateExpressApp = (jsonData: any): string => {
  const endpoints =
    jsonData.api && jsonData.api.endpoints ? jsonData.api.endpoints : [];
  let routes = `const express = require('express');\nconst app = express();\napp.use(express.json());\n`;
  endpoints.forEach((ep: any) => {
    console.log(ep);
    routes += `\napp.${ep.urlType.toLowerCase()}('${
      jsonData.api.basePath || ""
    }${ep.path}', (req, res) => {\n  // ${ep.description}\n  res.status(${
        200
    }).json({ message: '${"OK"}' });\n});\n`;
  });
  routes += `\napp.listen(3000,()=>console.log('API running on 3000'));`;
  return routes;
};

// Helper to generate SQL create table statements from JSON
const generateCreateTableSQL = (jsonData: any): { [key: string]: string } => {
  const tables = jsonData.tables || [];
  const sqlFiles: { [key: string]: string } = {};
  tables.forEach((table: any) => {
    let sql = `CREATE TABLE ${table.schema ? table.schema + '.' : ''}${table.name} (\n`;
    const cols = table.columns.map((col: any) => {
      let colDef = `${col.name} ${col.type}`;
      if(col.type=='string'){
        colDef= `${col.name} VARCHAR(100)`;
      }
      if(col.type=='bool'){
        colDef= `${col.name} BIT`;
      }
      if (col.primaryKey) colDef += ' PRIMARY KEY';
      if (col.autoIncrement) colDef += ' AUTOINCREMENT';
      if (col.unique) colDef += ' UNIQUE';
      if (!col.nullable) colDef += ' NOT NULL';
      return colDef;
    });
    sql += cols.join(',\n');
    sql += '\n);';
    sqlFiles[`${table.name}.sql`] = sql;
  });
  return sqlFiles;
};

// Helper to create project files in memory (Express app + SQL tables)
export const createProjectFiles = async (jsonData: any) => {
  const files: { [key: string]: string } = {};
  files["index.js"] = generateExpressApp(jsonData);
  files["package.json"] = JSON.stringify(
    {
      name: jsonData.project || "generated-api",
      version: "1.0.0",
      main: "index.js",
      dependencies: { express: "^4.18.2" },
    },
    null,
    2
  );
  // Add SQL table files
  const sqlFiles = generateCreateTableSQL(jsonData);
  Object.assign(files, sqlFiles);
  return files;
}

// Helper to zip files in memory and return as a stream
export const zipFiles = async (files: { [key: string]: string }): Promise<Uint8Array> => {
  const archive = archiver("zip", { zlib: { level: 9 } });
  const bufs: Uint8Array[] = [];
  const stream = new PassThrough();
  archive.pipe(stream);
  stream.on("data", (chunk: Uint8Array) => bufs.push(chunk));
  for (const [filename, content] of Object.entries(files)) {
    archive.append(content, { name: filename });
  }
  await archive.finalize();
  // Wait for the stream to finish (not just 'end')
  await new Promise((resolve, reject) => {
    const finished = require("stream").finished;
    finished(stream, (err: any) => (err ? reject(err) : resolve(undefined)));
  });
  // Polyfill for Uint8Array.concat
  const totalLength = bufs.reduce((acc, curr) => acc + curr.length, 0);
  const merged = new Uint8Array(totalLength);
  let offset = 0;
  for (const arr of bufs) {
    merged.set(arr, offset);
    offset += arr.length;
  }
  return merged;
}