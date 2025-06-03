

import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { ICharacter } from '@/app/[locale]/[id]/interface';

const DB_NAME = 'ai-novel-creation-character-database';
const STORE_NAME = 'ai-novel-creation-character-store';

interface MyDB extends DBSchema {
    [STORE_NAME]: {
        key: number;
        value: ICharacter;
        indexes: { 'by-parentId': number };
    };
}

export async function initDB(): Promise<IDBPDatabase<MyDB>> {
    const db = await openDB<MyDB>(DB_NAME, 1, {
        upgrade(db) {
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                const store = db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
                // 创建 parentId 索引
                store.createIndex('by-parentId', 'parentId', { unique: false });
            }
        },
    });
    return db;
}

let db: IDBPDatabase<MyDB> | null = null;

async function getDB(): Promise<IDBPDatabase<MyDB>> {
    if (!db) {
        db = await initDB();
    }
    return db;
}

export async function saveCharacter(data: ICharacter): Promise<ICharacter[]> {
    const db = await getDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    await store.add({ ...data });
    await tx.done;
    return getCharacterListByParentId(data.parentId);
}

export async function updateCharacter(id: number, data: Partial<ICharacter>): Promise<ICharacter[]> {
    const db = await getDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const existingRecord = await store.get(id);
    if (!existingRecord) {
        throw new Error(`Record with id ${id} not found`);
    }
    const updatedRecord = { ...existingRecord, ...data };
    await store.put(updatedRecord);
    await tx.done;
    return await getCharacterListByParentId(updatedRecord.parentId);
}


export async function deleteCharacter(id: number, parentId: number): Promise<ICharacter[]> {
    const db = await getDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    await store.delete(id);
    await tx.done;
    return await getCharacterListByParentId(parentId);
}


export async function deleteCharacterByParentId(parentId: number): Promise<void> {
    const allRecords = await getCharacterListByParentId(parentId);
    const db = await getDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);

    for (const record of allRecords) {
        await store.delete(record.id!); // 确保 id 存在
    }

    await tx.done;
}

export async function getCharacterListByParentId(parentId: number): Promise<ICharacter[]> {
    const db = await getDB();
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const index = store.index('by-parentId');
    const allRecords = await index.getAll(Number(parentId));
    return allRecords;
}

export async function saveBatchCharacters(characters: ICharacter[]): Promise<ICharacter[]> {
    const db = await getDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);

    for (const character of characters) {
        await store.add({ ...character });
    }

    await tx.done;

    // Assuming all characters in the batch have the same parentId
    return getCharacterListByParentId(characters[0].parentId);
}
