// Dynamically generate a README.md file with setup instructions
export const createReadme = (projectSpec: any) => {
  const {
    project = "generated-api",
    description = "",
    author = "",
    license = "MIT",
    testing = false,
  } = projectSpec;

  // Use escaped backticks for Markdown code blocks
  const codeBlock = "```";

  return `# ${project}

${description ? description + "\n\n" : ""}
## Setup

1. Install dependencies:
   ${codeBlock}sh
   npm install
   ${codeBlock}

2. Start the development server:
   ${codeBlock}sh
   npm run dev
   ${codeBlock}

3. To run in production:
   ${codeBlock}sh
   npm start
   ${codeBlock}

${
  testing
    ? `4. To run tests:\n   ${codeBlock}sh\n   npm test\n   ${codeBlock}\n`
    : ""
}

## Author
${author || "By Codient"}

## License
${license}
`;
};
