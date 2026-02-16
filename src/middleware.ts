import type { MiddlewareHandler } from "astro";
import { isSupportedLocale } from "@util/i18nConfig";

const LOCALE_COOKIE = "locale";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

export const onRequest: MiddlewareHandler = async (context, next) => {
  const url = new URL(context.request.url);
  const segments = url.pathname.split("/").filter(Boolean);
  const maybeLocale = segments[0];

  if (maybeLocale && isSupportedLocale(maybeLocale)) {
    context.cookies.set(LOCALE_COOKIE, maybeLocale, {
      path: "/",
      maxAge: COOKIE_MAX_AGE,
    });

    const rest = segments.slice(1).join("/");
    let newPath = rest ? `/${rest}` : "/";
    newPath = newPath.replace(/\/+$/, "") || "/";
    
    url.pathname = newPath;
    url.searchParams.delete("lang");
    
    // Pass locale through custom header since rewrite strips the path prefix
    const newRequest = new Request(url, context.request);
    newRequest.headers.append("x-locale", maybeLocale);
    return context.rewrite(newRequest);
  }

  return next();
};