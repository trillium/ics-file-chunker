// Utility functions for ICS file chunking and parsing

export interface IcsChunk {
    index: number;
    size: number;
    data: Blob;
}

/**
 * Parses a .ics file and returns its text content.
 * Throws if the file is not a valid ICS file.
 */
export async function parseIcsFile(file: File): Promise<string> {
    if (!file.name.endsWith('.ics')) {
        throw new Error('File is not an .ics file');
    }
    const text = await file.text();
    if (!text.trim().startsWith('BEGIN:VCALENDAR')) {
        throw new Error('File does not appear to be a valid ICS calendar');
    }
    return text;
}

/**
 * Splits the ICS file into chunks of a given size (default 1MB).
 * Returns an array of IcsChunk objects.
 */
export function chunkIcsFile(file: File, chunkSize = 1024 * 1024): IcsChunk[] {
    const chunks: IcsChunk[] = [];
    let offset = 0;
    let index = 0;
    while (offset < file.size) {
        const end = Math.min(offset + chunkSize, file.size);
        const blob = file.slice(offset, end);
        chunks.push({
            index,
            size: end - offset,
            data: blob,
        });
        offset = end;
        index++;
    }
    return chunks;
}
