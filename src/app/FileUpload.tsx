import React from "react";

interface FileUploadProps {
  onFileSelected: (file: File) => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onFileSelected }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.name.endsWith(".ics")) {
      onFileSelected(file);
    } else {
      // Instead of alert, set a custom event for testability
      const event = new CustomEvent("ics-file-upload-error", {
        detail: "Please select a valid .ics file.",
      });
      window.dispatchEvent(event);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 p-6 bg-white/80 dark:bg-zinc-900/80 rounded-2xl shadow-lg border border-zinc-200 dark:border-zinc-800 w-full max-w-md">
      <label
        className="font-semibold text-lg text-zinc-800 dark:text-zinc-100 mb-2"
        htmlFor="ics-upload"
      >
        <span className="inline-flex items-center gap-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 text-blue-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          Upload .ics File
        </span>
      </label>
      <input
        id="ics-upload"
        type="file"
        accept=".ics"
        onChange={handleChange}
        className="block w-full text-sm text-zinc-700 dark:text-zinc-200 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-blue-400/50"
      />
      <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
        Only .ics calendar files are supported.
      </p>
    </div>
  );
};
