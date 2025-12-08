// Firebase Entities Adapter
// This replaces base44.entities with Firestore operations

import { 
  getCollection, 
  getDocument, 
  setDocument, 
  updateDocument, 
  deleteDocument,
  queryDocuments 
} from '@/firebase/firestore';

/**
 * Generic entity class that mimics base44.entities structure
 */
class FirebaseEntity {
  constructor(collectionName) {
    this.collectionName = collectionName;
  }

  /**
   * Get all documents (list)
   */
  async list() {
    const result = await getCollection(this.collectionName);
    return result.success ? result.data : [];
  }

  /**
   * Get a single document by ID
   */
  async get(id) {
    const result = await getDocument(this.collectionName, id);
    return result.success ? result.data : null;
  }

  /**
   * Filter documents (similar to base44.entities.filter)
   */
  async filter(filters = {}) {
    const result = await queryDocuments(this.collectionName, filters);
    return result.success ? result.data : [];
  }

  /**
   * Create a new document
   */
  async create(data) {
    // Generate ID if not provided
    const id = data.id || `${this.collectionName}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const result = await setDocument(this.collectionName, id, {
      ...data,
      id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
    if (result.success) {
      return { id, ...data };
    }
    throw new Error(result.error || 'Failed to create document');
  }

  /**
   * Update an existing document
   */
  async update(id, data) {
    const result = await updateDocument(this.collectionName, id, {
      ...data,
      updated_at: new Date().toISOString()
    });
    if (result.success) {
      const doc = await this.get(id);
      return doc;
    }
    throw new Error(result.error || 'Failed to update document');
  }

  /**
   * Delete a document
   */
  async delete(id) {
    const result = await deleteDocument(this.collectionName, id);
    if (!result.success) {
      throw new Error(result.error || 'Failed to delete document');
    }
    return result;
  }
}

// Create entity instances
export const Mentee = new FirebaseEntity('mentees');
export const Mentor = new FirebaseEntity('mentors');
export const Admin = new FirebaseEntity('admins');
export const Session = new FirebaseEntity('sessions');



