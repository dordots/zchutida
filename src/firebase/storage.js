// File Upload Service
// Using base64 encoding as alternative to Firebase Storage
// Files are converted to base64 and stored as data URLs in Firestore
// Note: Suitable for files up to ~1MB. For larger files, consider a cloud storage service.

import { uploadFileBase64 } from '../utils/fileUpload';

/**
 * Upload a file using base64 encoding
 * Files are stored as data URLs in Firestore
 * Suitable for files up to ~1MB
 */
export const uploadFile = async (file, path = 'uploads') => {
  return await uploadFileBase64(file, path);
};

/**
 * Delete a file (placeholder - files are stored in Firestore as base64)
 * In this implementation, files are stored directly in documents, so deletion
 * is handled by updating the document field to null/empty
 */
export const deleteFile = async (filePath) => {
  // Files are stored as data URLs in Firestore, so deletion is handled
  // by removing the field from the document
  return { success: true };
};

/**
 * Get file URL (for base64, the URL is the data URL itself)
 */
export const getFileURL = async (filePath) => {
  // If filePath is already a data URL, return it
  if (filePath && (filePath.startsWith('data:') || filePath.startsWith('http'))) {
    return { success: true, url: filePath };
  }
  return { success: false, error: 'File not found' };
};

