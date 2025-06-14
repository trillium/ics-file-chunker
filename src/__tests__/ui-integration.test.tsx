import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, beforeAll } from "vitest";
import Home from "../app/page";

function createFile(
  name = "test.ics",
  content = "BEGIN:VCALENDAR\nEND:VCALENDAR"
) {
  return new File([content], name, { type: "text/calendar" });
}

beforeAll(() => {
  if (!File.prototype.text) {
    File.prototype.text = function () {
      return new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsText(this);
      });
    };
  }
});

describe("ICS File Chunker UI Integration", () => {
  it("renders upload UI and handles valid file upload", async () => {
    render(<Home />);
    expect(screen.getByText(/ICS File Chunker/i)).not.toBeNull();
    const input = screen.getByLabelText(/upload .ics file/i);
    const file = createFile();
    fireEvent.change(input, { target: { files: [file] } });
    await waitFor(() =>
      expect(screen.getByText(/Selected file:/)).not.toBeNull()
    );
    await waitFor(() =>
      expect(screen.getByText(/Chunks created:/)).not.toBeNull()
    );
    expect(screen.getByText(/Download/)).not.toBeNull();
  });

  it("shows error for invalid file extension", async () => {
    render(<Home />);
    const input = screen.getByLabelText(/upload .ics file/i);
    const file = createFile("bad.txt");
    let errorMsg = "";
    window.addEventListener("ics-file-upload-error", (e) => {
      errorMsg = (e as CustomEvent).detail;
    });
    fireEvent.change(input, { target: { files: [file] } });
    await waitFor(() =>
      expect(errorMsg).toBe("Please select a valid .ics file.")
    );
  });

  it("shows error for invalid ICS content", async () => {
    render(<Home />);
    const input = screen.getByLabelText(/upload .ics file/i);
    const file = createFile("bad.ics", "NOT AN ICS FILE");
    fireEvent.change(input, { target: { files: [file] } });
    await waitFor(() =>
      expect(
        screen.getByText(/File does not appear to be a valid ICS calendar/i)
      ).not.toBeNull()
    );
  });
});
