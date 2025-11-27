import { Routes, Route, Navigate } from "react-router-dom";
// import Documents from "./Documents";
// import Downloads from "./Downloads";
// import Page from "./page";
import DynamicPage from "./dynamic-page";
// import { SidebarInset, SidebarTrigger } from "./components/ui/sidebar";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/Documents" replace />} />

      <Route
        path="/:id"
        element={
          <>
            <DynamicPage />
          </>
        }
      />
    </Routes>
  );
}
