import fs from 'fs/promises';
import { exec } from 'child_process';
import util from 'util';
import path from 'path';

const execAsync = util.promisify(exec);

export const tools = [
  {
    name: 'bash',
    description: 'Execute a bash/shell command. On Windows, this runs in PowerShell or CMD.',
    input_schema: {
      type: 'object',
      properties: {
        command: { type: 'string', description: 'The command to execute' }
      },
      required: ['command']
    }
  },
  {
    name: 'read_file',
    description: 'Read the contents of a file',
    input_schema: {
      type: 'object',
      properties: {
        file_path: { type: 'string', description: 'Path to the file' }
      },
      required: ['file_path']
    }
  },
  {
    name: 'write_file',
    description: 'Write contents to a file',
    input_schema: {
      type: 'object',
      properties: {
        file_path: { type: 'string', description: 'Path to the file' },
        content: { type: 'string', description: 'Content to write' }
      },
      required: ['file_path', 'content']
    }
  },
  {
    name: 'edit_file',
    description: 'Edit a file by replacing old_string with new_string',
    input_schema: {
      type: 'object',
      properties: {
        file_path: { type: 'string', description: 'Path to the file' },
        old_string: { type: 'string', description: 'Exact string to replace' },
        new_string: { type: 'string', description: 'String to replace with' }
      },
      required: ['file_path', 'old_string', 'new_string']
    }
  }
];

export async function executeTool(name: string, input: any): Promise<string> {
  const cwd = process.cwd();
  try {
    switch (name) {
      case 'bash': {
        const { stdout, stderr } = await execAsync(input.command);
        return stdout + (stderr ? `\nSTDERR:\n${stderr}` : '');
      }
      case 'read_file': {
        const fullPath = path.resolve(cwd, input.file_path);
        const data = await fs.readFile(fullPath, 'utf8');
        return data;
      }
      case 'write_file': {
        const fullPath = path.resolve(cwd, input.file_path);
        await fs.mkdir(path.dirname(fullPath), { recursive: true });
        await fs.writeFile(fullPath, input.content, 'utf8');
        return `Successfully wrote to ${input.file_path}`;
      }
      case 'edit_file': {
        const fullPath = path.resolve(cwd, input.file_path);
        const data = await fs.readFile(fullPath, 'utf8');
        if (!data.includes(input.old_string)) {
          return `Error: old_string not found in ${input.file_path}`;
        }
        const newData = data.replace(input.old_string, input.new_string);
        await fs.writeFile(fullPath, newData, 'utf8');
        return `Successfully edited ${input.file_path}`;
      }
      default:
        return `Tool ${name} not implemented.`;
    }
  } catch (error: any) {
    return `Error executing ${name}: ${error.message}`;
  }
}
