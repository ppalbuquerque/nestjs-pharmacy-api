import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { FirebaseStorageService } from './firebaseStorage.service';

@Module({
  providers: [FirebaseStorageService],
  imports: [ConfigModule],
  exports: [FirebaseStorageService],
})
export class FirbaseStorageModule {}
