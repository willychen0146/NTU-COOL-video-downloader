// popup.js

document.getElementById('downloadBtn').addEventListener('click', function() {
  const button = this;
  const status = document.getElementById('status');
  const downloadText = document.getElementById('downloadText');
  const loadingImg = document.getElementById('loadingImg');

  // Hide button
  button.classList.add('hidden');

  chrome.runtime.sendMessage({action: "triggerDownload"}, function(response) {
    if (response.success) {
      // Show loading image
      loadingImg.classList.remove('hidden');
      downloadText.innerHTML = 'Downloading...';

      // Close the popup after 3 seconds
      setTimeout(() => window.close(), 2000);
    } else {
      // If download failed, show error and button, hide loading image
      status.innerHTML = '<i class="fas fa-solid fa-skull"></i> <br> Download Failed';
      loadingImg.classList.add('hidden');
      // Optionally, close the popup after a delay
      setTimeout(() => window.close(), 2000);
    }
  });
});