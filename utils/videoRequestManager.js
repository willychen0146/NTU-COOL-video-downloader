// utils/videoRequestManager.js

export class VideoRequestManager {
  constructor() {
    this.urls = [];
  }

  addUrl(url) {
    this.urls.push(url);
  }

  getLastUrl() {
    return this.urls.length > 0 ? this.urls[this.urls.length - 1] : null;
  }

  clear() {
    this.urls = [];
  }
}