import { S3Client } from '@aws-sdk/client-s3';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  MulterModuleOptions,
  MulterOptionsFactory,
} from '@nestjs/platform-express';
import * as multerS3 from 'multer-s3';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class MulterConfigService implements MulterOptionsFactory {
  constructor(private readonly configService: ConfigService) {}

  createMulterOptions(): MulterModuleOptions {
    const s3Config = new S3Client({
      region: this.configService.get<string>('BUCKET_REGION', ''),
      credentials: {
        accessKeyId: this.configService.get<string>(
          'BUCKET_ACCESSS_KEY_ID',
          '',
        ),
        secretAccessKey: this.configService.get<string>(
          'BUCKET_SECRET_ACCESS_KEY',
          '',
        ),
      },
    });

    return {
      storage: multerS3({
        s3: s3Config,
        bucket: this.configService.get<string>('BUCKET_NAME', ''),
        contentType: multerS3.AUTO_CONTENT_TYPE,
        acl: 'public-read',
        key: (req, file, cb) => {
          const fileName =
            path.parse(file.originalname).name.replace(/\s/g, '') +
            '-' +
            uuidv4();

          const extension = path.parse(file.originalname).ext;
          cb(null, `${fileName}${extension}`);
        },
      }),
    };
  }
}
