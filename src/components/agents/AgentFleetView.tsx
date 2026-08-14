/**
 * NEXUS - Dedicated Agent Fleet View
 */

import React, { useState } from 'react';
import { useNexus } from '../../context/NexusContext';
import { Agent } from '../../types/nexus';

export const AgentFleetView: React.FC = () => {
  const { agents } = useNexus();
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(agents[0] || null);

  const activeAgent = selectedAgent || agents[0];

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
      <div className="flex items-center justify-between border-b border-[#E5E5E5] pb-4">
        <div>
          <h2 className="text-base font-mono font-bold text-[#111111] tracking-wider uppercase">
            AUTONOMOUS AGENT FLEET REGISTRY
          </h2>
          <p className="text-xs text-[#666666] mt-1 font-sans">
            Inspect autonomous system personas, models, capabilities, system prompts, and tool authorizations.
          </p>
        </div>

        <div className="font-mono text-xs text-[#111111] bg-white border border-[#E5E5E5] px-3 py-1.5 rounded">
          FLEET CAPACITY: <strong className="text-[#111111]">{agents.length} AGENTS</strong>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Agent List */}
        <div className="lg:col-span-4 space-y-2">
          {agents.map((ag) => {
            const isSelected = activeAgent?.id === ag.id;
            return (
              <div
                key={ag.id}
                onClick={() => setSelectedAgent(ag)}
                className={`p-4 rounded border transition-colors cursor-pointer font-mono text-xs ${
                  isSelected
                    ? 'bg-white border-[#111111] shadow-2xs'
                    : 'bg-[#FFFFFF]/60 hover:bg-white border-[#E5E5E5]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#111111] uppercase">{ag.name}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded border border-[#E5E5E5] uppercase font-bold text-[#666666] bg-[#F7F7F5]">
                    {ag.status}
                  </span>
                </div>

                <div className="text-[10px] text-[#8A8A8A] mt-1 uppercase">ROLE: {ag.role}</div>
                <div className="text-[11px] text-[#666666] mt-2 font-sans line-clamp-2">{ag.description}</div>
              </div>
            );
          })}
        </div>

        {/* Agent Detailed Inspector */}
        {activeAgent && (
          <div className="lg:col-span-8 bg-white border border-[#E5E5E5] rounded p-6 space-y-6 shadow-2xs">
            <div className="flex items-start justify-between border-b border-[#E5E5E5] pb-4">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-0.5 rounded bg-[#F7F7F5] border border-[#E5E5E5] text-[#111111] font-mono text-[10px] uppercase font-bold">
                    ROLE: {activeAgent.role}
                  </span>
                  <span className="text-xs font-mono text-[#8A8A8A]">
                    ID: {activeAgent.id}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-[#111111] mt-1 font-mono uppercase">
                  {activeAgent.name}
                </h3>
                <p className="text-xs text-[#666666] mt-1 font-sans leading-relaxed">
                  {activeAgent.description}
                </p>
              </div>

              <div className="font-mono text-xs text-right space-y-1">
                <div className="text-[#8A8A8A]">MODEL: <span className="text-[#111111] font-bold">{activeAgent.model}</span></div>
                <div className="text-[#8A8A8A]">VERSION: <span className="text-[#111111]">v{activeAgent.version}</span></div>
                <div className="text-[#8A8A8A]">OWNER: <span className="text-[#111111]">{activeAgent.owner}</span></div>
              </div>
            </div>

            {/* System Prompt View */}
            <div>
              <div className="text-xs font-mono font-bold text-[#111111] uppercase mb-2">
                GOVERNING SYSTEM INSTRUCTIONS & PERSONA PROMPT
              </div>
              <div className="p-4 bg-[#F7F7F5] border border-[#E5E5E5] rounded text-xs font-mono text-[#111111] whitespace-pre-wrap leading-relaxed max-h-60 overflow-y-auto">
                {activeAgent.systemPrompt}
              </div>
            </div>

            {/* Capabilities and Permissions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
              <div className="bg-[#F7F7F5] p-4 rounded border border-[#E5E5E5] space-y-2">
                <span className="text-[#8A8A8A] font-bold uppercase block">CAPABILITIES:</span>
                <div className="flex flex-wrap gap-1.5">
                  {activeAgent.capabilities.map((c) => (
                    <span key={c} className="px-2 py-1 rounded bg-white border border-[#E5E5E5] text-[#111111] text-[10px]">
                      {c}
                    </span>
                  ))}
                </div>
              </div>

              <div className="bg-[#F7F7F5] p-4 rounded border border-[#E5E5E5] space-y-2">
                <span className="text-[#8A8A8A] font-bold uppercase block">PERMISSIONS & TOOL SCOPES:</span>
                <div className="flex flex-wrap gap-1.5">
                  {activeAgent.permissions.map((p) => (
                    <span key={p} className="px-2 py-1 rounded bg-white border border-[#E5E5E5] text-[#111111] text-[10px]">
                      {p}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Authorization & Safety Gate Status Matrix */}
            <div className="bg-[#F7F7F5] p-4 rounded border border-[#E5E5E5] space-y-3 font-mono text-xs">
              <span className="text-[#8A8A8A] font-bold uppercase block">GOVERNED TOOL AUTONOMY MATRIX</span>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {activeAgent.permissions.map((p) => {
                  const isHighRisk = p.includes('restart') || p.includes('delete') || p.includes('write') || p.includes('remediate');
                  return (
                    <div key={p} className="p-2 bg-white border border-[#E5E5E5] rounded flex items-center justify-between">
                      <span className="text-[10px] text-[#111111] truncate">{p}</span>
                      <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded uppercase border ${
                        isHighRisk
                          ? 'bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/20'
                          : 'bg-[#22C55E]/10 text-[#22C55E] border-[#22C55E]/20'
                      }`}>
                        {isHighRisk ? 'GOVERNED' : 'BYPASS'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Live Agent Logs */}
            <div className="space-y-2">
              <div className="text-xs font-mono font-bold text-[#111111] uppercase flex items-center space-x-1.5 select-none">
                <span className="w-1.5 h-1.5 rounded-full bg-[#3B82F6] animate-pulse" />
                <span>AGENT LOCAL TELEMETRY LOGS</span>
              </div>
              <div className="p-4 bg-[#111111] text-[#A3A3A3] border border-[#222222] rounded text-[10px] font-mono whitespace-pre-wrap leading-relaxed max-h-40 overflow-y-auto">
                <div>[2026-08-13 23:15:00] [SYSTEM] persona parameter validation: nominal.</div>
                <div>[2026-08-13 23:15:01] [LOAD] CPU load: 1.4% | Memory: 42MB | Context Window: 0.1%</div>
                <div>[2026-08-13 23:15:02] [NET] Connected to global vector memory: episodic-store-v1</div>
                <div>[2026-08-13 23:15:04] [INFO] Loaded system instructions: {activeAgent.role.replace('_', ' ').toUpperCase()} persona.</div>
                <div className="text-[#3B82F6]">[STATUS] Standing by for workflow events...</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

