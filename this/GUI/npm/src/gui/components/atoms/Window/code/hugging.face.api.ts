export async function runHuggingFace(model: string, input: string, token: string) {
  const res = await fetch(`https://api-inference.huggingface.co/models/${model}`, {
    method: "POST",
    headers: { 
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ inputs: input }),
  });
  return await res.json();
}
