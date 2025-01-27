import { Injectable } from '@nestjs/common';

import { FirebaseStorageService } from 'src/firebase/firebaseStorage.service';

@Injectable()
export class FilesService {
  constructor(private firebaseStorage: FirebaseStorageService) {}

  async uploadOneFile(file: Express.Multer.File): Promise<string> {
    const fileName = Date.now() + '_' + file.originalname;

    return this.firebaseStorage.uploadFile(file, fileName);
  }
}
