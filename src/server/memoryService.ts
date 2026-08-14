/**
 * NEXUS - Memory Service
 * Provides search and retrieval of episodic and operational memory for agents.
 */

import { memoryContainer } from '../repositories/memoryStore';
import { MemoryItem } from '../types/nexus';

export class MemoryService {
  async searchMemory(queryText: string, limit = 5): Promise<MemoryItem[]> {
    return memoryContainer.memories.query(queryText, limit);
  }

  async getMemoriesByAgent(agentId: string): Promise<MemoryItem[]> {
    return memoryContainer.memories.getByAgentId(agentId);
  }

  async addMemory(memory: Omit<MemoryItem, 'id' | 'createdAt'>): Promise<MemoryItem> {
    return memoryContainer.memories.add(memory);
  }

  async getAllMemories(): Promise<MemoryItem[]> {
    return memoryContainer.memories.getAll();
  }
}

export const memoryService = new MemoryService();
