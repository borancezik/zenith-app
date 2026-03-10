import { Box, FileJson, Activity } from "lucide-react";
import { cn } from "../lib/utils";

export default function Sidebar({ schema, activeMethod, onSelectMethod }) {
  if (!schema) return null;

  return (
    <aside className="w-64 h-full border-r border-border bg-card flex flex-col shrink-0 flex-nowrap">
      <div className="p-4 border-b border-border flex items-center gap-2 text-sm font-semibold text-foreground/80">
        <FileJson className="w-4 h-4 text-accent" />
        <span className="truncate" title={schema.name}>{schema.name}</span>
      </div>

      <div className="flex-1 overflow-y-auto overflow-x-hidden p-2">
        {schema.services.map((service, idx) => (
          <div key={idx} className="mb-4">
            <h3 className="px-2 py-1 text-xs font-bold uppercase tracking-wider text-foreground/50 flex items-center gap-2">
              <Box className="w-3 h-3" />
              {service.name}
            </h3>
            <ul className="mt-1 space-y-0.5">
              {service.methods.map((method, mIdx) => {
                const isActive = activeMethod?.full_name === method.full_name;
                return (
                  <li key={mIdx}>
                    <button
                      onClick={() => onSelectMethod(method)}
                      className={cn(
                        "w-full text-left px-3 py-1.5 rounded-md text-sm transition-colors duration-200 flex items-center gap-2",
                        isActive 
                          ? "bg-accent/10 text-accent font-medium shadow-[inset_2px_0_0_var(--accent)]" 
                          : "text-foreground/70 hover:bg-foreground/5 hover:text-foreground"
                      )}
                    >
                      <Activity className={cn("w-3.5 h-3.5", isActive ? "text-accent" : "text-foreground/40")} />
                      <span className="truncate">{method.name}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
        {schema.services.length === 0 && (
          <div className="p-4 text-center text-xs text-foreground/40">
            Hiç servis bulunamadı.
          </div>
        )}
      </div>
    </aside>
  );
}
