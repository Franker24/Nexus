/**
 * NEXUS - Primary Entry Application Component
 */

import React from 'react';
import { NexusProvider } from './context/NexusContext';
import { AppShell } from './components/layout/AppShell';

export default function App() {
  return (
    <NexusProvider>
      <AppShell />
    </NexusProvider>
  );
}
