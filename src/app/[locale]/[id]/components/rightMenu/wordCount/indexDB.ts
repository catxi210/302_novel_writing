import { openDB, DBSchema, IDBPDatabase } from 'idb';
import dayjs from 'dayjs';

const DB_NAME = 'ai-novel-creation-wordCount-database';
const STORE_NAME = 'ai-novel-creation-wordCount-store';

interface IWordCount {
    id?: number;
    time: string;
    wordCount: number;
}

interface MyDB extends DBSchema {
    [STORE_NAME]: {
        key: number;
        value: IWordCount;
        indexes: {
            'time': string;
        };
    };
}

export async function initDB(): Promise<IDBPDatabase<MyDB>> {
    const db = await openDB<MyDB>(DB_NAME, 1, {
        upgrade(db) {
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                const store = db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
                store.createIndex('time', 'time', { unique: true });
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

export async function getWordCountData(): Promise<IWordCount> {
    const db = await getDB();
    const time = dayjs().format('YYYY-MM-DD');
    const existingEntry = await db.getFromIndex(STORE_NAME, 'time', time);
    if (!existingEntry) {
        const id = await db.add(STORE_NAME, { time, wordCount: 0 });
        return { id, time, wordCount: 0 }
    } else {
        return existingEntry;
    }
}

export async function deleteWordCountData(id: number): Promise<void> {
    const db = await getDB();
    await db.delete(STORE_NAME, id);
}

export async function updateWordCountData(wordCount: number, type: 7 | 30): Promise<{ time: string; wordCount: number }[]> {
    const db = await getDB();
    const time = dayjs().format('YYYY-MM-DD');
    const existingEntry = await db.getFromIndex(STORE_NAME, 'time', time);

    if (existingEntry) {
        const updatedEntry = { ...existingEntry, wordCount };
        await db.put(STORE_NAME, updatedEntry);
        return await getData(type)
    }
    return await getData(type)
}

export async function getData(type: 7 | 30): Promise<Array<{ time: string; wordCount: number }>> {
    const db = await getDB();
    const endDate = dayjs();
    const startDate = endDate.subtract(type, 'day');

    const data = await db.getAll(STORE_NAME);
    return data
        .filter(item => {
            const itemDate = dayjs(item.time);
            return itemDate.isAfter(startDate) && itemDate.isBefore(endDate) || itemDate.isSame(endDate);
        })
        .map(({ time, wordCount }) => ({ time, wordCount }));
}
