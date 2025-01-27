import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

import { FilesService } from './files.service';

@Controller('files')
export class FilesController {
  constructor(private filesService: FilesService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadOneFile(@UploadedFile() file: Express.Multer.File) {
    console.log(file);
    const fileUrl = await this.filesService.uploadOneFile(file);
    return { fileUrl };
  }
}
