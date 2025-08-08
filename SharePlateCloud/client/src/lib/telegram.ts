// Telegram Bot API helper functions
export const TelegramAPI = {
  async uploadFile(file: File, botToken: string, channelId: string) {
    const formData = new FormData();
    formData.append('document', file);
    formData.append('chat_id', channelId);

    const response = await fetch(`https://api.telegram.org/bot${botToken}/sendDocument`, {
      method: 'POST',
      body: formData,
    });

    const result = await response.json();

    if (!result.ok) {
      throw new Error(`Telegram API error: ${result.description}`);
    }

    return {
      fileId: result.result.document.file_id,
      messageId: result.result.message_id,
      fileName: result.result.document.file_name,
    };
  },

  async getDownloadLink(fileId: string, botToken: string) {
    const response = await fetch(`https://api.telegram.org/bot${botToken}/getFile?file_id=${fileId}`);
    const result = await response.json();

    if (!result.ok) {
      throw new Error(`Telegram API error: ${result.description}`);
    }

    return `https://api.telegram.org/file/bot${botToken}/${result.result.file_path}`;
  },

  async deleteMessage(messageId: number, botToken: string, channelId: string) {
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
      throw new Error(`Telegram API error: ${result.description}`);
    }

    return result.result;
  },
};

export const generateShareCode = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

export const generateShareLink = (baseUrl: string): string => {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 12; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `${baseUrl}/d/${result}`;
};
