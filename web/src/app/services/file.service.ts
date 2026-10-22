import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UploadResponse, FileType } from '../models/upload-response.model';
import { EnvironmentService } from './environment.service';

@Injectable({
  providedIn: 'root'
})
export class FileService {
  private http = inject(HttpClient);
  private env = inject(EnvironmentService);

  uploadProfilePicture(userId: string, file: File): Observable<UploadResponse> {
    const formData = new FormData();
    formData.append('file', file);

    const url = this.env.fileEndpoints.upload(FileType.ProfilePicture, userId);

    return this.http.post<UploadResponse>(url, formData);
  }

  uploadEquipmentPicture(equipmentId: string, file: File): Observable<UploadResponse> {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post<UploadResponse>(
      this.env.fileEndpoints.upload(FileType.EquipmentPicture, equipmentId),
      formData
    );
  }

  uploadDocument(id: string, file: File): Observable<UploadResponse> {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post<UploadResponse>(
      this.env.fileEndpoints.upload(FileType.Document, id),
      formData
    );
  }

  getProfilePictureUrl(userId: string): Observable<UploadResponse> {
    return this.http.get<UploadResponse>(
      this.env.fileEndpoints.getPresignedUrl(FileType.ProfilePicture, userId)
    );
  }

  getEquipmentPictureUrl(equipmentId: string): Observable<UploadResponse> {
    return this.http.get<UploadResponse>(
      this.env.fileEndpoints.getPresignedUrl(FileType.EquipmentPicture, equipmentId)
    );
  }

  getDocumentUrl(id: string): Observable<UploadResponse> {
    return this.http.get<UploadResponse>(
      this.env.fileEndpoints.getPresignedUrl(FileType.Document, id)
    );
  }

  validateFile(
    file: File, 
    allowedTypes: string[] = ['image/jpeg', 'image/png', 'image/jpg'], 
    maxSizeInMB: number = 5
  ): { isValid: boolean; error?: string } {
    if (!allowedTypes.includes(file.type)) {
      return {
        isValid: false,
        error: `Tipo de arquivo não permitido. Tipos aceitos: ${allowedTypes.join(', ')}`
      };
    }

    const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
    if (file.size > maxSizeInBytes) {
      return {
        isValid: false,
        error: `Arquivo muito grande. Tamanho máximo: ${maxSizeInMB}MB`
      };
    }

    return { isValid: true };
  }
}
