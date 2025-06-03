
/**
 * @name 书名
 * @author 作者名
 * @chapter 章节数
 * @wordage 字数
 * @backcloth 书面图
 * @updatedAt 上次修改时间
 * @createdAt 创建时间
 */
export interface IBookCard {
    id?: number;
    uuid: string;
    name: string;
    author: string;
    chapter?: number;
    wordage?: number;
    introduction: string;
    backcloth: string;
    updatedAt: string;
    createdAt: string;
}


export const mockBookData = {
    id: 1,
    uuid: 'xxxx',
    name: 'xxxx',
    author: 'xxxx',
    chapter: 4,
    wordage: 88,
    backcloth: 'https://www.refactoringui.com/_next/static/media/book.43eb3b9aec83fb89.png',
    updatedAt: 0,
    createdAt: 'xxxx',
}