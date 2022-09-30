import express from "express";
import fs from "fs";
import { open } from "./db";
import User from "./users";

(async () => {
  await open("db.db");

  const app = express();
  app.use(express.json());

  app.get("/", (req, res) => {
    const file = fs.createReadStream("html/index.html");
    res.header("Content-Type", "text/html");
    file.pipe(res);
  });

  app.post("/api/login", async (req, res) => {
    const login = req.body.login;
    const hash = req.body.hash;

    if (typeof login !== "string" || !login) {
      res.status(401);
      res.json({
        code: 401,
        message: "login required",
      });
      return;
    }

    if (typeof hash !== "string" || !hash) {
      res.status(401);
      res.json({
        code: 401,
        message: "hash required",
      });
      return;
    }

    const success = await User.auth(login, hash);

    if (success) {
      res.json({
        code: 200,
        message: "OK",
      });
    } else {
      res.status(401);
      res.json({
        code: 401,
        message: "wrong login or password",
      });
    }
  });

  app.put("/api/user", async (req, res) => {
    const login = req.body.login;
    const hash = req.body.hash;

    if (typeof login !== "string" || !login) {
      res.status(401);
      res.json({
        code: 401,
        message: "login required",
      });
      return;
    }

    if (typeof hash !== "string" || !hash) {
      res.status(401);
      res.json({
        code: 401,
        message: "hash required",
      });
      return;
    }

    const result = await User.register(login, hash);

    if (result === "unknown") {
      res.status(500);
      res.json({
        code: 500,
        message: "unknown error",
      });
      return;
    }
    if (result === "login") {
      res.status(400);
      res.json({
        code: 400,
        message: "login already exists",
      });
      return;
    }
    res.json({
      code: 200,
      message: "OK",
      id: result.id,
    });
  });

  app.get("/api/user", async (req, res) => {
    const qid = req.query.id as string | undefined;
    const login = req.query.login as string | undefined;

    if (qid) {
      const id = +qid;
      if (isNaN(id)) {
        res.status(400);
        res.json({
          code: 400,
          message: "id must be a number",
        });
      } else {
        const user = await User.get(+id);
        if (!user) {
          res.status(404);
          res.json({
            code: 404,
            message: "user not found",
          });
        } else {
          res.json({
            code: 200,
            message: "OK",
            user: { id: user.id, name: user.login },
          });
        }
      }
    } else if (login) {
      const user = await User.find(login);
      if (!user) {
        res.status(404);
        res.json({
          code: 404,
          message: "user not found",
        });
      } else {
        res.json({
          code: 200,
          message: "OK",
          user: { id: user.id, name: user.login },
        });
      }
    } else {
      res.status(400);
      res.json({
        code: 400,
        message: "id or login required",
      });
    }
  });

  app.listen(8080, () => console.log("started"));
})();
