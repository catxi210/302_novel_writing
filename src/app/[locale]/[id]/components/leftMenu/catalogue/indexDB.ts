
import { IChapter } from '../../../interface';
import { openDB, DBSchema, IDBPDatabase } from 'idb';

const DB_NAME = 'ai-novel-creation-chapter-database';
const STORE_NAME = 'ai-novel-creation-chapter-store';

interface MyDB extends DBSchema {
    [STORE_NAME]: {
        key: number;
        value: IChapter;
        indexes: { 'by-parentId': number }; // 定义 parentId 索引
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

export async function addChapter(data: IChapter): Promise<IChapter[]> {
    if (data?.id && data.id > 0) {
        return await updateChapter(data.id, { ...data })
    }
    delete data.id;
    const db = await getDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    await store.add({ ...data });
    await tx.done;
    return getChapterListByParentId(data.parentId);
}

export async function updateChapter(id: number, data: Partial<IChapter>): Promise<IChapter[]> {
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
    return await getChapterListByParentId(updatedRecord.parentId);
}

export async function deleteChapters(ids: number[], parentId: number): Promise<IChapter[]> {
    const db = await getDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);

    for (const id of ids) {
        await store.delete(id);
    }

    await tx.done;
    return await getChapterListByParentId(parentId);
}

export async function deleteChapterByParentId(parentId: number): Promise<void> {
    const allRecords = await getChapterListByParentId(parentId);
    const db = await getDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);

    for (const record of allRecords) {
        await store.delete(record.id!); // 确保 id 存在
    }

    await tx.done;
}

export async function getChapterListByParentId(parentId: number): Promise<IChapter[]> {
    const db = await getDB();
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    // 使用索引查询
    const index = store.index('by-parentId');
    const allRecords = await index.getAll(Number(parentId));
    return allRecords;
}

export async function getChapterList(): Promise<IChapter[]> {
    const db = await getDB();
    const store = db.transaction(STORE_NAME, 'readonly').objectStore(STORE_NAME);
    const allRecords = await store.getAll();
    return allRecords;
}

export async function batchUpdateChapters(updates: IChapter[], parentId: number): Promise<IChapter[]> {
    const db = await getDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);

    for (const update of updates) {
        const existingRecord = await store.get(update.id!);
        if (existingRecord) {
            const updatedRecord = { ...existingRecord, ...update };
            await store.put(updatedRecord);
        }
    }

    await tx.done;
    return await getChapterListByParentId(parentId);
}


export async function getAllChaptersList(): Promise<IChapter[]> {
    const db = await getDB();
    const store = db.transaction(STORE_NAME, 'readonly').objectStore(STORE_NAME);
    const allRecords = await store.getAll();
    return allRecords;
}
