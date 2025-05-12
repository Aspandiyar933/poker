import { serveStatic } from "hono/bun";

import createApp from "./lib/create-app";
import auth from "./routes/auth";

const app = createApp();

const routes = [auth] as const;

routes.forEach((route) => {
  app.basePath("/api").route("/",route);
});

app.get("*", serveStatic({ root:"../client/dist" }));
app.get("*", serveStatic({path:"index.html", root: "../client/dist"}));

export type AppType = (typeof routes)[number];

export default app;