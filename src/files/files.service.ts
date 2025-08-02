import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { File } from './entities/file.entity';
import { Repository } from 'typeorm';

@Injectable()
export class FilesService {
  constructor(
    @InjectRepository(File)
    private filesRepository: Repository<File>,
  ) {}

  create(file: Express.MulterS3.File) {
    const tempFile = this.filesRepository.create({
      fileName: file.key,
      contentLength: file.size,
      contentType: file.mimetype,
      url: file.location,
    });

    console.log(file);
    return this.filesRepository.save(tempFile);
  }
}
