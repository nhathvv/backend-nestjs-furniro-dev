import dotenv from 'dotenv'
dotenv.config()
export class AWSConfig {
  public static config = {
    AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
    AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
    AWS_S3_REGION: process.env.AWS_REGION || 'ap-southeast-1',
    AWS_S3_BUCKET_NAME: process.env.AWS_S3_BUCKET_NAME,
  };
}