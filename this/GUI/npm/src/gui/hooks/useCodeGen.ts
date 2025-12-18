import { useCallback } from "react";
export function useCodeGen() {
  const generate = useCallback(async (type: string, payload: any) => {
    console.log(`[CodeGen] Request: ${type}`, payload);
    // For now, fake output:
    return `Generated mock output for: ${payload.prompt}`;
  }, []);

  return { generate };
}

export default useCodeGen;