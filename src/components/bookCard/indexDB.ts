import dayjs from 'dayjs'
import { v4 as uuidV4 } from 'uuid';
import { IBookCard } from './interface';
import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { deleteChapterByParentId, getAllChaptersList } from '@/app/[locale]/[id]/components/leftMenu/catalogue/indexDB';
import { deleteCharacterByParentId } from '@/app/[locale]/[id]/components/rightMenu/AIWriting/components/character/indexDB';

const DB_NAME = 'ai-novel-creation-bookshelf-database';
const STORE_NAME = 'ai-novel-creation-bookshelf-store';

interface MyDB extends DBSchema {
    [STORE_NAME]: {
        key: number;
        value: IBookCard
    };
}

export async function initDB(): Promise<IDBPDatabase<MyDB>> {
    const db = await openDB<MyDB>(DB_NAME, 1, {
        upgrade(db) {
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
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

export async function addData(data: Pick<IBookCard, 'name' | 'author' | 'backcloth' | 'introduction'>): Promise<IBookCard[]> {
    const value = {
        ...data,
        chapter: 0,
        wordage: 0,
        updatedAt: '',
        uuid: uuidV4(),
        createdAt: dayjs().format('YYYY-MM-DD')
    }
    const db = await getDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    await store.add({ ...value });
    await tx.done;
    return getList();
}

export async function updateData(id: number, data: Partial<Omit<IBookCard, 'id' | 'createdAt'>>): Promise<IBookCard[]> {
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
    return getList();
}

export async function deleteData(id: number): Promise<IBookCard[]> {
    const db = await getDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    await tx.objectStore(STORE_NAME).delete(id);
    // 删除章节
    await deleteChapterByParentId(id)
    // 删除人物角色
    await deleteCharacterByParentId(id)
    await tx.done;
    return getList();
}

export async function getList(): Promise<IBookCard[]> {
    const db = await getDB();
    const store = db.transaction(STORE_NAME, 'readonly').objectStore(STORE_NAME);
    const allRecords = await store.getAll();
    return allRecords;
}

export async function getAllList(): Promise<IBookCard[]> {
    const db = await getDB();
    const store = db.transaction(STORE_NAME, 'readonly').objectStore(STORE_NAME);
    const bookshelfList = await store.getAll();
    const chaptersList = await getAllChaptersList();
    const list = [];
    for (let i = 0; i < bookshelfList.length; i++) {
        const item = bookshelfList[i];
        const tmepChapters = chaptersList.filter(f => f.parentId === item.id);
        const chapter = tmepChapters.length;
        let wordage = 0;
        tmepChapters.forEach(f => {
            wordage += f.content.length
        })
        list.push({ ...item, chapter, wordage })
    }
    return list;
}


export async function getOneBookshelf(id: number): Promise<IBookCard | undefined> {
    const db = await getDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const existingRecord = await store.get(id);
    return existingRecord;
}