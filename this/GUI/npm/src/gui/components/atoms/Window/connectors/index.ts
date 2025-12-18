export const connectors = {
  openai: async (prompt: string) => {
    const res = await fetch("/api/openai", {
      method: "POST",
      body: JSON.stringify({ prompt }),
      headers: { "Content-Type": "application/json" },
    });
    const data = await res.json();
    return data.result;
  },
  huggingface: async (input: string) => {
    const res = await fetch("/api/huggingface", {
      method: "POST",
      body: JSON.stringify({ inputs: input }),
      headers: { "Content-Type": "application/json" },
    });
    return await res.json();
  },
};