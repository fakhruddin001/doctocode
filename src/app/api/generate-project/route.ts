import { NextRequest, NextResponse } from "next/server";
import { reqData } from "./req";
import { createProjectFiles, zipFiles } from "./helper";

// POST: Accept JSON and return zip of the project files
export async function POST(req: NextRequest) {
  try {
    const jsonData = await req.json();
    if (!jsonData)
      return NextResponse.json(
        { error: "No JSON data provided" },
        { status: 400 }
      );
    const files = await createProjectFiles(jsonData);

  const zipBuffer = await zipFiles(files);
  return new NextResponse(zipBuffer.slice().buffer, {
      status: 200,
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": 'attachment; filename="generated_project.zip"',
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}

// GET: For testing purposes, returns a zip of the project files
// This is useful for development and debugging

export async function GET() {
  try {
    if (!reqData)
      return NextResponse.json(
        { error: "No JSON data provided" },
        { status: 400 }
      );
    const files = await createProjectFiles(reqData);
  const zipBuffer = await zipFiles(files);
  return new NextResponse(zipBuffer.slice().buffer, {
      status: 200,
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": 'attachment; filename="generated_project.zip"',
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
