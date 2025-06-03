import { APP_ROUTE_MENU } from "@/constants";

export const isAuthPath = (pathname: string): boolean => {
  return pathname.includes("/auth");
};

export const needAuth = (pathname: string): boolean => {
  return APP_ROUTE_MENU.filter((menu) => menu.needAuth).some((menu) => {
    // return pathname === menu.path;
    if (menu.path === "/[id]") {
      return /^\/[a-zA-Z0-9_-]+$/.test(pathname); // 匹配 /xxx 格式
    }
    return pathname === menu.path;
  });
};

// export const removeParams = (pathname: string): void => {
//   if (typeof window !== "undefined" && pathname) {
//     window.history.replaceState({}, "", pathname);
//   }
// };

export const removeParams = (pathname: string): void => {
  if (typeof window !== "undefined" && pathname) {
    const url = new URL(window.location.href);

    // 构建新的查询字符串（只保留 name）
    const newSearchParams = new URLSearchParams();
    const name = url.searchParams.get("name");
    if (name) newSearchParams.set("name", name);

    url.search = newSearchParams.toString();

    window.history.replaceState({}, "", url.toString());
  }
};