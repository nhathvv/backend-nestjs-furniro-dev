import { S3Client } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { AWSConfig } from 'src/configs/aws.cnf';
import { ERROR_MESSAGES } from 'src/constants/message';

@Injectable()
export class FileUploadService {
  constructor(
    private readonly logger : Logger) {}
  bucketName = AWSConfig.config.AWS_S3_BUCKET_NAME;
  region = AWSConfig.config.AWS_S3_REGION
  s3Client = new S3Client({
    region: this.region,
    credentials: {
      accessKeyId: AWSConfig.config.AWS_ACCESS_KEY_ID,
      secretAccessKey: AWSConfig.config.AWS_SECRET_ACCESS_KEY,
    },
  });

  async uploadFile(path: string, file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException(ERROR_MESSAGES.NO_FILE_UPLOAD);
    }

    const fileName = `${path}/${Date.now()}-${file.originalname}`;
    const encodedFileName = encodeURIComponent(fileName);
    const filePath = `https://${this.bucketName}.s3.${this.region}.amazonaws.com/${encodedFileName}`;
    try {
      const upload = new Upload({
        client: this.s3Client,
        params: {
          Bucket: this.bucketName,
          Key: fileName,
          Body: file.buffer,
          ContentType: file.mimetype,
        },
      });

      await upload.done();
      return {filePath};
    } catch (error) {
      this.logger.error(`[FAILED UPLOAD FILE]::`, error)
      throw error;
    }
  }
  async uploadMultipleFiles(path: string, files: Express.Multer.File[]) {
    if (!files || files.length === 0) {
      throw new BadRequestException(ERROR_MESSAGES.NO_FILE_UPLOAD);
    }
    const uploadResults = await Promise.all(files.map(file => this.uploadFile(path, file)));
    const filePaths = uploadResults.map(result => result.filePath);
    return { filePaths };
  }
}
