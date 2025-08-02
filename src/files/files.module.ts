import { Module } from '@nestjs/common';
import { FilesService } from './files.service';
import { FilesController } from './files.controller';
import { ConfigModule } from '@nestjs/config';
import { MulterModule } from '@nestjs/platform-express';
import { MulterConfigService } from './multer.config.service';
import { TypeOrmModule } from '@nestjs/typeorm';

import { File } from './entities/file.entity';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([File]),
    MulterModule.registerAsync({
      useClass: MulterConfigService,
      imports: [ConfigModule],
    }),
  ],
  controllers: [FilesController],
  providers: [FilesService],
})
export class FilesModule {}
