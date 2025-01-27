import { Module } from '@nestjs/common';

import { FilesController } from './files.controller';
import { FilesService } from './files.service';
import { FirbaseStorageModule } from 'src/firebase/firebase.module';

@Module({
  controllers: [FilesController],
  providers: [FilesService],
  imports: [FirbaseStorageModule],
})
export class FilesModule {}
