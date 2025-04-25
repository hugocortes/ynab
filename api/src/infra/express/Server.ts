import express, { Express, Request, Response } from "express";
import { initialize } from "express-openapi";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

type ExpressServerConfig = {
  enableGlob: boolean;
  pkg: {
    description: string;
    name: string;
    version: string;
  };
};

export class Server {
  private app: Express;
  private config: ExpressServerConfig;

  constructor(config: ExpressServerConfig) {
    this.app = express();
    this.app.use(express.json());
    this.config = config;

    this.setupOpenAPI();
    this.setupRoutes();
  }

  private setupOpenAPI() {
    initialize({
      app: this.app,
      apiDoc: {
        /**
         * See https://github.com/jsau-/express-openapi-memory-usage-response-validation
         * This may be causing high memory usage
         */
        ...({
          "x-express-openapi-disable-response-validation-middleware": true,
        } as any),
        components: {
          schemas: {},
          securitySchemes: {},
        },
        info: {
          description: this.config.pkg.description,
          title: this.config.pkg.name,
          version: this.config.pkg.version,
        },
        openapi: "3.0.3",
        paths: {},
        security: [],
        tags: [],
      },
      docsPath: "/swagger.json",
      exposeApiDocs: true,
      paths: `${__dirname}/routes`,
      promiseMode: true,

      ...(this.config.enableGlob
        ? {
            routesGlob: "**/*.{ts,js}",
            routesIndexFileRegExp: /(?:index)?\.[tj]s$/,
          }
        : {}), // don't enable unless using tsx
    });

    this.app.get(`/docs`, (req, res) => {
      res.send(`
        <!doctype html>
        <html>
          <head>
            <meta charset="utf-8"> <!-- Important: rapi-doc uses utf8 characters -->
            <script type="module" src="https://unpkg.com/rapidoc/dist/rapidoc-min.js"/>

            <link rel="preconnect" href="https://fonts.gstatic.com" />
            <link
              href="https://fonts.googleapis.com/css2?family=Inter:wght@100;200;300;400;500;600;700;800;900&family=Material+Icons+Outlined&family=Material+Icons&display=swap"
              rel="stylesheet"
            />
          </head>
          <body>
            <rapi-doc
              spec-url = "/swagger.json"

              theme = "light"
              bg-color = "#e7eaf3b3"
              text-color = "#1e2022"
              header-color = "#e7eaf3b3"
              primary-color = "#092ace"
              regular-font = "Segoe UI"

              nav-bg-color = "#e7eaf3b3"
              nav-text-color = "#1e2022"

              render-style = "focused"

              show-header = "false"
              allow-server-selection = "false"

              schema-description-expanded = true

              default-schema-tab = "schema"
            >
            </rapi-doc>
          </body>
        </html>      
      `);

      res.end();
    });
  }

  private setupRoutes() {
    // override open api setup
  }
}
