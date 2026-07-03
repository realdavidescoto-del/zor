import { Type, type Static } from '@sinclair/typebox';

export const ZorConfigSchema = Type.Object({
  model: Type.String({ default: 'opencode/claude-sonnet-4', description: 'provider/model format' }),
  effort: Type.Union([
    Type.Literal('off'),
    Type.Literal('minimal'),
    Type.Literal('low'),
    Type.Literal('medium'),
    Type.Literal('high'),
    Type.Literal('xhigh'),
  ], { default: 'high' }),
  permissions: Type.Union([
    Type.Literal('auto'),
    Type.Literal('confirm'),
    Type.Literal('plan'),
    Type.Literal('deny'),
  ], { default: 'confirm' }),
  sandbox: Type.Boolean({ default: false }),
  session: Type.Object({
    dir: Type.String({ default: './.zor/sessions' }),
    compactThreshold: Type.Number({ default: 160000 }),
  }),
  mcp: Type.Object({
    servers: Type.Array(Type.String(), { default: [] }),
  }),
});

export type ZorConfig = Static<typeof ZorConfigSchema>;

export const defaultConfig: ZorConfig = {
  model: 'opencode/claude-sonnet-4',
  effort: 'high',
  permissions: 'confirm',
  sandbox: false,
  session: {
    dir: './.zor/sessions',
    compactThreshold: 160000,
  },
  mcp: { servers: [] },
};

export { loadConfig } from './config/loader';

export const VERSION = '0.1.0';