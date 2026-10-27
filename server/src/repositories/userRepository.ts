import { getDatabaseRef } from '../config/firebase.js';

export interface FirebaseUser {
  id: string;
  email: string;
  passwordHash?: string;
  googleId?: string;
  displayName: string;
  photoURL?: string;
  preferences?: {
    theme?: 'light' | 'dark' | 'system';
    currency?: string;
    notificationsEnabled?: boolean;
  };
  createdAt: string;
  updatedAt: string;
}

function encodeEmailKey(email: string): string {
  return Buffer.from(email.toLowerCase().trim()).toString('hex');
}

export class UserRepository {
  private static getDb() {
    return getDatabaseRef();
  }

  static async findById(userId: string): Promise<FirebaseUser | null> {
    try {
      const db = this.getDb();
      const snapshot = await db.ref(`users/${userId}/profile`).once('value');
      const val = snapshot.val();
      if (!val) return null;
      return { ...val, id: userId };
    } catch (err) {
      console.error(`Error finding user by id (${userId}):`, err);
      return null;
    }
  }

  static async findByEmail(email: string): Promise<FirebaseUser | null> {
    try {
      const db = this.getDb();
      const encodedEmail = encodeEmailKey(email);
      const indexSnap = await db.ref(`indexes/usersByEmail/${encodedEmail}`).once('value');
      const userId = indexSnap.val();
      if (!userId) return null;
      return this.findById(userId);
    } catch (err) {
      console.error(`Error finding user by email (${email}):`, err);
      return null;
    }
  }

  static async findByGoogleId(googleId: string): Promise<FirebaseUser | null> {
    try {
      const db = this.getDb();
      const indexSnap = await db.ref(`indexes/usersByGoogleId/${googleId}`).once('value');
      const userId = indexSnap.val();
      if (!userId) return null;
      return this.findById(userId);
    } catch (err) {
      console.error(`Error finding user by googleId (${googleId}):`, err);
      return null;
    }
  }

  static async create(data: {
    email: string;
    passwordHash?: string;
    googleId?: string;
    displayName: string;
    photoURL?: string;
  }): Promise<FirebaseUser> {
    const db = this.getDb();
    const userId = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const now = new Date().toISOString();

    const userRecord: Omit<FirebaseUser, 'id'> = {
      email: data.email.toLowerCase().trim(),
      passwordHash: data.passwordHash,
      googleId: data.googleId,
      displayName: data.displayName.trim(),
      photoURL: data.photoURL || '',
      preferences: {
        theme: 'system',
        currency: 'INR',
        notificationsEnabled: true,
      },
      createdAt: now,
      updatedAt: now,
    };

    const updates: Record<string, any> = {};
    updates[`users/${userId}/profile`] = JSON.parse(JSON.stringify(userRecord));

    const encodedEmail = encodeEmailKey(userRecord.email);
    updates[`indexes/usersByEmail/${encodedEmail}`] = userId;

    if (data.googleId) {
      updates[`indexes/usersByGoogleId/${data.googleId}`] = userId;
    }

    await db.ref().update(updates);

    return { ...userRecord, id: userId };
  }

  static async update(userId: string, updates: Partial<FirebaseUser>): Promise<FirebaseUser | null> {
    const db = this.getDb();
    const existing = await this.findById(userId);
    if (!existing) return null;

    const { id: _ignoreId, ...rest } = existing;
    const updatedData = JSON.parse(
      JSON.stringify({
        ...rest,
        ...updates,
        updatedAt: new Date().toISOString(),
      })
    );

    await db.ref(`users/${userId}/profile`).update(updatedData);
    return { ...updatedData, id: userId };
  }

  static async delete(userId: string): Promise<boolean> {
    const db = this.getDb();
    const existing = await this.findById(userId);
    if (!existing) return false;

    const updates: Record<string, any> = {};
    updates[`users/${userId}`] = null;

    const encodedEmail = encodeEmailKey(existing.email);
    updates[`indexes/usersByEmail/${encodedEmail}`] = null;

    if (existing.googleId) {
      updates[`indexes/usersByGoogleId/${existing.googleId}`] = null;
    }

    await db.ref().update(updates);
    return true;
  }
}
