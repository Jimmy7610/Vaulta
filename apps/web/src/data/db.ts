import { openDB, type DBSchema, type IDBPDatabase } from "idb";

export type Entry = {
    id: string;
    text: string;
    createdAt: number;
    meta?: {
        themes: string[];
        tone: string;
        type: string;
        summary: string;
    };
};

interface VaultaDB extends DBSchema {
    entries: {
        key: string;
        value: Entry;
        indexes: { "by-createdAt": number };
    };
}

let _db: Promise<IDBPDatabase<VaultaDB>> | null = null;

export function getDB() {
    if (!_db) {
        _db = openDB<VaultaDB>("vaulta-db", 1, {
            upgrade(db) {
                const store = db.createObjectStore("entries", { keyPath: "id" });
                store.createIndex("by-createdAt", "createdAt");
            }
        });
    }
    return _db;
}

export async function addEntry(entry: Entry) {
    const db = await getDB();
    await db.put("entries", entry);
}

export async function listEntriesNewestFirst(limit = 60): Promise<Entry[]> {
    const db = await getDB();
    const tx = db.transaction("entries", "readonly");
    const index = tx.store.index("by-createdAt");
    const result: Entry[] = [];

    // iterate backwards (newest first)
    let cursor = await index.openCursor(null, "prev");
    while (cursor && result.length < limit) {
        result.push(cursor.value);
        cursor = await cursor.continue();
    }
    await tx.done;
    return result;
}

export async function updateEntry(entry: Entry) {
    const db = await getDB();
    await db.put("entries", entry);
}
