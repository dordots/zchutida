// File Upload Utility - Base64 encoding for small files
// Alternative to Firebase Storage when Storage is not available

/**
 * Convert file to base64 string
 */
const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
};

/**
 * Upload file using base64 encoding
 * This stores the file as a data URL in Firestore
 * Note: Suitable for files up to ~1MB. For larger files, consider a cloud storage service.
 */
export const uploadFileBase64 = async (file, path = 'uploads') => {
  try {
    // Check file size (limit to 1MB for base64)
    const maxSize = 1 * 1024 * 1024; // 1MB
    if (file.size > maxSize) {
      return {
        success: false,
        error: 'הקובץ גדול מדי. גודל מקסימלי: 1MB. אנא השתמש בקובץ קטן יותר או דחוס.'
      };
    }

    // Convert to base64
    const base64String = await fileToBase64(file);
    
    // Create a data URL that can be stored in Firestore
    const dataUrl = base64String;
    
    return {
      success: true,
      url: dataUrl,
      file_url: dataUrl, // For compatibility
      fileName: file.name,
      size: file.size,
      type: file.type
    };
  } catch (error) {
    console.error('File upload error:', error);
    return {
      success: false,
      error: error.message || 'שגיאה בהעלאת הקובץ'
    };
  }
};

/**
 * Alternative: Upload to a public file hosting service
 * You can use services like:
 * - imgur.com (for images)
 * - file.io (temporary files)
 * - Or any other file hosting API
 */
export const uploadFileToHosting = async (file, service = 'imgur') => {
  try {
    if (service === 'imgur' && file.type.startsWith('image/')) {
      // Example: Upload to Imgur (requires API key)
      const formData = new FormData();
      formData.append('image', file);
      
      // Note: You'll need to get an Imgur API key from https://api.imgur.com/oauth2/addclient
      const response = await fetch('https://api.imgur.com/3/image', {
        method: 'POST',
        headers: {
          'Authorization': 'Client-ID YOUR_IMGUR_CLIENT_ID' // Replace with your key
        },
        body: formData
      });
      
      const data = await response.json();
      
      if (data.success) {
        return {
          success: true,
          url: data.data.link,
          file_url: data.data.link
        };
      } else {
        throw new Error(data.data?.error || 'Upload failed');
      }
    }
    
    // For other file types or services, implement accordingly
    throw new Error('Service not implemented');
  } catch (error) {
    return {
      success: false,
      error: error.message || 'שגיאה בהעלאת הקובץ'
    };
  }
};



