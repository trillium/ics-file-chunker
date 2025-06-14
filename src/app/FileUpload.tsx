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
    <div className="flex flex-col items-center gap-2">
      <label className="font-semibold" htmlFor="ics-upload">
        Upload .ics File
      </label>
      <input
        id="ics-upload"
        type="file"
        accept=".ics"
        onChange={handleChange}
        className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
      />
    </div>
  );
};
