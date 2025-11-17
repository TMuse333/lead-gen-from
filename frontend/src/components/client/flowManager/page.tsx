'use client';

import { useState } from 'react';
import { useConversationConfigStore } from '@/stores/conversationConfigStore';
import FlowManagerHeader from './components/header';
import FlowListSidebar from './components/sidebar';
import FlowDetailsPanel from './components/detailsPanel';
import EmptyState from './components/emptyState';
import ImportModal from './components/importModal';
import HelpModal from './components/helpModal';

export default function FlowManager() {
  const { flows, getAllFlows, deleteFlow, duplicateFlow, exportFlow, importFlow } =
    useConversationConfigStore();

    const hydrated = useConversationConfigStore(s => s.hydrated);

  


  const [showImportModal, setShowImportModal] = useState(false);

  const allFlows = getAllFlows();
  const [selectedFlowId, setSelectedFlowId] = useState<string | null>(allFlows[0]?.id || null);
  const selectedFlow = selectedFlowId ? flows[selectedFlowId] : null;

 

  const handleExport = (flowId: string) => {
    const json = exportFlow(flowId);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `flow-${flowId}-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const content = ev.target?.result as string;
      importFlow(content);
      setShowImportModal(false);
    };
    reader.readAsText(file);
  };

  const handleDuplicate = (flowId: string) => {
    const newId = duplicateFlow(flowId);
    setSelectedFlowId(newId);
  };

  const handleDelete = (flowId: string) => {
    if (confirm('Are you sure you want to delete this flow?')) {
      deleteFlow(flowId);
      if (selectedFlowId === flowId) setSelectedFlowId(null);
    }
  };

  if (!hydrated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <p className="text-slate-600">Loading flows...</p> {/* Or a spinner */}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <FlowManagerHeader onImportClick={() => setShowImportModal(true)} />
  
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-12 gap-6">
          <FlowListSidebar
            flows={allFlows}
            selectedFlowId={selectedFlowId}
            onSelectFlow={setSelectedFlowId}
            onExport={handleExport}
            onDuplicate={handleDuplicate}
            onDelete={handleDelete}
          />

          <div className="col-span-8">
            {selectedFlow ? <FlowDetailsPanel flow={selectedFlow} /> : <EmptyState />}
          </div>
        </div>
      </div>

      {showImportModal && (
        <ImportModal onClose={() => setShowImportModal(false)} onImport={handleImport} />
      )}
    </div>
  );
}