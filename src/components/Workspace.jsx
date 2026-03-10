import { useState, useEffect, useRef } from "react";
import Editor from "@monaco-editor/react";
import { Play } from "lucide-react";
import Sidebar from "./Sidebar";

export default function Workspace({ data }) {
  const { schema, filePath } = data;
  const [activeMethod, setActiveMethod] = useState(null);
  const [payload, setPayload] = useState("");

  // Select the first method automatically if none is selected
  useEffect(() => {
    if (!activeMethod && schema?.services?.length > 0 && schema.services[0].methods.length > 0) {
      handleSelectMethod(schema.services[0].methods[0]);
    }
  }, [schema]);

  const handleSelectMethod = (method) => {
    setActiveMethod(method);
    setPayload(method.request_payload);
  };

  return (
    <div className="flex h-screen w-full bg-background text-foreground overflow-hidden">
      <Sidebar 
        schema={schema} 
        activeMethod={activeMethod} 
        onSelectMethod={handleSelectMethod} 
      />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar: Action / Execute buttons */}
        <header className="h-14 border-b border-border bg-card/50 flex items-center justify-between px-4">
          <div className="flex flex-col">
            <span className="text-sm font-semibold truncate text-foreground/90">
              {activeMethod ? activeMethod.full_name : "Metot Seçin"}
            </span>
            <span className="text-xs text-foreground/40 font-mono truncate hidden sm:block">
              {filePath}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button 
              disabled={!activeMethod}
              className="px-4 py-1.5 rounded-md bg-accent text-background font-bold text-sm flex items-center gap-2 hover:opacity-90 disabled:opacity-50 transition-opacity subtle-glow"
            >
              <Play className="w-4 h-4" />
               Çalıştır
            </button>
          </div>
        </header>

        {/* Editor Area */}
        <main className="flex-1 flex" style={{ height: 'calc(100vh - 3.5rem)' }}>
           {activeMethod ? (
              <div className="w-full h-full flex flex-col p-4 bg-background">
                <div className="text-xs font-mono mb-2 text-foreground/50 border-b border-border pb-1">Request Payload (JSON)</div>
                <div className="flex-1 rounded-lg overflow-hidden border border-border">
                  <Editor
                     height="100%"
                     defaultLanguage="json"
                     theme="vs-dark" // We can dynamically bind this to custom themes later
                     value={payload}
                     onChange={(val) => setPayload(val)}
                     options={{
                       minimap: { enabled: false },
                       fontFamily: 'Consolas, "Courier New", monospace',
                       fontSize: 14,
                       scrollBeyondLastLine: false,
                       lineHeight: 24,
                       padding: { top: 16 }
                     }}
                   />
                </div>
              </div>
           ) : (
             <div className="auto m-auto text-foreground/30 text-sm">
                Sol taraftan bir gRPC metodu seçin.
             </div>
           )}
        </main>
      </div>
    </div>
  );
}
