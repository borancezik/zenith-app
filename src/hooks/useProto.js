import { useMutation, useQueryClient } from "@tanstack/react-query";
import { invoke } from "@tauri-apps/api/core";
import { open } from "@tauri-apps/plugin-dialog";

export function useLoadProto() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      // Tauri v2 plugin-dialog to open file
      const filepath = await open({
        multiple: false,
        directory: false,
        filters: [{ name: "Protocol Buffer Files", extensions: ["proto"] }]
      });

      if (!filepath) {
        throw new Error("Dosya seçilmedi");
      }

      // Invoke Tauri rust command
      const parsedData = await invoke("parse_proto", { filePath: filepath });
      
      return { 
        filePath: filepath,
        schema: parsedData 
      };
    },
    onSuccess: (result) => {
      // Cache the loaded proto schema into TanStack Query
      queryClient.setQueryData(["activeProto"], result);
    }
  });
}
