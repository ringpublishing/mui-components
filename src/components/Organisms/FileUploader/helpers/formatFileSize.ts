/**
 * Formats file size from bytes to human-readable format with appropriate unit.
 *
 * Automatically selects the most appropriate unit (Bytes, KB, MB, GB) based on file size.
 * Uses binary units (1 KB = 1024 bytes) following IEC standard.
 *
 * @param bytes - File size in bytes (non-negative number)
 * @param decimals - Number of decimal places to display (default: 1)
 *
 * @returns Formatted string with unit (e.g., "1.5mb", "256kb", "0 Bytes")
 *
 * @example
 * ```typescript
 * formatFileSize(0)                    // "0 Bytes"
 * formatFileSize(500)                  // "500 Bytes"
 * formatFileSize(1024)                 // "1.0kb"
 * formatFileSize(1536)                 // "1.5kb"
 * formatFileSize(1048576)              // "1.0mb"
 * formatFileSize(5242880)              // "5.0mb"
 * formatFileSize(1073741824)           // "1.0gb"
 * formatFileSize(1536, 0)              // "2kb" (rounded)
 * formatFileSize(1536, 2)              // "1.50kb"
 * ```
 *
 * @remarks
 * - Uses binary units: 1 KB = 1024 bytes, 1 MB = 1024 KB, 1 GB = 1024 MB
 * - Negative decimal values are clamped to 0
 * - Returns "0 Bytes" for zero input (special case)
 * - Maximum supported unit is GB (for larger files, displays as GB with decimals)
 */
export function formatFileSize(bytes: number, decimals = 1): string {
    // Handle invalid input
    if (!Number.isFinite(bytes) || bytes < 0) {
        return '0 Bytes';
    }

    if (bytes === 0) {
        return '0 Bytes';
    }

    const kilobyte = 1024;
    const megabyte = kilobyte * 1024;
    const gigabyte = megabyte * 1024;
    const decimalPlaces = decimals < 0 ? 0 : decimals;

    if (bytes < kilobyte) {
        return `${bytes} Bytes`;
    }

    if (bytes < megabyte) {
        return `${(bytes / kilobyte).toFixed(decimalPlaces)}kb`;
    }

    if (bytes < gigabyte) {
        return `${(bytes / megabyte).toFixed(decimalPlaces)}mb`;
    }

    return `${(bytes / gigabyte).toFixed(decimalPlaces)}gb`;
}
