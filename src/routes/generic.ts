import { genericResponse } from "@/constants.js";
import { server } from "@/index.js";

export const prefix = "/";
export const route = (instance: typeof server) =>
  instance.get(
    "",
    {
      preHandler: [instance.authenticate],
      schema: {
        description: "Hello, world!",
        tags: ["generic"],
        response: {
          200: genericResponse(200),
        },
      },
    },
    () => {
      return {
        statusCode: 200,
        message: "Hello, world!",
      };
    }
  );
