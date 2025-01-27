import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';
import * as path from 'path';

@Injectable()
export class FirebaseStorageService {
  constructor(private configService: ConfigService) {
    const serviceAccountPath = path.resolve(
      __dirname,
      '../../../.secrets/pharma-app-7ea50-firebase-adminsdk-fbsvc-36e14f8f0f.json',
    );

    const storageBucket = this.configService.get<string>('FIRESTORE_BUCKET');

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccountPath),
      storageBucket,
    });
  }

  async uploadFile(
    file: Express.Multer.File,
    fileName: string,
  ): Promise<string> {
    const bucket = admin.storage().bucket();

    const fileUpload = bucket.file(fileName);

    const stream = fileUpload.createWriteStream({
      metadata: {
        contentType: file.mimetype,
      },
    });

    return new Promise((resolve, reject) => {
      stream.on('error', (error) => {
        console.error('Error uploading file: ', error);
        reject(error);
      });

      stream.on('finish', () => {
        console.log('File uploaded with success');
        resolve(fileUpload.publicUrl());
      });

      stream.end(file.buffer);
    });
  }
}
