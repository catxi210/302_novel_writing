import { clsx, type ClassValue } from "clsx";
import dayjs from "dayjs";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}


export function extractCodeBlocksContent(markdown: string) {
  // 正则表达式匹配代码块
  const codeBlocksRegex =
    /(?:```([a-zA-Z0-9]+)?\s*([\s\S]*?)\s*```|```([a-zA-Z0-9]+)?\s*([\s\S]+?)\s*```)(?![^`]*```)|```([a-zA-Z0-9]+)?\s*([\s\S]+)/gm;
  let match;


  const codeBlocksContent = [];
  // 遍历所有匹配项
  while ((match = codeBlocksRegex.exec(markdown))) {
    // 选择第一个非空的捕获组
    const codeBlockContent =
      match[6] || match[5] || match[4] || match[3] || match[2] || match[1];
    if (codeBlockContent) {
      codeBlocksContent.push(codeBlockContent);
    }
  }
  return codeBlocksContent;
}

// 定义一个函数，将 Base64 字符串转换为 File 对象
export function base64ToFile(base64String: string, fileName: string = 'file', mimeType?: string): File {
  const base64Regex = /^data:(.*);base64,/;

  if (base64Regex.test(base64String)) {
    mimeType = mimeType || base64String.match(base64Regex)![1];
    base64String = base64String.replace(base64Regex, '');
  }
  const byteCharacters = atob(base64String);

  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }

  const byteArray = new Uint8Array(byteNumbers);

  return new File([byteArray], fileName, { type: mimeType });
}



export function deltaToObject(deltaOps: any[]): Record<string, any> {
  const result: Record<string, any> = {};

  deltaOps.forEach((op) => {
    Object.entries(op).forEach(([key, value]) => {
      if (key === "insert" && typeof value === "string") {
        result[key] = value;
      } else {
        result[key] = value;
      }
    });
  });

  return result;
}