import archiver from "archiver";
import { PassThrough } from "stream";

// Utility to zip files in memory and return as Uint8Array
export const zipFiles = async (fileMap: {
  [key: string]: string;
}): Promise<Uint8Array> => {
  const archive = archiver("zip", { zlib: { level: 9 } });
  const bufferChunks: Buffer[] = [];
  const passThroughStream = new PassThrough();
  archive.pipe(passThroughStream);
  passThroughStream.on("data", (chunk: Buffer) => bufferChunks.push(chunk));
  for (const [filename, content] of Object.entries(fileMap)) {
    archive.append(content, { name: filename });
  }
  await archive.finalize();
  await new Promise((resolve, reject) => {
    const finished = require("stream").finished;
    finished(passThroughStream, (err: any) =>
      err ? reject(err) : resolve(undefined)
    );
  });
  // Use Buffer.concat and return a copy as Uint8Array
  const nodeBuffer = Buffer.concat(bufferChunks as unknown as Uint8Array[]);
  return Uint8Array.from(nodeBuffer);
};
