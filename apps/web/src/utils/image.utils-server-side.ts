// ./src/utils/image.utils-server-side.ts
// phía server side cần sử dụng thư viện sharp để xử lý ảnh
import sharp from "sharp";
import { Buffer } from "node:buffer";
import { createModuleLogger, AppModules } from "@/logger";
const logger = createModuleLogger(AppModules.IMAGE_UTILS);

interface ResizeOptions {
  width?: number;
  height?: number;
  maintainAspectRatio?: boolean;
  quality?: number; // 0 to 100 for Sharp
  format?: "jpeg" | "png" | "webp";
}

/**
 * Resize một ảnh với các tùy chọn khác nhau (Server-side)
 * @param file - File ảnh hoặc Blob hoặc Buffer
 * @param options - Các tùy chọn resize
 * @returns Promise trả về Buffer ảnh đã resize
 */
async function resizeImage(
  file: File | Blob | Buffer,
  options: ResizeOptions
): Promise<Buffer> {
  const {
    width,
    height,
    maintainAspectRatio = true,
    quality = 90,
    format = "jpeg",
  } = options;

  // Kiểm tra phải có ít nhất width hoặc height
  if (!width && !height) {
    throw new Error("Phải cung cấp ít nhất width hoặc height");
  }

  try {
    // Convert File/Blob to Buffer nếu cần
    let buffer: Buffer;

    if (Buffer.isBuffer(file)) {
      buffer = file;
    } else if (
      (typeof Blob !== "undefined" && file instanceof Blob) ||
      (typeof File !== "undefined" && file instanceof File)
    ) {
      // File hoặc Blob
      const arrayBuffer = await file.arrayBuffer();
      buffer = Buffer.from(arrayBuffer);
    } else {
      throw new Error("Invalid file type");
    }

    // Khởi tạo Sharp instance
    let sharpInstance = sharp(buffer);

    // Resize với các options
    const resizeOptions: sharp.ResizeOptions = {
      fit: maintainAspectRatio ? "inside" : "fill",
      withoutEnlargement: true, // Không phóng to ảnh nhỏ hơn kích thước yêu cầu
    };

    if (width) resizeOptions.width = Math.round(width);
    if (height) resizeOptions.height = Math.round(height);

    sharpInstance = sharpInstance.resize(resizeOptions);

    // Apply format và quality
    switch (format) {
      case "jpeg":
        sharpInstance = sharpInstance.jpeg({ quality, mozjpeg: true });
        break;
      case "png":
        sharpInstance = sharpInstance.png({
          quality,
          compressionLevel: 9,
          adaptiveFiltering: true,
        });
        break;
      case "webp":
        sharpInstance = sharpInstance.webp({ quality });
        break;
    }

    // Convert sang buffer
    const outputBuffer = await sharpInstance.toBuffer();

    logger.debug(
      `Image resized: ${buffer.length} -> ${outputBuffer.length} bytes`
    );

    return outputBuffer;
  } catch (error) {
    logger.error("Error resizing image:", error);
    throw new Error(
      `Failed to resize image: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}

/**
 * Lấy metadata của ảnh
 */
async function getImageMetadata(file: File | Blob | Buffer) {
  try {
    let buffer: Buffer;

    if (Buffer.isBuffer(file)) {
      buffer = file;
    } else if (
      (typeof Blob !== "undefined" && file instanceof Blob) ||
      (typeof File !== "undefined" && file instanceof File)
    ) {
      const arrayBuffer = await file.arrayBuffer();
      buffer = Buffer.from(arrayBuffer);
    } else {
      throw new Error("Invalid file type");
    }

    const metadata = await sharp(buffer).metadata();
    return metadata;
  } catch (error) {
    logger.error("Error getting image metadata:", error);
    throw error;
  }
}

export { resizeImage, getImageMetadata, type ResizeOptions };
