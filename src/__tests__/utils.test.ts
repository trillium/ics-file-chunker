import { chunkIcsFile, parseIcsFile } from "../utils";

describe("ICS File Chunker Utilities", () => {
    const mockIcsText = `BEGIN:VCALENDAR\nVERSION:2.0\nBEGIN:VEVENT\nSUMMARY:Test Event\nEND:VEVENT\nEND:VCALENDAR`;
    const createMockFile = (text: string, name = "test.ics") => new File([text], name, { type: "text/calendar" });

    beforeAll(() => {
        if (!File.prototype.text) {
            File.prototype.text = function () {
                // Use FileReader to read the file as text
                return new Promise<string>((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = () => resolve(reader.result as string);
                    reader.onerror = reject;
                    reader.readAsText(this);
                });
            };
        }
    });

    describe("parseIcsFile", () => {
        it("should parse valid ICS file", async () => {
            const file = createMockFile(mockIcsText);
            await expect(parseIcsFile(file)).resolves.toContain("BEGIN:VCALENDAR");
        });

        it("should throw for non-ics file extension", async () => {
            const file = createMockFile(mockIcsText, "test.txt");
            await expect(parseIcsFile(file)).rejects.toThrow("File is not an .ics file");
        });

        it("should throw for invalid ICS content", async () => {
            const file = createMockFile("NOT AN ICS FILE", "bad.ics");
            await expect(parseIcsFile(file)).rejects.toThrow("File does not appear to be a valid ICS calendar");
        });
    });

    describe("chunkIcsFile", () => {
        it("should split file into correct number of chunks", () => {
            const text = "A".repeat(2500); // 2500 bytes
            const file = createMockFile(text);
            const chunks = chunkIcsFile(file, 1000);
            expect(chunks.length).toBe(3);
            expect(chunks[0].size).toBe(1000);
            expect(chunks[1].size).toBe(1000);
            expect(chunks[2].size).toBe(500);
        });

        it("should return empty array for empty file", () => {
            const file = createMockFile("");
            const chunks = chunkIcsFile(file, 1000);
            expect(chunks.length).toBe(0);
        });
    });

    describe("chunkIcsFile with various chunk sizes", () => {
        it("should create correct number and size of chunks for 1KB chunk size", () => {
            const text = "A".repeat(2500); // 2500 bytes
            const file = createMockFile(text);
            const chunks = chunkIcsFile(file, 1024); // 1KB
            expect(chunks.length).toBe(3);
            expect(chunks[0].size).toBe(1024);
            expect(chunks[1].size).toBe(1024);
            expect(chunks[2].size).toBe(452);
        });

        it("should create a single chunk if file size is less than chunk size", () => {
            const text = "A".repeat(500); // 500 bytes
            const file = createMockFile(text);
            const chunks = chunkIcsFile(file, 1024); // 1KB
            expect(chunks.length).toBe(1);
            expect(chunks[0].size).toBe(500);
        });

        it("should create correct chunks for exact multiples of chunk size", () => {
            const text = "A".repeat(3000); // 3KB
            const file = createMockFile(text);
            const chunks = chunkIcsFile(file, 1000);
            expect(chunks.length).toBe(3);
            expect(chunks[0].size).toBe(1000);
            expect(chunks[1].size).toBe(1000);
            expect(chunks[2].size).toBe(1000);
        });
    });
});
