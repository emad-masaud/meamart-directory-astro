import { defineMiddleware } from "astro:middleware";

export const onRequest = defineMiddleware((context, next) => {
  const sessionCookie = context.cookies.get("meamart_session")?.value;
  
  if (sessionCookie) {
    try {
      // Decode Base64 and URL decode
      const decodedStr = decodeURIComponent(atob(sessionCookie));
      const sessionData = JSON.parse(decodedStr);
      context.locals.userSession = sessionData;
    } catch (e) {
      console.warn("Invalid session cookie format", e);
      context.locals.userSession = null;
    }
  } else {
    context.locals.userSession = null;
  }

  return next();
});
