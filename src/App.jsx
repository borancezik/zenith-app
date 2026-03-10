import { useTheme } from "./context/ThemeContext";
import { Terminal, Moon, Sun, Monitor, Upload } from "lucide-react";
import { cn } from "./lib/utils";
import { useQuery } from "@tanstack/react-query";
import { useLoadProto } from "./hooks/useProto";
import Workspace from "./components/Workspace";

function App() {
  const { data: activeProto } = useQuery({ queryKey: ["activeProto"] });
  const loadProto = useLoadProto();

  if (activeProto) {
    return <Workspace data={activeProto} />;
  }

  return <WelcomeScreen onLoad={() => loadProto.mutate()} isLoading={loadProto.isPending} />;
}

function WelcomeScreen({ onLoad, isLoading }) {
  const { theme, setTheme } = useTheme();

  const themes = [
    { id: "cyber-minimalist", label: "Cyber-Minimalist", icon: Terminal },
    { id: "deep-space", label: "Deep Space", icon: Moon },
    { id: "high-contrast", label: "High Contrast", icon: Monitor },
  ];

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-6 bg-background text-foreground transition-colors duration-300">
      <div className="w-full max-w-3xl relative">
        <div className="absolute inset-0 bg-accent-glow rounded-3xl blur-3xl opacity-50 pointer-events-none" />
        <div className="relative bg-card border border-border shadow-2xl rounded-2xl p-8 backdrop-blur-sm overflow-hidden flex flex-col items-center justify-center space-y-8">
          <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-accent to-transparent opacity-50" />

          {/* Header */}
          <div className="text-center space-y-4">
            <h1 className="text-5xl font-black tracking-tight text-foreground flex items-center justify-center gap-4">
              <Terminal className="w-12 h-12 text-accent" />
              ZENITH
            </h1>
            <p className="text-lg text-foreground/70 max-w-md mx-auto">
              Dinamik gRPC İstemcisi. Yüksek performans, sınır tanımayan veri akışı ve üstün geliştirici deneyimi.
            </p>
          </div>

          {/* Theme Switcher */}
          <div className="w-full max-w-md space-y-4">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-foreground/50 text-center">
              Temayı Seçin
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {themes.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTheme(t.id)}
                  className={cn(
                    "flex flex-col items-center justify-center gap-3 p-4 rounded-xl border transition-all duration-300",
                    theme === t.id
                      ? "border-accent bg-accent/10 subtle-glow"
                      : "border-border hover:border-accent/50 hover:bg-card/80"
                  )}
                >
                  <t.icon className={cn("w-6 h-6", theme === t.id ? "text-accent" : "text-foreground/50")} />
                  <span className={cn("text-xs font-medium", theme === t.id ? "text-accent" : "text-foreground/70")}>
                    {t.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Load Workspace Button */}
          <div className="w-full p-4 rounded-lg bg-background/50 border border-border mt-8 flex flex-col items-center space-y-4">
             <div className="flex flex-col text-center">
               <span className="text-sm font-medium text-foreground pb-2">Hemen Başlayın</span>
               <span className="text-xs text-foreground/50">Test etmek istediğiniz .proto dosyasını yükleyin</span>
             </div>
             
             <button 
               onClick={onLoad} 
               disabled={isLoading}
               className="px-6 py-3 w-full sm:w-auto rounded-lg bg-foreground text-background font-bold text-sm hover:opacity-90 transition-opacity flex items-center justify-center gap-2 subtle-glow"
             >
               {isLoading ? (
                 <>
                   <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-background"></span>
                   Yükleniyor...
                 </>
               ) : (
                 <>
                   <Upload className="w-4 h-4" />
                   .proto Yükle
                 </>
               )}
             </button>
          </div>

        </div>
      </div>
    </div>
  );
}

export default App;
