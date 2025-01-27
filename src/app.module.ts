import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { MedicationModule } from './medication/medication.module';
import { PrismaModule } from './prisma/prisma.module';
import { FilesModule } from './files/files.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    MedicationModule,
    PrismaModule,
    FilesModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
