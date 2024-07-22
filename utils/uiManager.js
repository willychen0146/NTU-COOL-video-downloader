// utils/uiManager.js

export class UIManager {
  constructor() {
    this.button = document.getElementById('downloadBtn');
    this.status = document.getElementById('status');
    this.downloadText = document.getElementById('downloadText');
    this.loadingImg = document.getElementById('loadingImg');
  }

  showLoading() {
    this.button.classList.add('hidden');
    this.loadingImg.classList.remove('hidden');
    this.downloadText.innerHTML = 'Downloading...';
  }

  showSuccess() {
    this.loadingImg.classList.remove('hidden');
    this.downloadText.innerHTML = 'Download successful!';
  }

  showError(message) {
    this.status.innerHTML = `<i class="fas fa-solid fa-skull"></i> <br> ${message}`;
    this.loadingImg.classList.add('hidden');
  }
}