"use client";

import Image from "next/image";
import { FileUpload } from "./FileUpload";
import React, { useState } from "react";
import { parseIcsFile, chunkIcsFile, IcsChunk } from "../utils";

export default function Home() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [chunks, setChunks] = useState<IcsChunk[] | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const [parsing, setParsing] = useState(false);
  const chunkSize = 1024 * 1024; // 1MB default

  const handleFileSelected = async (file: File) => {
    setSelectedFile(file);
    setParseError(null);
    setChunks(null);
    setParsing(true);
    try {
      await parseIcsFile(file); // Validate and parse
      const fileChunks = chunkIcsFile(file, chunkSize);
      setChunks(fileChunks);
    } catch (err) {
      setParseError(
        err instanceof Error ? err.message : "Failed to parse file"
      );
    } finally {
      setParsing(false);
    }
  };

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)] bg-transparent">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start w-full max-w-2xl">
        <h1 className="text-3xl font-extrabold mb-4 text-blue-900 dark:text-blue-200 drop-shadow-sm tracking-tight text-center sm:text-left">
          ICS File Chunker
        </h1>
        <FileUpload onFileSelected={handleFileSelected} />
        {selectedFile && (
          <div className="mt-4 text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/40 rounded px-4 py-2 text-sm font-medium shadow-sm border border-green-200 dark:border-green-800">
            <span className="font-semibold">Selected file:</span>{" "}
            {selectedFile.name}
          </div>
        )}
        {parsing && (
          <div className="text-blue-700 dark:text-blue-300 mt-2 animate-pulse">
            Parsing and chunking...
          </div>
        )}
        {parseError && (
          <div className="text-red-600 dark:text-red-400 mt-2 bg-red-50 dark:bg-red-900/40 rounded px-4 py-2 text-sm font-medium border border-red-200 dark:border-red-800">
            {parseError}
          </div>
        )}
        {chunks && (
          <div className="mt-4 text-blue-800 dark:text-blue-200 bg-blue-50 dark:bg-blue-900/40 rounded-lg p-4 shadow card w-full">
            <div className="font-semibold mb-2">
              Chunks created: {chunks.length}
            </div>
            <ul className="list-disc ml-6 mt-2 space-y-2">
              {chunks.map((chunk) => (
                <li key={chunk.index} className="flex items-center gap-2">
                  <span className="font-mono text-xs text-zinc-700 dark:text-zinc-300">
                    Chunk {chunk.index + 1}: {chunk.size.toLocaleString()} bytes
                  </span>
                  <button
                    className="ml-2 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-xs font-semibold border border-blue-700 shadow-sm transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-blue-400/50"
                    onClick={() => {
                      const url = URL.createObjectURL(chunk.data);
                      const a = document.createElement("a");
                      a.href = url;
                      a.download = `${
                        selectedFile?.name.replace(/\.ics$/, "") || "chunk"
                      }-part${chunk.index + 1}.ics`;
                      document.body.appendChild(a);
                      a.click();
                      setTimeout(() => {
                        document.body.removeChild(a);
                        URL.revokeObjectURL(url);
                      }, 100);
                    }}
                  >
                    Download
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </main>
      <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center opacity-80">
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4 text-zinc-700 dark:text-zinc-300"
          href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/file.svg"
            alt="File icon"
            width={16}
            height={16}
          />
          Learn
        </a>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4 text-zinc-700 dark:text-zinc-300"
          href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/window.svg"
            alt="Window icon"
            width={16}
            height={16}
          />
          Examples
        </a>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4 text-zinc-700 dark:text-zinc-300"
          href="https://nextjs.org?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/globe.svg"
            alt="Globe icon"
            width={16}
            height={16}
          />
          Go to nextjs.org →
        </a>
      </footer>
    </div>
  );
}
