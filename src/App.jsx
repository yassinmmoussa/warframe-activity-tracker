import React, { useState } from 'react';
import { useLedger } from './hooks/useLedger.js';
import { AppHeader } from './components/layout/AppHeader.jsx';
import { Toast } from './components/layout/Toast.jsx';
import { DataResetModal } from './components/layout/DataResetModal.jsx';
import { ResetsPage } from './features/resets/ResetsPage.jsx';
import { DashboardPage } from './features/dashboard/DashboardPage.jsx';
import { ArsenalPage } from './features/arsenal/ArsenalPage.jsx';
import { ModsRelicsPage } from './features/mods/ModsRelicsPage.jsx';
import { JournalPage } from './features/journal/JournalPage.jsx';
import { CompletedPage } from './features/journal/CompletedPage.jsx';
import { VIEWS } from './constants/views.js';

export default function App() {
  const {
    state,
    countdowns,
    toast,
    hasUnsavedChanges,
    handleAddItem,
    handleUpdateItem,
    handleDeleteItem,
    handleRestoreItem,
    handleAddDefaultTag,
    handleRemoveDefaultTag,
    handleResetDefaultTags,
    handleToggleResetTask,
    handleToggleResetTaskVisibility,
    handleDeleteResetTask,
    handleAddResetTask,
    handleResetCadence,
    handleExportJson,
    handleImportJson,
    handleClearItems,
    handleLoadSamples,
    handleFullWipe,
  } = useLedger();

  const [activeView, setActiveView] = useState(VIEWS.DASHBOARD);
  const [selectedTag, setSelectedTag] = useState('');
  const [showResetModal, setShowResetModal] = useState(false);
  const [confirmFullWipe, setConfirmFullWipe] = useState(false);





  const closeResetModal = () => {
    setShowResetModal(false);
    setConfirmFullWipe(false);
  };

  const visibleDaily = state.resets.daily.filter((t) => !t.hidden);
  const visibleWeekly = state.resets.weekly.filter((t) => !t.hidden);
  const dailyDone = visibleDaily.filter((t) => t.done).length;
  const weeklyDone = visibleWeekly.filter((t) => t.done).length;

  return (
    <div
      className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col"
      style={{
        backgroundImage:
          'radial-gradient(ellipse at top center, rgba(212, 175, 55, 0.06) 0%, transparent 55%), radial-gradient(ellipse at bottom right, rgba(34, 211, 238, 0.05) 0%, transparent 50%), linear-gradient(rgba(38, 49, 68, 0.14) 1px, transparent 1px), linear-gradient(90deg, rgba(38, 49, 68, 0.14) 1px, transparent 1px)',
        backgroundSize: '100% 100%, 100% 100%, 40px 40px, 40px 40px',
      }}
    >
      <AppHeader
        activeView={activeView}
        setActiveView={setActiveView}
        hasUnsavedChanges={hasUnsavedChanges}
        handleExportJson={handleExportJson}
        handleImportJson={handleImportJson}
        openResetModal={() => setShowResetModal(true)}
        dailyDone={dailyDone}
        visibleDailyCount={visibleDaily.length}
        weeklyDone={weeklyDone}
        visibleWeeklyCount={visibleWeekly.length}
      />

      <main className="w-full max-w-[1920px] mx-auto flex-1 px-4 sm:px-6 lg:px-8 py-6">
        {activeView === VIEWS.DASHBOARD && (
          <DashboardPage
            state={state}
            countdowns={countdowns}
            onSetView={setActiveView}
            onToggleResetTask={handleToggleResetTask}
            onAddItem={handleAddItem}
            onUpdateItem={handleUpdateItem}
            onDeleteItem={handleDeleteItem}
            onAddDefaultTag={handleAddDefaultTag}
            onRemoveDefaultTag={handleRemoveDefaultTag}
            onResetDefaultTags={handleResetDefaultTags}
            onTagClick={(tag) => { setSelectedTag(tag); setActiveView(VIEWS.JOURNAL); }}
          />
        )}

        {activeView === VIEWS.RESETS && (
          <ResetsPage state={state} countdowns={countdowns} onToggleTask={handleToggleResetTask} onToggleVisibility={handleToggleResetTaskVisibility} onDeleteTask={handleDeleteResetTask} onResetCadence={handleResetCadence} onAddResetTask={handleAddResetTask} />
        )}

        {activeView === VIEWS.ARSENAL && (
          <ArsenalPage state={state} onAddItem={handleAddItem} onUpdateItem={handleUpdateItem} onDeleteItem={handleDeleteItem} onAddDefaultTag={handleAddDefaultTag} onRemoveDefaultTag={handleRemoveDefaultTag} onResetDefaultTags={handleResetDefaultTags} onTagClick={(tag) => { setSelectedTag(tag); setActiveView(VIEWS.JOURNAL); }} />
        )}

        {activeView === VIEWS.MODS_RELICS && (
          <ModsRelicsPage state={state} onAddItem={handleAddItem} onUpdateItem={handleUpdateItem} onDeleteItem={handleDeleteItem} onAddDefaultTag={handleAddDefaultTag} onRemoveDefaultTag={handleRemoveDefaultTag} onResetDefaultTags={handleResetDefaultTags} onTagClick={(tag) => { setSelectedTag(tag); setActiveView(VIEWS.JOURNAL); }} />
        )}

        {activeView === VIEWS.JOURNAL && (
          <JournalPage state={state} selectedTag={selectedTag} setSelectedTag={setSelectedTag} onAddItem={handleAddItem} onUpdateItem={handleUpdateItem} onDeleteItem={handleDeleteItem} onAddDefaultTag={handleAddDefaultTag} onRemoveDefaultTag={handleRemoveDefaultTag} onResetDefaultTags={handleResetDefaultTags} />
        )}

        {activeView === VIEWS.COMPLETED && (
          <CompletedPage state={state} onUpdateItem={handleUpdateItem} onRestoreItem={handleRestoreItem} />
        )}
      </main>

      <Toast toast={toast} />

      <DataResetModal
        open={showResetModal}
        confirmFullWipe={confirmFullWipe}
        setConfirmFullWipe={setConfirmFullWipe}
        close={closeResetModal}
        handleClearItems={handleClearItems}
        handleLoadSamples={handleLoadSamples}
        handleFullWipe={handleFullWipe}
      />
    </div>
  );
}