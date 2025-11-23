// Project Registry for InnerVoice
// Manages known projects and their locations for remote spawning

import fs from 'fs/promises';
import path from 'path';
import { existsSync } from 'fs';

const REGISTRY_PATH = path.join(process.env.HOME || '~', '.innervoice', 'projects.json');

export interface RegisteredProject {
  name: string;
  path: string;
  lastAccessed: Date;
  autoSpawn: boolean; // Auto-spawn when message received
  metadata?: {
    description?: string;
    tags?: string[];
  };
}

// Ensure registry file exists
async function ensureRegistry(): Promise<void> {
  const dir = path.dirname(REGISTRY_PATH);
  if (!existsSync(dir)) {
    await fs.mkdir(dir, { recursive: true });
  }

  if (!existsSync(REGISTRY_PATH)) {
    await fs.writeFile(REGISTRY_PATH, JSON.stringify([], null, 2));
  }
}

// Load all registered projects
export async function loadProjects(): Promise<RegisteredProject[]> {
  await ensureRegistry();

  try {
    const content = await fs.readFile(REGISTRY_PATH, 'utf-8');
    const projects = JSON.parse(content);
    // Convert date strings back to Date objects
    return projects.map((p: any) => ({
      ...p,
      lastAccessed: new Date(p.lastAccessed)
    }));
  } catch (error) {
    console.error('Error loading project registry:', error);
    return [];
  }
}

// Save projects to registry
export async function saveProjects(projects: RegisteredProject[]): Promise<void> {
  await ensureRegistry();
  await fs.writeFile(REGISTRY_PATH, JSON.stringify(projects, null, 2));
}

// Register a new project
export async function registerProject(
  name: string,
  projectPath: string,
  options?: { autoSpawn?: boolean; description?: string; tags?: string[] }
): Promise<RegisteredProject> {
  const projects = await loadProjects();

  // Check if already exists
  const existing = projects.find(p => p.name.toLowerCase() === name.toLowerCase());
  if (existing) {
    // Update existing
    existing.path = projectPath;
    existing.lastAccessed = new Date();
    if (options?.autoSpawn !== undefined) existing.autoSpawn = options.autoSpawn;
    if (options?.description) {
      existing.metadata = existing.metadata || {};
      existing.metadata.description = options.description;
    }
    if (options?.tags) {
      existing.metadata = existing.metadata || {};
      existing.metadata.tags = options.tags;
    }
    await saveProjects(projects);
    return existing;
  }

  // Create new
  const newProject: RegisteredProject = {
    name,
    path: projectPath,
    lastAccessed: new Date(),
    autoSpawn: options?.autoSpawn ?? false,
    metadata: {
      description: options?.description,
      tags: options?.tags
    }
  };

  projects.push(newProject);
  await saveProjects(projects);

  console.log(`📝 Registered project: ${name} at ${projectPath}`);
  return newProject;
}

// Unregister a project
export async function unregisterProject(name: string): Promise<boolean> {
  const projects = await loadProjects();
  const filtered = projects.filter(p => p.name.toLowerCase() !== name.toLowerCase());

  if (filtered.length === projects.length) {
    return false; // Not found
  }

  await saveProjects(filtered);
  console.log(`🗑️  Unregistered project: ${name}`);
  return true;
}

// Find a project by name
export async function findProject(name: string): Promise<RegisteredProject | null> {
  const projects = await loadProjects();
  return projects.find(p => p.name.toLowerCase() === name.toLowerCase()) || null;
}

// Update last accessed time
export async function touchProject(name: string): Promise<void> {
  const projects = await loadProjects();
  const project = projects.find(p => p.name.toLowerCase() === name.toLowerCase());

  if (project) {
    project.lastAccessed = new Date();
    await saveProjects(projects);
  }
}

// Get projects eligible for auto-spawn
export async function getAutoSpawnProjects(): Promise<RegisteredProject[]> {
  const projects = await loadProjects();
  return projects.filter(p => p.autoSpawn);
}

// Check if a project path exists
export async function validateProjectPath(projectPath: string): Promise<boolean> {
  try {
    const stats = await fs.stat(projectPath);
    return stats.isDirectory();
  } catch {
    return false;
  }
}
