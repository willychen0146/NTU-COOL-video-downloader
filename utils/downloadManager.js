// utils/downloadManager.js

export class DownloadManager {
  constructor(api, logger) {
    this.api = api;
    this.logger = logger;
  }

  async downloadVideo(url) {
    if (!url) {
      throw new Error("No video URL found.");
    }

    try {
      const response = await fetch(url);
      const data = await response.json();
      const downloadUrl = this.getDownloadUrl(data);

      if (!downloadUrl) {
        throw new Error("No suitable video URL found.");
      }

      const uniqueFilename = `video_${new Date().getTime()}.mp4`;
      const downloadId = await this.initiateDownload(downloadUrl, uniqueFilename);

      if (downloadId) {
        return { success: true };
      } else {
        throw new Error("Download initiation failed.");
      }
    } catch (error) {
      this.logger.error('Error in downloadVideo:', error);
      throw error;
    }
  }

  getDownloadUrl(data) {
    if (data.sourceUri && data.sourceUri.includes('.mp4')) {
      return data.sourceUri;
    } else if (data.altSourceUri && data.altSourceUri.includes('.mp4')) {
      return data.altSourceUri;
    } else if (data.sourceUri && data.sourceUri.includes('manifest.mpd')) {
      return data.altSourceUri;
    }
    return null;
  }

  initiateDownload(url, filename) {
    return new Promise((resolve, reject) => {
      this.api.downloads.download({
        url: url,
        filename: filename
      }, (downloadId) => {
        if (downloadId) {
          resolve(downloadId);
        } else {
          reject(new Error("Download initiation failed."));
        }
      });
    });
  }
}