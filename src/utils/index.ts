


export function createPageUrl(pageName: string) {
    return '/' + pageName.toLowerCase().replace(/ /g, '-');
}

/**
 * Open a file URL in a new window/tab
 * Handles both regular URLs and data URLs (base64)
 */
export function openFileUrl(url: string, fileName?: string) {
  if (!url) return;
  
  // If it's a data URL, create a blob and open it
  if (url.startsWith('data:')) {
    try {
      // Extract MIME type and base64 data
      const commaIndex = url.indexOf(',');
      if (commaIndex === -1) {
        throw new Error('Invalid data URL format');
      }
      
      const header = url.substring(0, commaIndex);
      let base64Data = url.substring(commaIndex + 1);
      
      // Clean base64 data (remove whitespace and URL encoding)
      base64Data = base64Data.replace(/\s/g, '');
      
      const mimeMatch = header.match(/data:([^;]+)/);
      const mimeType = mimeMatch ? mimeMatch[1] : 'application/octet-stream';
      
      // Convert base64 to blob
      const byteCharacters = atob(base64Data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: mimeType });
      
      // Create object URL and open it
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      if (fileName) {
        link.download = fileName;
      }
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up the blob URL after a short delay
      setTimeout(() => URL.revokeObjectURL(blobUrl), 100);
    } catch (error) {
      console.error('Error opening data URL:', error);
      // Fallback: try to open directly in a new window
      try {
        const newWindow = window.open('', '_blank', 'noopener,noreferrer');
        if (newWindow) {
          newWindow.document.write(`
            <html>
              <head><title>${fileName || 'File'}</title></head>
              <body style="margin:0;padding:0;display:flex;justify-content:center;align-items:center;min-height:100vh;">
                <iframe src="${url}" style="width:100%;height:100vh;border:none;"></iframe>
              </body>
            </html>
          `);
        }
      } catch (fallbackError) {
        console.error('Fallback also failed:', fallbackError);
        alert('לא ניתן לפתוח את הקובץ. נסה להוריד אותו ידנית.');
      }
    }
  } else {
    // Regular URL - open directly
    window.open(url, '_blank', 'noopener,noreferrer');
  }
}