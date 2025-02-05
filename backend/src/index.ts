import express, { Express, Request, Response } from "express";
import { getTask, appendResults, getTasks } from "./tasks";
import { sampleDataset } from "./datasets";

const app: Express = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.get("/", (req: Request, res: Response) => {
  res.send("the api sure is up");
});

app.get("/task/:name", async (req: Request, res: Response) => {
  try {
    const task = getTask(req.params.name);
    res.json(task);
  } catch (error) {
    if (error instanceof Error) {
      res.status(404).json({ error: error.message });
    } else {
      console.error("Internal server error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
});

app.get("/task", async (req: Request, res: Response) => {
  const tasks = getTasks();
  res.json(tasks);
});

app.get("/dataset/:name", async (req: Request, res: Response) => {
  try {
    let samples = Number.parseInt(req.query.samples as string);
    if (!samples) {
      samples = 1;
    }

    const dataset = await sampleDataset(req.params.name, samples);
    res.json(dataset);
  } catch (error) {
    if (error instanceof Error && error.message.includes("ENOENT")) {
      res.status(404).json({ error: `Dataset '${req.params.name}' not found` });
    } else {
      console.error("Internal server error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
});

app.post("/results/:name", async (req: Request, res: Response) => {
  try {
    const results = req.body;
    await appendResults(req.params.name, results);
    res.send(results);
  } catch (error) {
    if (error instanceof Error) {
      if (
        error.message === "New results format does not match existing format"
      ) {
        res.status(400).json({ error: error.message });
      } else {
        console.error("Internal server error:", error);
        res.status(500).json({ error: "Internal server error" });
      }
    } else {
      console.error("Internal server error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
