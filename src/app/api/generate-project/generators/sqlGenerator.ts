// SQL type map and table generation
export const sqlTypeMap: Record<string, string> = {
  string: "VARCHAR(100)",
  bool: "BIT",
  int: "INT",
  integer: "INT",
  float: "FLOAT",
  double: "DOUBLE",
  date: "DATE",
  datetime: "DATETIME",
};

export const generateCreateTableSqlFiles = (
  dbSpec: any
): { [key: string]: string } => {
  const tables = dbSpec.tables || [];
  const sqlFileMap: { [key: string]: string } = {};
  for (const table of tables) {
    let sql = `CREATE TABLE ${table.schema ? table.schema + "." : ""}${
      table.name
    } (\n`;
    const columnDefination = table.columns.map((column: any) => {
      let columnType =
        sqlTypeMap[column.type?.toLowerCase()] || column.type || "VARCHAR(100)";
      let columnDef = `${column.name} ${columnType}`;
      if (column.primaryKey) columnDef += " PRIMARY KEY";
      if (column.autoIncrement) columnDef += " AUTOINCREMENT";
      if (column.unique) columnDef += " UNIQUE";
      if (!column.nullable) columnDef += " NOT NULL";
      return columnDef;
    });
    sql += columnDefination.join(",\n");
    sql += "\n);";
    sqlFileMap[`${table.name}.sql`] = sql;
  }
  return sqlFileMap;
};
