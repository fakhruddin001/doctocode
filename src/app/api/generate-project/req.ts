const jsonData = {
  project: "EmployeeManagement",
  tables: [
    {
      name: "Employee",
      schema: "public",
      columns: [
        {
          name: "EmployeeID",
          type: "INT",
          primaryKey: true,
          nullable: false,
          autoIncrement: true,
        },
        { name: "FirstName", type: "VARCHAR(50)", nullable: false },
        { name: "LastName", type: "VARCHAR(50)", nullable: false },
        {
          name: "Email",
          type: "VARCHAR(100)",
          nullable: true,
          unique: true,
        },
        { name: "HireDate", type: "DATE", nullable: false },
      ],
    },
  ],
  api: {
    version: "v1",
    basePath: "/api",
    endpoints: [
      {
        name: "Employee",
        method: "POST",
        path: "/AddEmployees",
        description: "Add a new employee",
        body: {
          FirstName: "string",
          LastName: "string",
          Email: "string",
          HireDate: "date",
        },
        logic: {
          validate: {
            required: ["FirstName", "LastName", "HireDate"],
            emailFormat: "Email",
            unique: ["Email"],
            dateNotFuture: ["HireDate"],
          },
        },
        response: {
          success: { status: 201, message: "Employee created" },
          errors: {
            "400": "Invalid input",
            "409": "Email already exists",
            "500": "Internal server error",
          },
        },
      },
      {
        name: "Employee",
        method: "GET",
        path: "/GetAllEmployees",
        description: "Retrieve all employees",
        queryParams: ["search", "limit", "offset"],
        logic: {
          filter: ["FirstName", "LastName", "Email"],
          pagination: true,
        },
        response: {
          success: { status: 200, data: "List<Employee>" },
          errors: { "500": "Internal server error" },
        },
      },
      {
        name: "Employee",
        method: "GET",
        path: "/GetEmployeesById/{id}",
        description: "Retrieve employee by ID",
        logic: {
          validate: { exists: "EmployeeID" },
        },
        response: {
          success: { status: 200, data: "Employee" },
          errors: {
            "404": "Employee not found",
            "500": "Internal server error",
          },
        },
      },
      {
        name: "Employee",
        method: "PUT",
        path: "/UpdateEmployees/{id}",
        description: "Update employee details",
        body: {
          FirstName: "string",
          LastName: "string",
          Email: "string",
          HireDate: "date",
        },
        logic: {
          validate: {
            exists: "EmployeeID",
            emailFormat: "Email",
            unique: ["Email"],
            dateNotFuture: ["HireDate"],
          },
        },
        response: {
          success: { status: 200, message: "Employee updated" },
          errors: {
            "400": "Invalid input",
            "404": "Employee not found",
            "409": "Email already exists",
            "500": "Internal server error",
          },
        },
      },
      {
        name: "Employee",
        method: "DELETE",
        path: "/DeleteEmployees/{id}",
        description: "Delete employee by ID",
        logic: {
          validate: { exists: "EmployeeID" },
        },
        response: {
          success: { status: 200, message: "Employee deleted" },
          errors: {
            "404": "Employee not found",
            "500": "Internal server error",
          },
        },
      },
    ],
  },
};
export const reqData = jsonData;
