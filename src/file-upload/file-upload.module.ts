import { Logger, Module } from '@nestjs/common';
import { FileUploadService } from './file-upload.service';
import { FileUploadController } from './file-upload.controller';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
@Module({
  imports: [],
  controllers: [FileUploadController],
  providers: [FileUploadService,Logger],
})
export class FileUploadModule {}
