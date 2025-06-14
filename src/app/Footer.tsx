import React from "react";

export function Footer() {
  return (
    <footer className="row-start-3 flex flex-col items-center justify-center gap-2 opacity-80 text-xs text-zinc-700 dark:text-zinc-300 py-4">
      <div>
        ICS File Chunker &bull; &copy; {new Date().getFullYear()} Trillium Smith
      </div>
      <div>
        <a
          href="https://github.com/trillium/ics-file-chunker"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:underline hover:underline-offset-4"
        >
          View source on GitHub
        </a>
      </div>
    </footer>
  );
}
