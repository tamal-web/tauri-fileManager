import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { HashRouter } from "react-router-dom";
import { AppSidebar } from "./comp/app-sidebar.tsx";
import { SidebarProvider } from "./components/ui/sidebar.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <SidebarProvider className="h-[100dvh] w-full overflow-hidden">
      <HashRouter>
        <AppSidebar />
        <App />
      </HashRouter>
    </SidebarProvider>
  </StrictMode>
);
