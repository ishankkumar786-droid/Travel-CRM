import Papa from 'papaparse';
import * as XLSX from 'xlsx';

import { logger } from '@/lib/logger';
import { generateAgencyCode, generateAgencySlug, Agency } from '@/models/agency.model';
import { ImportJob } from '@/models/import-job.model';
import { agencyRepository } from '@/repositories/agency.repository';

import type { ImportFormat } from '@travel/types';

interface ParsedRow {
  name?: string;
  ownerName?: string;
  email?: string;
  phone?: string;
  city?: string;
  state?: string;
  country?: string;
  website?: string;
  services?: string;
  tags?: string;
  [key: string]: unknown;
}

class ImportService {
  async createJob(
    name: string,
    format: ImportFormat,
    fileBuffer: Buffer,
    conflictStrategy: 'skip' | 'merge' | 'overwrite',
    userId?: string,
  ) {
    const rows = this.parse(format, fileBuffer);
    const job = await ImportJob.create({
      name,
      format,
      conflictStrategy,
      totalRows: rows.length,
      status: 'pending',
      ...(userId && { createdBy: userId }),
    });

    // Store raw data for preview (not full processing yet)
    await ImportJob.findByIdAndUpdate(job._id, { $set: { rawData: rows } }).exec();

    return { jobId: job._id.toString(), preview: rows.slice(0, 5), totalRows: rows.length };
  }

  async processJob(jobId: string, userId?: string): Promise<void> {
    const job = await ImportJob.findById(jobId).select('+rawData').exec();
    if (!job) return;

    await ImportJob.findByIdAndUpdate(jobId, { $set: { status: 'processing' } }).exec();

    const rows = (job.rawData as ParsedRow[]) ?? [];
    let success = 0,
      errors = 0,
      skipped = 0;
    const errorList: Array<{ row: number; message: string }> = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      if (!row) continue;
      try {
        if (!row.name || !row.email) throw new Error('Missing required fields: name, email');

        const exists = await agencyRepository.emailExists(row.email.toLowerCase());
        const conflictStrategy = job.conflictStrategy as string;

        if (exists) {
          if (conflictStrategy === 'skip') {
            skipped++;
            continue;
          }
          // merge/overwrite handled below
        }

        const code = await generateAgencyCode();
        const slug = generateAgencySlug(String(row.name), code);

        await Agency.create({
          agencyCode: code,
          slug,
          name: row.name,
          ownerName: row.ownerName ?? 'Unknown',
          email: row.email.toLowerCase(),
          phone: row.phone ?? '+10000000000',
          address: {
            city: row.city ?? 'Unknown',
            state: row.state ?? 'Unknown',
            country: row.country ?? 'India',
          },
          website: row.website,
          services: row.services ? String(row.services).split('|').filter(Boolean) : [],
          tags: row.tags ? String(row.tags).split('|').filter(Boolean) : [],
          status: 'pending',
          verificationStatus: 'unverified',
          marketplaceStatus: 'unlisted',
          profileCompletion: 0,
          ...(userId && { createdBy: userId }),
        });
        success++;
      } catch (err) {
        errors++;
        errorList.push({
          row: i + 1,
          message: err instanceof Error ? err.message : 'Unknown error',
        });
      }

      await ImportJob.findByIdAndUpdate(jobId, { $set: { processedRows: i + 1 } }).exec();
    }

    await ImportJob.findByIdAndUpdate(jobId, {
      $set: {
        status: 'completed',
        successRows: success,
        errorRows: errors,
        skippedRows: skipped,
        importErrors: errorList,
        completedAt: new Date(),
      },
    }).exec();

    logger.info('import: job completed', { jobId, success, errors, skipped });
  }

  async getJobs(userId?: string) {
    const filter = userId ? { createdBy: userId } : {};
    return ImportJob.find(filter).sort({ createdAt: -1 }).limit(50).exec();
  }

  async getJob(id: string) {
    return ImportJob.findById(id).exec();
  }

  private parse(format: ImportFormat, buffer: Buffer): ParsedRow[] {
    if (format === 'json') {
      return JSON.parse(buffer.toString()) as ParsedRow[];
    }
    if (format === 'csv') {
      const result = Papa.parse<ParsedRow>(buffer.toString(), {
        header: true,
        skipEmptyLines: true,
      });
      return result.data;
    }
    if (format === 'xlsx') {
      const wb = XLSX.read(buffer, { type: 'buffer' });
      const ws = wb.Sheets[wb.SheetNames[0] ?? ''];
      if (!ws) return [];
      return XLSX.utils.sheet_to_json<ParsedRow>(ws);
    }
    return [];
  }
}

export const importService = new ImportService();
