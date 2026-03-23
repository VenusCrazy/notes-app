import { Plugin } from '@notes-app/shared';

export interface PluginManifest {
  id: string;
  name: string;
  version: string;
  description: string;
  author?: string;
  main: string;
}

export interface PluginSystem {
  register(plugin: Plugin): void;
  unregister(pluginId: string): void;
  enable(pluginId: string): void;
  disable(pluginId: string): void;
  getPlugin(pluginId: string): Plugin | undefined;
  getAllPlugins(): Plugin[];
}
