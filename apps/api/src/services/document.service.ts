import fs from 'fs';
import path from 'path';

import { NotFoundError } from '@/errors';
import { logger } from '@/lib/logger';
import { logAudit } from '@/models/audit-log.model';
import { AgencyDocument } from '@/models/document.model';

import type { DocumentDTO, DocumentStatus, DocumentType } from '@travel/types';

const UPLOAD_DIR = path.join(process.cwd(), 'uploads');

class DocumentService {
  async upload(
    agencyId: string,
    file: Express.Multer.File,
    type: DocumentType,
    userId?: string,
    options?: { expiryDate?: string; remarks?: string },
  ): Promise<DocumentDTO> {
    // Store local file reference (Cloudinary can be plugged in here)
    const fileUrl = `/uploads/${file.filename}`;

    const existing = await AgencyDocument.findOne({ agencyId, type }).sort({ version: -1 }).exec();
    const version = existing ? existing.version + 1 : 1;

    const doc = await AgencyDocument.create({
      agencyId,
      type,
      name: `${type}_v${version}`,
      originalName: file.originalname,
      url: fileUrl,
      mimeType: file.mimetype,
      sizeBytes: file.size,
      status: 'pending',
      version,
      ...(options?.expiryDate && { expiryDate: new Date(options.expiryDate) }),
      ...(options?.remarks && { remarks: options.remarks }),
      ...(userId && { uploadedBy: userId }),
    });

    if (userId) {
      await logAudit({
        resource: 'Document',
        resourceId: doc._id.toString(),
        action: 'create',
        who: userId,
      });
    }

    logger.info('document: uploaded', { agencyId, type, version });
    return doc.toDTO();
  }

  async listByAgency(agencyId: string): Promise<DocumentDTO[]> {
    const docs = await AgencyDocument.find({ agencyId }).sort({ type: 1, version: -1 }).exec();
    return docs.map((d) => d.toDTO());
  }

  async getById(id: string): Promise<DocumentDTO> {
    const doc = await AgencyDocument.findById(id).exec();
    if (!doc) throw new NotFoundError('Document');
    return doc.toDTO();
  }

  async updateStatus(
    id: string,
    status: DocumentStatus,
    userId: string,
    remarks?: string,
  ): Promise<DocumentDTO> {
    const doc = await AgencyDocument.findById(id).exec();
    if (!doc) throw new NotFoundError('Document');

    doc.status = status;
    if (remarks) doc.remarks = remarks;
    if (status === 'verified') {
      doc.verifiedBy = userId as never;
      doc.verifiedAt = new Date();
    }
    await doc.save();

    await logAudit({
      resource: 'Document',
      resourceId: id,
      action: 'update',
      who: userId,
      after: { status },
    });
    return doc.toDTO();
  }

  async delete(id: string, userId: string): Promise<void> {
    const doc = await AgencyDocument.findById(id).exec();
    if (!doc) throw new NotFoundError('Document');
    doc.deletedAt = new Date();
    await doc.save();
    await logAudit({ resource: 'Document', resourceId: id, action: 'delete', who: userId });
  }

  ensureUploadDir(): void {
    if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  }
}

export const documentService = new DocumentService();
