import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, beforeAll, vi } from "vitest";
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
  beforeAll(() => {
    // Mock URL.createObjectURL for all tests
    if (!URL.createObjectURL) {
      URL.createObjectURL = vi.fn(() => "blob:mock-url");
    }
  });

  it("renders upload UI and handles valid file upload", async () => {
    render(<Home />);
    expect(
      screen.getByRole("heading", { name: /ICS File Chunker/i })
    ).not.toBeNull();
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

  it("shows download button for each chunk and triggers download on click", async () => {
    render(<Home />);
    const input = screen.getByLabelText(/upload .ics file/i);
    // Create a valid ICS file large enough to produce multiple chunks
    // The chunk size in the app is 1024 * 1024 (1MB), so to get 3 chunks, we need a file > 2MB
    // For test, we can temporarily override chunkSize or test for 1 chunk as expected
    const file = createFile("test.ics", "BEGIN:VCALENDAR\n" + "A".repeat(2500));
    fireEvent.change(input, { target: { files: [file] } });
    await waitFor(() => {
      const el = screen.queryByText(
        (content) =>
          typeof content === "string" && content.includes("Chunks created:")
      );
      expect(el).not.toBeNull();
    });
    // There should be 1 download button (for 1 chunk, since chunkSize is 1MB and file is ~2.5KB)
    const downloadButtons = screen.getAllByText(/Download/);
    expect(downloadButtons.length).toBe(1);
    // Mock URL.createObjectURL and click
    const urlSpy = vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:url");
    const clickSpy = vi.spyOn(document, "createElement");
    fireEvent.click(downloadButtons[0]);
    expect(urlSpy).toHaveBeenCalled();
    expect(clickSpy).toHaveBeenCalledWith("a");
    urlSpy.mockRestore();
    clickSpy.mockRestore();
  });
});
