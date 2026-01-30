import Dexie, { type EntityTable } from 'dexie';

export interface TripEntry {
  id?: number;
  date: string; // ISO string YYYY-MM-DD
  timestamp: number; // For sorting
  odometer: number;
  description: string;
  photo: string; // Base64 string for simplicity in this demo, or Blob
}

const db = new Dexie('MileageTrackerDB') as Dexie & {
  trips: EntityTable<TripEntry, 'id'>;
};

// Schema definition
db.version(1).stores({
  trips: '++id, date, timestamp, odometer, *description' // *description for multi-word search if needed, but simple filtering works too
});

export { db };
