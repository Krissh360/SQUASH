import { useState, useCallback } from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Dashboard from "./pages/Dashboard";
import Issues from "./pages/Issues";
import CreateIssueDialog from "./components/issues/CreateIssueDialog";
import IssueDetailDrawer from "./components/issues/IssueDetailDrawer";

export default function App() {
  const [createOpen, setCreateOpen] = useState(false);
  const [selectedIssueId, setSelectedIssueId] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const refreshData = useCallback(() => {
    setRefreshTrigger((prev) => prev + 1);
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Navbar onOpenNewIssue={() => setCreateOpen(true)} />

      <main className="flex-1 mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-8">
        <Routes>
          <Route
            path="/"
            element={
              <Dashboard
                refreshTrigger={refreshTrigger}
                onSelectIssue={(id) => setSelectedIssueId(id)}
              />
            }
          />
          <Route
            path="/issues"
            element={
              <Issues
                refreshTrigger={refreshTrigger}
                onSelectIssue={(id) => setSelectedIssueId(id)}
                onOpenNewIssue={() => setCreateOpen(true)}
              />
            }
          />
        </Routes>
      </main>

      {/* Global Create Issue Dialog */}
      <CreateIssueDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSuccess={() => {
          setCreateOpen(false);
          refreshData();
        }}
      />

      {/* Global Issue Detail Drawer */}
      <IssueDetailDrawer
        issueId={selectedIssueId}
        onClose={() => setSelectedIssueId(null)}
        onUpdated={() => {
          refreshData();
        }}
        onDeleted={() => {
          setSelectedIssueId(null);
          refreshData();
        }}
      />
    </div>
  );
}
