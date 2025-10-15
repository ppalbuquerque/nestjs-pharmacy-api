import { Module } from '@nestjs/common';
import { MedicationModule } from './medication/medication.module';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Medication } from './medication/medication.entitity';
import { MedicationSubscriber } from './medication/medication.subscriber';
import { File } from './files/entities/file.entity';
import { FilesModule } from './files/files.module';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    MedicationModule,
    FilesModule,
    ConfigModule.forRoot(),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST'),
        port: parseInt(configService.get<string>('DB_PORT') || ''),
        username: configService.get<string>('DB_USER'),
        password: configService.get<string>('DB_PASS'),
        database: configService.get<string>('DB_NAME'),
        entities: [Medication, File],
        subscribers: [MedicationSubscriber],
        synchronize: false,
        ssl: true,
      }),
    }),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
