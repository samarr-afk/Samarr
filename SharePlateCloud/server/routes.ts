import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertFileSchema, retrieveFileSchema, adminLoginSchema } from "@shared/schema";
import multer from "multer";

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 2 * 1024 * 1024 * 1024, // 2GB limit
  },
});

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Upload files endpoint
  app.post("/api/upload", upload.array('files'), async (req, res) => {
    try {
      if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
        return res.status(400).json({ message: "No files uploaded" });
      }

      const uploadedFiles = [];

      for (const file of req.files) {
        // Generate unique identifiers
        const shareCode = generateShareCode();
        const shareLink = generateShareLink();

        // Upload to Telegram
        const telegramResult = await uploadToTelegram(file);

        // Store file metadata
        const fileData = {
          originalName: file.originalname,
          fileName: telegramResult.fileName,
          fileSize: file.size,
          mimeType: file.mimetype,
          shareCode,
          shareLink,
          telegramFileId: telegramResult.fileId,
          telegramMessageId: telegramResult.messageId,
        };

        const savedFile = await storage.createFile(fileData);
        uploadedFiles.push(savedFile);
      }

      res.json({ 
        message: "Files uploaded successfully",
        files: uploadedFiles 
      });
    } catch (error) {
      console.error("Upload error:", error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Upload failed"
      });
    }
  });

  // Retrieve file endpoint
  app.post("/api/retrieve", async (req, res) => {
    try {
      const { identifier } = retrieveFileSchema.parse(req.body);
      
      const file = await storage.getFileByIdentifier(identifier);
      
      if (!file) {
        return res.status(404).json({ message: "File not found" });
      }

      // Generate download link from Telegram
      const downloadLink = await getDownloadLink(file.telegramFileId);

      res.json({
        file: {
          id: file.id,
          originalName: file.originalName,
          fileSize: file.fileSize,
          mimeType: file.mimeType,
          uploadedAt: file.uploadedAt,
          downloadLink,
        }
      });
    } catch (error) {
      console.error("Retrieve error:", error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Failed to retrieve file"
      });
    }
  });

  // Admin login endpoint
  app.post("/api/admin/login", async (req, res) => {
    try {
      const { password } = adminLoginSchema.parse(req.body);
      
      if (password !== "samarkotwalishere") {
        return res.status(401).json({ message: "Invalid password" });
      }

      res.json({ message: "Login successful" });
    } catch (error) {
      res.status(400).json({ message: "Invalid request" });
    }
  });

  // Admin stats endpoint
  app.get("/api/admin/stats", async (req, res) => {
    try {
      const stats = await storage.getStats();
      res.json(stats);
    } catch (error) {
      console.error("Stats error:", error);
      res.status(500).json({ message: "Failed to get stats" });
    }
  });

  // Admin files list endpoint
  app.get("/api/admin/files", async (req, res) => {
    try {
      const files = await storage.getAllFiles();
      res.json({ files });
    } catch (error) {
      console.error("Files list error:", error);
      res.status(500).json({ message: "Failed to get files" });
    }
  });

  // Admin delete file endpoint
  app.delete("/api/admin/files/:id", async (req, res) => {
    try {
      const { id } = req.params;
      
      const file = await storage.getFile(id);
      if (!file) {
        return res.status(404).json({ message: "File not found" });
      }

      // Delete from Telegram
      await deleteFromTelegram(file.telegramFileId, file.telegramMessageId);
      
      // Delete from storage
      const deleted = await storage.deleteFile(id);
      
      if (deleted) {
        res.json({ message: "File deleted successfully" });
      } else {
        res.status(500).json({ message: "Failed to delete file" });
      }
    } catch (error) {
      console.error("Delete error:", error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Failed to delete file"
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

// Telegram helper functions
function generateShareCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

function generateShareLink(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 12; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  // Get domain from environment or use default
  const domains = process.env.REPLIT_DOMAINS?.split(',') || ['localhost:5000'];
  const domain = domains[0];
  const protocol = domain.includes('localhost') ? 'http' : 'https';
  
  return `${protocol}://${domain}/d/${result}`;
}

async function uploadToTelegram(file: any): Promise<{
  fileId: string;
  messageId: number;
  fileName: string;
}> {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const channelId = process.env.TELEGRAM_CHANNEL_ID;

  if (!botToken || !channelId) {
    throw new Error("Telegram bot token and channel ID are required");
  }

  try {
    const formData = new FormData();
    const blob = new Blob([file.buffer], { type: file.mimetype });
    formData.append('document', blob, file.originalname);
    formData.append('chat_id', channelId);

    console.log(`Uploading to Telegram: ${file.originalname}, size: ${file.size} bytes`);
    console.log(`Using channel ID: ${channelId}`);
    console.log(`Using bot token: ${botToken ? botToken.slice(0, 10) + '...' : 'NOT SET'}`);
    
    const response = await fetch(`https://api.telegram.org/bot${botToken}/sendDocument`, {
      method: 'POST',
      body: formData,
    });

    console.log(`Telegram API response status: ${response.status}`);
    const responseText = await response.text();
    console.log(`Telegram API response:`, responseText);
    
    let result;
    try {
      result = JSON.parse(responseText);
    } catch (parseError) {
      console.error("Failed to parse Telegram API response:", responseText);
      throw new Error(`Invalid response from Telegram API`);
    }

    if (!result.ok) {
      console.error("Telegram API error response:", result);
      throw new Error(`Telegram API error: ${result.description || 'Unknown error'}`);
    }

    return {
      fileId: result.result.document.file_id,
      messageId: result.result.message_id,
      fileName: result.result.document.file_name,
    };
  } catch (error) {
    console.error("Telegram upload error:", error);
    throw new Error(`Failed to upload file to Telegram: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

async function getDownloadLink(fileId: string): Promise<string> {
  const botToken = process.env.TELEGRAM_BOT_TOKEN || process.env.BOT_TOKEN || "default_bot_token";

  try {
    const response = await fetch(`https://api.telegram.org/bot${botToken}/getFile?file_id=${fileId}`);
    const result = await response.json();

    if (!result.ok) {
      throw new Error(`Telegram API error: ${result.description}`);
    }

    return `https://api.telegram.org/file/bot${botToken}/${result.result.file_path}`;
  } catch (error) {
    console.error("Telegram download link error:", error);
    throw new Error("Failed to get download link from Telegram");
  }
}

async function deleteFromTelegram(fileId: string, messageId: number): Promise<void> {
  const botToken = process.env.TELEGRAM_BOT_TOKEN || process.env.BOT_TOKEN || "default_bot_token";
  const channelId = process.env.TELEGRAM_CHANNEL_ID || process.env.CHANNEL_ID || "@shareplate_files";

  try {
    const response = await fetch(`https://api.telegram.org/bot${botToken}/deleteMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: channelId,
        message_id: messageId,
      }),
    });

    const result = await response.json();

    if (!result.ok) {
      console.warn(`Failed to delete message from Telegram: ${result.description}`);
    }
  } catch (error) {
    console.warn("Telegram delete error:", error);
  }
}
