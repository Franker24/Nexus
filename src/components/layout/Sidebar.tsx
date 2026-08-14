/**
 * NEXUS - Enterprise Dark Monochrome Sidebar Navigation
 */

import React from 'react';
import { useNexus, NexusRoute } from '../../context/NexusContext';
import {
  LayoutDashboard,
  Bot,
  GitMerge,
  ShieldAlert,
  Brain,
  FileCheck2
} from 'lucide-react';

interface NavItem {
  id: NexusRoute;
  label: string;
  icon: React.ElementType;
  badge?: number;
}

export const Sidebar: React.FC = () => {
  const { activeRoute, setActiveRoute, pendingApprovals, health } = useNexus();

  const navItems: NavItem[] = [
    { id: 'mission', label: 'Mission Control', icon: LayoutDashboard },
    { id: 'agents', label: 'Agents', icon: Bot },
    { id: 'workflows', label: 'Workflows', icon: GitMerge },
    {
      id: 'approvals',
      label: 'Approvals',
      icon: ShieldAlert,
      badge: pendingApprovals.length
    },
    { id: 'memory', label: 'Memory', icon: Brain },
    { id: 'audit', label: 'Audit Trail', icon: FileCheck2 }
  ];

  const isOperational = health?.status === 'healthy';

  return (
    <aside id="sidebar-nav" className="w-56 bg-[#111111] text-[#FFFFFF] border-r border-[#222222] flex flex-col justify-between shrink-0 select-none">
      <div>
        {/* Brand Header */}
        <div className="p-4 border-b border-[#222222]">
          <div className="flex items-center space-x-2">
            <span className="font-mono font-bold tracking-widest text-sm text-white">NEXUS</span>
            <span className="px-1.5 py-0.5 rounded text-[8px] font-mono bg-[#22C55E]/10 text-[#22C55E] border border-[#22C55E]/20 uppercase animate-quiet-pulse">
              LIVE
            </span>
          </div>
          <div className="text-[10px] font-mono text-[#8A8A8A] tracking-wider uppercase mt-0.5">
            AUTONOMOUS OPERATIONS
          </div>
        </div>

        {/* Main Nav Links */}
        <div className="p-2 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeRoute === item.id;
            const hasBadge = item.badge !== undefined && item.badge > 0;

            return (
              <button
                key={item.id}
                id={`nav-${item.id}`}
                onClick={() => setActiveRoute(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded text-xs font-medium transition-all duration-150 cursor-pointer ${
                  isActive
                    ? 'bg-[#242424] text-white border-l-2 border-white pl-2.5 font-semibold shadow-xs'
                    : 'text-[#8A8A8A] hover:text-white hover:bg-[#181818]'
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-[#8A8A8A]'}`} />
                  <span>{item.label}</span>
                </div>

                {hasBadge && (
                  <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-bold bg-[#F59E0B] text-black">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Footer Details */}
      <div className="p-4 border-t border-[#222222] text-xs font-mono space-y-3">
        <div>
          <div className="text-[10px] text-[#8A8A8A] uppercase tracking-wider mb-1">
            SYSTEM
          </div>
          <div className="flex items-center space-x-2 text-xs">
            <span className={`w-2 h-2 rounded-full animate-quiet-pulse ${isOperational ? 'bg-[#22C55E]' : 'bg-[#F59E0B]'}`} />
            <span className="text-white font-medium">
              {isOperational ? 'Operational' : 'Degraded'}
            </span>
          </div>
        </div>

        <div className="pt-2 border-t border-[#222222] flex items-center justify-between text-[10px] text-[#8A8A8A]">
          <span>VERSION</span>
          <span className="text-[#A3A3A3]">v1.0.0</span>
        </div>
      </div>
    </aside>
  );
};

