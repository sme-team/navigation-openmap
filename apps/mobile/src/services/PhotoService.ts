// file: src/services/PhotoService.ts
import { defaultAxios, handleAxiosError } from './axiosConfig';
import { Platform, PermissionsAndroid } from 'react-native';
import RNFS from 'react-native-fs';
import ImageResizer from 'react-native-image-resizer';
import {
  launchImageLibrary,
  launchCamera,
  MediaType,
  ImagePickerResponse,
  ImageLibraryOptions,
} from 'react-native-image-picker';

export interface ImageProcessingOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: 'JPEG' | 'PNG';
}

export interface ProcessedImageResult {
  localPath: string;
  originalPath?: string;
  width: number;
  height: number;
  size: number;
}

export class PhotoService{
  private static instance: PhotoService;
  private readonly localDir: string;

  private constructor() {
    this.localDir = `${RNFS.DocumentDirectoryPath}/images`;
    this.ensureDirectoryExists();
  }

  public static getInstance(): PhotoService {
    if (!PhotoService.instance) {
      PhotoService.instance = new PhotoService();
    }
    return PhotoService.instance;
  }

  private async ensureDirectoryExists(): Promise<void> {
    try {
      const exists = await RNFS.exists(this.localDir);
      if (!exists) {
        await RNFS.mkdir(this.localDir);
      }
    } catch (error) {
    }
  }

  private generateFileName(extension: string = 'jpg'): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    return `img_${timestamp}_${random}.${extension}`;
  }

  public async resizeImage(
    imagePath: string,
    options: ImageProcessingOptions = {},
  ): Promise<any> {
    const {
      maxWidth = 800,
      maxHeight = 600,
      quality = 80,
      format = 'JPEG',
    } = options;

    try {
      const resizedImage = await ImageResizer.createResizedImage(
        imagePath,
        maxWidth,
        maxHeight,
        format,
        quality,
        0,
        undefined,
        false,
        {
          mode: 'contain',
          onlyScaleDown: true,
        },
      );

      return resizedImage;
    } catch (error) {
      console.error('Error resizing image:', error);
      throw error;
    }
  }

  private async saveToLocal(
    sourcePath: string,
    fileName?: string,
  ): Promise<string> {
    try {
      await this.ensureDirectoryExists();

      const finalFileName = fileName || this.generateFileName();
      const localPath = `${this.localDir}/${finalFileName}`;

      await RNFS.copyFile(sourcePath, localPath);
      return localPath;
    } catch (error) {
      console.error('Error saving to local:', error);
      throw error;
    }
  }

  private async requestPermissions(): Promise<boolean> {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.CAMERA,
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
        ]);

        return (
          granted['android.permission.CAMERA'] ===
          PermissionsAndroid.RESULTS.GRANTED &&
          granted['android.permission.WRITE_EXTERNAL_STORAGE'] ===
          PermissionsAndroid.RESULTS.GRANTED &&
          granted['android.permission.READ_EXTERNAL_STORAGE'] ===
          PermissionsAndroid.RESULTS.GRANTED
        );
      } catch (error) {
        console.error('Permission request error:', error);
        return false;
      }
    }
    return true;
  }

  public async getImageFromUrl(
    url: string,
    options: ImageProcessingOptions = {},
  ): Promise<ProcessedImageResult> {
    try {
      const tempFileName = this.generateFileName();
      const tempPath = `${RNFS.CachesDirectoryPath}/${tempFileName}`;
      const response = await defaultAxios.get(url, {
        responseType: 'arraybuffer',
        timeout: 30000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; React-Native-App)',
          'Accept': 'image/*',
          'Cache-Control': 'no-cache',
        },
      });

      if (response.status !== 200) {
        throw new Error(`Failed to download image: ${response.status}`);
      }

      const base64Image = this.arrayBufferToBase64(response.data);

      await RNFS.writeFile(tempPath, base64Image, 'base64');

      const resizedImage = await this.resizeImage(tempPath, options);

      const localPath = await this.saveToLocal(resizedImage.path);

      await RNFS.unlink(tempPath);
      await RNFS.unlink(resizedImage.path);

      return {
        localPath,
        originalPath: url,
        width: resizedImage.width,
        height: resizedImage.height,
        size: resizedImage.size,
      };
    } catch (error) {
      const standardizedError = handleAxiosError(error);
      console.error('Error getting image from URL:', standardizedError.message);
      throw new Error(standardizedError.message);
    }
  }

  private arrayBufferToBase64(arrayBuffer: ArrayBuffer): string {
    const bytes = new Uint8Array(arrayBuffer);
    const binary = bytes.reduce(
      (acc, byte) => acc + String.fromCharCode(byte),
      '',
    );
    return btoa(binary);
  }

  public async uploadImage(
    source: 'library' | 'camera',
    options: ImageProcessingOptions = {},
  ): Promise<ProcessedImageResult> {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        throw new Error('Permission denied');
      }

      const pickerOptions: ImageLibraryOptions = {
        mediaType: 'photo' as MediaType,
        includeBase64: false,
        maxHeight: 2000,
        maxWidth: 2000,
        quality: 1,
      };

      return new Promise((resolve, reject) => {
        const callback = async (response: ImagePickerResponse) => {
          if (response.didCancel) {
            reject(new Error('User cancelled image picker'));
            return;
          }

          if (response.errorMessage) {
            reject(new Error(response.errorMessage));
            return;
          }

          if (!response.assets || response.assets.length === 0) {
            reject(new Error('No image selected'));
            return;
          }

          try {
            const asset = response.assets[0];
            if (!asset.uri) {
              throw new Error('Invalid image URI');
            }

            const resizedImage = await this.resizeImage(asset.uri, options);

            const localPath = await this.saveToLocal(resizedImage.path);

            await RNFS.unlink(resizedImage.path);

            resolve({
              localPath,
              originalPath: asset.uri,
              width: resizedImage.width,
              height: resizedImage.height,
              size: resizedImage.size,
            });
          } catch (error) {
            reject(error);
          }
        };

        if (source === 'library') {
          launchImageLibrary(pickerOptions, callback);
        } else {
          launchCamera(pickerOptions, callback);
        }
      });
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  }

  public async processSharedImage(
    sharedImagePath: string,
    options: ImageProcessingOptions = {},
  ): Promise<ProcessedImageResult> {
    try {
      const exists = await RNFS.exists(sharedImagePath);
      if (!exists) {
        throw new Error('Shared image file not found');
      }

      const resizedImage = await this.resizeImage(sharedImagePath, options);

      const localPath = await this.saveToLocal(resizedImage.path);

      await RNFS.unlink(resizedImage.path);

      return {
        localPath,
        originalPath: sharedImagePath,
        width: resizedImage.width,
        height: resizedImage.height,
        size: resizedImage.size,
      };
    } catch (error) {
      console.error('Error processing shared image:', error);
      throw error;
    }
  }

  public async deleteLocalImage(localPath: string): Promise<void> {
    try {
      const exists = await RNFS.exists(localPath);
      if (exists) {
        await RNFS.unlink(localPath);
      }
    } catch (error) {
      console.error('Error deleting local image:', error);
      throw error;
    }
  }

  public async getLocalImages(): Promise<string[]> {
    try {
      await this.ensureDirectoryExists();
      const files = await RNFS.readDir(this.localDir);
      return files
        .filter(file => file.isFile() && /\.(jpg|jpeg|png)$/i.test(file.name))
        .map(file => file.path);
    } catch (error) {
      console.error('Error getting local images:', error);
      return [];
    }
  }

  public async clearLocalImages(): Promise<void> {
    try {
      const images = await this.getLocalImages();
      await Promise.all(images.map(path => this.deleteLocalImage(path)));
    } catch (error) {
      console.error('Error clearing local images:', error);
      throw error;
    }
  }

  public async getImageInfo(imagePath: string): Promise<any> {
    try {
      const stat = await RNFS.stat(imagePath);
      return {
        path: imagePath,
        size: stat.size,
        modificationTime: stat.mtime,
        exists: true,
      };
    } catch (error) {
      return {
        path: imagePath,
        exists: false,
      };
    }
  }
}

export const photoService = PhotoService.getInstance();