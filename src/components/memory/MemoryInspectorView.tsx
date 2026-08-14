import React, { useState } from 'react';
import { useNexus } from '../../context/NexusContext';
import { Search } from 'lucide-react';
import { motion } from 'motion/react';

export const MemoryInspectorView: React.FC = () => {
  const { memories } = useNexus();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');

  const filteredMemories = memories.filter((mem) => {
    const matchesSearch =
      mem.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mem.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())) ||
      mem.agentId.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType = selectedType === 'all' || mem.type === selectedType;

    return matchesSearch && matchesType;
  });

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto font-mono text-xs">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#E5E5E5] pb-4">
        <div>
          <h2 className="text-base font-bold text-[#111111] tracking-wider uppercase flex items-center space-x-1.5">
            <span className="w-1.5 h-1.5 rounded bg-[#111111] animate-quiet-pulse" />
            <span>ORGANIZATIONAL MEMORY STORE</span>
          </h2>
          <p className="text-xs text-[#666666] mt-1 font-sans">
            Inspect long-term organizational memories, historical incident precedent, and operational context vectors.
          </p>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex items-center space-x-3 text-xs">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-[#8A8A8A] absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search memory vector index..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-3 py-1.5 bg-white border border-[#E5E5E5] hover:border-[#111111] rounded text-xs text-[#111111] outline-none focus:border-[#111111] w-64 transition-colors"
            />
          </div>

          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-3 py-1.5 bg-white border border-[#E5E5E5] hover:border-[#111111] rounded text-xs text-[#111111] outline-none focus:border-[#111111] cursor-pointer transition-colors"
          >
            <option value="all">ALL MEMORY TYPES</option>
            <option value="episodic">EPISODIC</option>
            <option value="semantic">SEMANTIC</option>
            <option value="operational">OPERATIONAL</option>
          </select>
        </div>
      </div>

      {/* Memory Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredMemories.map((mem) => {
          const relevancePercent = Math.round(mem.importance * 100);

          let borderClass = 'border-l-4 border-l-[#8A8A8A]';
          if (mem.type === 'episodic') borderClass = 'border-l-4 border-l-[#8B5CF6]';
          else if (mem.type === 'semantic') borderClass = 'border-l-4 border-l-[#3B82F6]';
          else if (mem.type === 'operational') borderClass = 'border-l-4 border-l-[#F59E0B]';

          return (
            <motion.div
              key={mem.id}
              whileHover={{ y: -1.5 }}
              transition={{ duration: 0.12 }}
              className={`bg-white border-y border-r border-[#E5E5E5] rounded p-5 space-y-3.5 shadow-2xs font-mono flex flex-col justify-between ${borderClass}`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded bg-[#F7F7F5] border border-[#E5E5E5] text-[9px] font-bold uppercase text-[#111111] tracking-wider">
                    {mem.type}
                  </span>

                  <div className="flex flex-col items-end">
                    <span className="text-[10px] text-[#666666] font-bold">
                      RELEVANCE: {relevancePercent}%
                    </span>
                    <div className="w-16 h-1 bg-[#E5E5E5] rounded-full mt-1 overflow-hidden">
                      <div className="h-full bg-[#111111] rounded-full" style={{ width: `${relevancePercent}%` }} />
                    </div>
                  </div>
                </div>

                <p className="text-xs text-[#111111] font-sans leading-relaxed min-h-[48px]">
                  {mem.content}
                </p>
              </div>

              <div className="space-y-3 pt-2">
                {/* Tags */}
                <div className="flex flex-wrap gap-1">
                  {mem.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[9px] px-2 py-0.5 rounded bg-[#F7F7F5] border border-[#E5E5E5] text-[#666666] font-mono"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>

                {/* Sub-grid of vector storage details */}
                <div className="grid grid-cols-2 gap-2 text-[9px] text-[#8A8A8A] border-t border-[#E5E5E5]/60 pt-2 font-mono">
                  <div>
                    <span>VECTOR INDEX</span>
                    <span className="text-[#111111] block font-bold">0x{mem.id.slice(0, 6).toUpperCase()}</span>
                  </div>
                  <div>
                    <span>RETENTION</span>
                    <span className="text-[#22C55E] block font-bold">PERSISTENT</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-[#E5E5E5] flex items-center justify-between text-[10px] text-[#8A8A8A]">
                  <span>SOURCE: <strong className="text-[#111111]">{mem.agentId}</strong></span>
                  <span>{new Date(mem.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

