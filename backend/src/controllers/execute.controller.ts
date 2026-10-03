import { Request, Response } from "express";

const JUDGE0_API_URL = process.env.JUDGE0_API_URL || "https://judge0-ce.p.rapidapi.com";
const JUDGE0_API_KEY = process.env.JUDGE0_API_KEY;
const JUDGE0_API_HOST = process.env.JUDGE0_API_HOST || "judge0-ce.p.rapidapi.com";

export const executeCode = async (req: Request, res: Response) => {
  try {
    const { language_id, source_code, stdin } = req.body;

    if (!language_id || !source_code) {
      return res.status(400).json({ error: "language_id and source_code are required" });
    }

    if (!JUDGE0_API_KEY) {
      return res.status(500).json({ error: "Judge0 API key is not configured in environment variables" });
    }

    // Create submission
    const submissionResponse = await fetch(`${JUDGE0_API_URL}/submissions`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "X-RapidAPI-Key": JUDGE0_API_KEY,
        "X-RapidAPI-Host": JUDGE0_API_HOST,
      },
      body: JSON.stringify({
        language_id: language_id,
        source_code: source_code,
        stdin: stdin || "",
      }),
    });

    if (!submissionResponse.ok) {
      const errorText = await submissionResponse.text();
      console.error("Judge0 submission error:", errorText);
      return res.status(500).json({ error: "Failed to submit code to Judge0" });
    }

    const submissionData = await submissionResponse.json();
    const token = submissionData.token;

    if (!token) {
      return res.status(500).json({ error: "Failed to get submission token from Judge0" });
    }

    // Poll for results
    let result = null;
    let attempts = 0;
    const maxAttempts = 20; // 20 attempts with 1 second delay = 20 seconds timeout

    while (attempts < maxAttempts) {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const resultResponse = await fetch(
        `${JUDGE0_API_URL}/submissions/${token}?base64_encoded=false`,
        {
          method: "GET",
          headers: {
            "X-RapidAPI-Key": JUDGE0_API_KEY,
            "X-RapidAPI-Host": JUDGE0_API_HOST,
          },
        }
      );

      if (!resultResponse.ok) {
        return res.status(500).json({ error: "Failed to get submission result from Judge0" });
      }

      result = await resultResponse.json();

      if (result.status_id <= 2) {
        // Processing (1: In Queue, 2: Processing)
        attempts++;
        continue;
      }

      // Completed or error
      break;
    }

    if (attempts >= maxAttempts) {
      return res.status(408).json({ error: "Execution timeout" });
    }

    res.json({
      stdout: result.stdout || "",
      stderr: result.stderr || "",
      time: result.time || "0",
      memory: result.memory || "0",
      status_id: result.status_id,
      status_description: result.status?.description || "",
    });
  } catch (error) {
    console.error("Execute code error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
