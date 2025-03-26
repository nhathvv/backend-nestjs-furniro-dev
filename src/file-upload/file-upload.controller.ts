import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
  UploadedFiles,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { FileUploadService } from './file-upload.service';
import { ResponeMessage } from 'src/decorator/customize';
import { ApiBody, ApiConsumes } from '@nestjs/swagger';
import { memoryStorage } from 'multer';
import { FOLDER_S3_UPLOAD, MAX_NUMBER_OF_FILES } from 'src/constants/s3.constants';
import { RESPONSE_MESSAGE } from 'src/constants/message';
@Controller('file-upload')
export class FileUploadController {
  constructor(private readonly fileUploadService: FileUploadService) {}

  @Post('upload')
  @ResponeMessage(RESPONSE_MESSAGE.FILE_UPLOAD_SUCCESSFULLY)
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file', {
    storage: memoryStorage(),
  }))
  uploadFile(@UploadedFile(
    new ParseFilePipe({
      validators: [
        new MaxFileSizeValidator({ maxSize: 10 * 1024 * 1024 }),
        new FileTypeValidator({
          fileType: /(image\/jpeg|image\/png|image\/webp)$/,
        }),
      ],
    }),
  ) file: Express.Multer.File) {
    return this.fileUploadService.uploadFile(FOLDER_S3_UPLOAD,file);
  }
  
  @Post('upload-multiple')
  @ResponeMessage(RESPONSE_MESSAGE.FILE_UPLOAD_SUCCESSFULLY)
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(FilesInterceptor('files',MAX_NUMBER_OF_FILES , {
    storage: memoryStorage(),
  }))
  uploadMultipleFiles(@UploadedFiles(
    new ParseFilePipe({
      validators: [
        new MaxFileSizeValidator({ maxSize: 10 * 1024 * 1024 }),
        new FileTypeValidator({
          fileType: /(image\/jpeg|image\/png|image\/webp)$/,
        }),
      ],
    })
  ) files: Express.Multer.File[]) {
    return this.fileUploadService.uploadMultipleFiles(FOLDER_S3_UPLOAD, files);
  }
}
