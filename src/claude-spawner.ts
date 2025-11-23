// Claude Spawner for InnerVoice
// Spawns Claude Code instances remotely from Telegram

import { spawn, ChildProcess } from 'child_process';
import { findProject, touchProject } from './project-registry.js';

interface SpawnedProcess {
  projectName: string;
  process: ChildProcess;
  startTime: Date;
  initialPrompt?: string;
}

const activeProcesses = new Map<string, SpawnedProcess>();

// Spawn Claude in a project
export async function spawnClaude(
  projectName: string,
  initialPrompt?: string
): Promise<{ success: boolean; message: string; pid?: number }> {
  // Check if already running
  if (activeProcesses.has(projectName)) {
    return {
      success: false,
      message: `Claude is already running in ${projectName}`
    };
  }

  // Find project in registry
  const project = await findProject(projectName);
  if (!project) {
    return {
      success: false,
      message: `Project "${projectName}" not found in registry. Register it first with: /register ProjectName /path/to/project`
    };
  }

  try {
    // Spawn Claude Code
    const claudeProcess = spawn('claude', initialPrompt ? [initialPrompt] : [], {
      cwd: project.path,
      stdio: ['ignore', 'pipe', 'pipe'],
      detached: true,
      env: {
        ...process.env,
        INNERVOICE_SPAWNED: '1' // Mark as spawned by InnerVoice
      }
    });

    // Store process
    activeProcesses.set(projectName, {
      projectName,
      process: claudeProcess,
      startTime: new Date(),
      initialPrompt
    });

    // Update last accessed
    await touchProject(projectName);

    // Log output (for debugging)
    if (claudeProcess.stdout) {
      claudeProcess.stdout.on('data', (data) => {
        console.log(`[${projectName}] ${data.toString().trim()}`);
      });
    }

    if (claudeProcess.stderr) {
      claudeProcess.stderr.on('data', (data) => {
        console.error(`[${projectName}] ${data.toString().trim()}`);
      });
    }

    // Handle exit
    claudeProcess.on('exit', (code) => {
      console.log(`🛑 Claude exited in ${projectName} (code: ${code})`);
      activeProcesses.delete(projectName);
    });

    claudeProcess.on('error', (error) => {
      console.error(`❌ Error spawning Claude in ${projectName}:`, error);
      activeProcesses.delete(projectName);
    });

    // Unref so it doesn't keep Node running
    claudeProcess.unref();

    return {
      success: true,
      message: `✅ Claude started in ${projectName}${initialPrompt ? ` with prompt: "${initialPrompt}"` : ''}`,
      pid: claudeProcess.pid
    };
  } catch (error: any) {
    return {
      success: false,
      message: `Failed to spawn Claude: ${error.message}`
    };
  }
}

// Kill a spawned Claude process
export function killClaude(projectName: string): { success: boolean; message: string } {
  const spawned = activeProcesses.get(projectName);

  if (!spawned) {
    return {
      success: false,
      message: `No active Claude process found for ${projectName}`
    };
  }

  try {
    spawned.process.kill('SIGTERM');
    activeProcesses.delete(projectName);
    return {
      success: true,
      message: `✅ Claude process terminated in ${projectName}`
    };
  } catch (error: any) {
    return {
      success: false,
      message: `Failed to kill process: ${error.message}`
    };
  }
}

// List all spawned processes
export function listSpawnedProcesses(): Array<{
  projectName: string;
  pid?: number;
  startTime: Date;
  initialPrompt?: string;
  runningMinutes: number;
}> {
  return Array.from(activeProcesses.values()).map(sp => ({
    projectName: sp.projectName,
    pid: sp.process.pid,
    startTime: sp.startTime,
    initialPrompt: sp.initialPrompt,
    runningMinutes: Math.floor((Date.now() - sp.startTime.getTime()) / 60000)
  }));
}

// Check if Claude is running in a project
export function isClaudeRunning(projectName: string): boolean {
  return activeProcesses.has(projectName);
}
