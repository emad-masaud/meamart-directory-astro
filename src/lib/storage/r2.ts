import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export interface R2Config {
  accountId: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucketName: string;
  publicDomain?: string; // Optional: e.g. "https://cdn.meamart.com"
}

export class R2Storage {
  private client: S3Client;
  private bucket: string;
  private publicDomain: string | undefined;

  constructor(config: R2Config) {
    this.bucket = config.bucketName;
    this.publicDomain = config.publicDomain;

    this.client = new S3Client({
      region: "auto",
      endpoint: `https://${config.accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
    });
  }

  /**
   * Upload a file to Cloudflare R2
   * @param key The destination path/filename (e.g., "avatars/user123.jpg")
   * @param fileBuffer The file data as a Buffer or Uint8Array
   * @param contentType The MIME type (e.g., "image/jpeg")
   * @returns The public URL (if publicDomain is configured) or the key
   */
  async uploadFile(key: string, fileBuffer: Buffer | Uint8Array, contentType: string): Promise<string> {
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      Body: fileBuffer,
      ContentType: contentType,
    });

    await this.client.send(command);

    if (this.publicDomain) {
      return `${this.publicDomain}/${key}`;
    }
    
    return key;
  }

  /**
   * Get a temporary signed URL to download a private file
   * @param key The file key in the bucket
   * @param expiresIn Expiration time in seconds (default: 3600 = 1 hour)
   */
  async getPresignedUrl(key: string, expiresIn: number = 3600): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    return await getSignedUrl(this.client, command, { expiresIn });
  }

  /**
   * Delete a file from the bucket
   * @param key The file key to delete
   */
  async deleteFile(key: string): Promise<void> {
    const command = new DeleteObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    await this.client.send(command);
  }
}
