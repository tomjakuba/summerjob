import {
  OpenAPIGenerator,
  OpenAPIRegistry,
} from "@asteasolutions/zod-to-openapi";
import { CarSchema } from "lib/prisma/zod";
import { Allergy } from "lib/types/allergy";
import { WorkerCreateSchema } from "lib/types/worker";
import { z } from "zod";

const registry = new OpenAPIRegistry();

//#region Allergies

registry.register("Allergy", z.nativeEnum(Allergy));

registry.registerPath({
  path: "/api/allergies",
  method: "get",
  description: "Gets a list of supported allergies.",
  summary: "List all supported allergies",
  tags: ["Allergies"],
  responses: {
    200: {
      description: "List of supported allergies",
      content: {
        "application/json": {
          schema: z.array(z.nativeEnum(Allergy)),
        },
      },
    },
  },
});

//#endregion

//#region Cars

registry.register("Car", CarSchema);

registry.registerPath({
  path: "/api/cars",
  method: "get",
  description: "Gets a list of available cars for the current event.",
  summary: "List all available cars",
  tags: ["Cars"],
  responses: {
    200: {
      description: "List of available cars",
      content: {
        "application/json": {
          schema: z.array(CarSchema),
        },
      },
    },
  },
});

//#endregion

registry.register("WorkerCreateData", WorkerCreateSchema);

registry.registerPath({
  path: "/api/workers",
  method: "post",
  description: "Description of the endpoint",
  summary: "Summary of the endpoint",
  tags: ["Workers"],
  request: {
    body: {
      content: {
        "application/json": {
          schema: WorkerCreateSchema,
        },
      },
    },
  },
  responses: {
    204: {
      description: "Worker created",
    },
  },
});

const generator = new OpenAPIGenerator(registry.definitions, "3.0.0");
let openApiDocument = {};
try {
  openApiDocument = generator.generateDocument({
    info: {
      title: "SummerJob API",
      version: "1.0",
      description:
        "Pro všechny dotazy je nutné se předem přihlásit přes standardní webové rozhraní, aby prohlížeč uložil cookie s tokenem.",
    },
  });
} catch (err) {
  console.log("Nastala chyba při generování dokumentu OpenAPI");
  console.error(err);
}

export default openApiDocument;
