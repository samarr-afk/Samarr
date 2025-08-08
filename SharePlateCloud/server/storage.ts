import { type File, type InsertFile } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getFile(id: string): Promise<File | undefined>;
  getFileByCode(code: string): Promise<File | undefined>;
  getFileByLink(link: string): Promise<File | undefined>;
  getFileByIdentifier(identifier: string): Promise<File | undefined>;
  createFile(file: InsertFile): Promise<File>;
  deleteFile(id: string): Promise<boolean>;
  getAllFiles(): Promise<File[]>;
  getStats(): Promise<{
    totalFiles: number;
    totalStorage: number;
    todayUploads: number;
    activeLinks: number;
  }>;
}

export class MemStorage implements IStorage {
  private files: Map<string, File>;

  constructor() {
    this.files = new Map();
  }

  async getFile(id: string): Promise<File | undefined> {
    return this.files.get(id);
  }

  async getFileByCode(code: string): Promise<File | undefined> {
    return Array.from(this.files.values()).find(
      (file) => file.shareCode === code,
    );
  }

  async getFileByLink(link: string): Promise<File | undefined> {
    return Array.from(this.files.values()).find(
      (file) => file.shareLink === link,
    );
  }

  async getFileByIdentifier(identifier: string): Promise<File | undefined> {
    // Check if it's a 6-character code
    if (identifier.length === 6 && /^[A-Z0-9]+$/.test(identifier)) {
      return this.getFileByCode(identifier);
    }
    
    // Check if it's a full link
    if (identifier.startsWith('http')) {
      return this.getFileByLink(identifier);
    }
    
    // Check if it's just the ID part of a link
    const linkPattern = /\/d\/([a-zA-Z0-9]+)$/;
    const match = identifier.match(linkPattern);
    if (match) {
      const linkId = match[1];
      return Array.from(this.files.values()).find(
        (file) => file.shareLink.endsWith(`/d/${linkId}`)
      );
    }
    
    return undefined;
  }

  async createFile(insertFile: InsertFile): Promise<File> {
    const id = randomUUID();
    const now = new Date();
    const file: File = { 
      ...insertFile, 
      id,
      uploadedAt: now
    };
    this.files.set(id, file);
    return file;
  }

  async deleteFile(id: string): Promise<boolean> {
    return this.files.delete(id);
  }

  async getAllFiles(): Promise<File[]> {
    return Array.from(this.files.values()).sort(
      (a, b) => b.uploadedAt.getTime() - a.uploadedAt.getTime()
    );
  }

  async getStats(): Promise<{
    totalFiles: number;
    totalStorage: number;
    todayUploads: number;
    activeLinks: number;
  }> {
    const allFiles = Array.from(this.files.values());
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayUploads = allFiles.filter(
      file => file.uploadedAt >= today
    ).length;
    
    const totalStorage = allFiles.reduce(
      (total, file) => total + file.fileSize, 0
    );

    return {
      totalFiles: allFiles.length,
      totalStorage,
      todayUploads,
      activeLinks: allFiles.length, // All files have active links
    };
  }
}

export const storage = new MemStorage();
