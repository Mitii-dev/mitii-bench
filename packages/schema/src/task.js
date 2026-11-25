import { z } from "zod";

const containsGrade = z.object({
  contains: z.object({
    file: z.string().min(1),
    text: z.string().min(1),
  }),
});

const notContainsGrade = z.object({
  notContains: z.object({
    file: z.string().min(1),
    text: z.string().min(1),
  }),
});

const existsGrade = z.object({
  exists: z.object({
    file: z.string().min(1),
  }),
});

const notExistsGrade = z.object({
  notExists: z.object({
    file: z.string().min(1),
  }),
});

const containsAnyGrade = z.object({
  containsAny: z
    .object({
      files: z.array(z.string().min(1)).min(1).optional(),
      file: z.string().min(1).optional(),
      text: z.string().min(1),
    })
    .refine((c) => Boolean(c.file || c.files?.length), {
      message: "containsAny requires file or files",
    }),
});

const dirHasFilesGrade = z.object({
  dirHasFiles: z.object({
    path: z.string().min(1),
    minimum: z.number().int().positive().optional(),
  }),
});

const fileMatchGrade = z.object({
  fileMatch: z
    .object({
      file: z.string().min(1).optional(),
      files: z.array(z.string().min(1)).min(1).optional(),
      patterns: z.array(z.string().min(1)).min(1),
      mode: z.enum(["all", "any"]).optional(),
    })
    .refine((c) => Boolean(c.file || c.files?.length), {
      message: "fileMatch requires file or files",
    }),
});

const workflowGrade = z.object({
  workflow: z.object({
    path: z.string().min(1),
    requireJobs: z.array(z.string().min(1)).optional(),
    requireTriggers: z.array(z.string().min(1)).optional(),
  }),
});

const uiTargetShape = {
  testId: z.string().min(1).optional(),
  role: z.string().min(1).optional(),
  name: z.string().min(1).optional(),
  text: z.string().min(1).optional(),
  label: z.string().min(1).optional(),
  focused: z.boolean().optional(),
};

const uiTarget = z.object(uiTargetShape).refine(
  (t) => Boolean(t.testId || t.role || t.text || t.label),
  { message: "ui target needs testId, role, text, or label" },
);

const uiTypeTarget = z
  .object({
    ...uiTargetShape,
    value: z.string(),
  })
  .refine((t) => Boolean(t.testId || t.role || t.text || t.label), {
    message: "ui type target needs testId, role, text, or label",
  });

const uiStep = z
  .object({
    click: uiTarget.optional(),
    type: uiTypeTarget.optional(),
    press: z.union([z.string().min(1), z.object({ key: z.string().min(1) })]).optional(),
    tab: z.union([z.literal(true), z.object({ shift: z.boolean().optional() })]).optional(),
    expect: uiTarget.optional(),
    expectNot: uiTarget.optional(),
  })
  .refine(
    (s) =>
      [s.click, s.type, s.press, s.tab, s.expect, s.expectNot].filter((v) => v !== undefined)
        .length === 1,
    { message: "each ui step needs exactly one action" },
  );

const uiGrade = z.object({
  ui: z
    .object({
      entry: z.string().min(1),
      steps: z.array(uiStep).min(1).optional(),
      testIds: z.array(z.string().min(1)).min(1).optional(),
      timeoutMs: z.number().optional(),
    })
    .refine((u) => Boolean(u.steps?.length || u.testIds?.length), {
      message: "ui check requires steps or testIds",
    }),
});

const testidGrade = z.object({
  testid: z.object({
    entry: z.string().min(1),
    ids: z.array(z.string().min(1)).min(1),
    timeoutMs: z.number().optional(),
  }),
});

const buildGrade = z.object({
  build: z.union([
    z.literal(true),
    z.object({ command: z.string().optional(), timeoutMs: z.number().optional() }),
  ]),
});

const typecheckGrade = z.object({
  typecheck: z.union([
    z.literal(true),
    z.object({ command: z.string().optional(), timeoutMs: z.number().optional() }),
  ]),
});

const compileGrade = z.object({
  compile: z.union([
    z.literal(true),
    z.object({
      build: z.boolean().optional(),
      typecheck: z.boolean().optional(),
      buildCommand: z.string().optional(),
      typecheckCommand: z.string().optional(),
      command: z.string().optional(),
      timeoutMs: z.number().optional(),
      buildTimeoutMs: z.number().optional(),
      typecheckTimeoutMs: z.number().optional(),
    }),
  ]),
});

const testGrade = z.object({
  test: z.union([
    z.literal(true),
    z.object({
      command: z.string().optional(),
      timeoutMs: z.number().optional(),
      env: z.record(z.string()).optional(),
    }),
  ]),
});

const browserGrade = z.object({
  browser: z.object({
    command: z.string().min(1),
    timeoutMs: z.number().optional(),
    url: z.string().optional(),
    steps: z.array(z.unknown()).optional(),
  }),
});

const commandGrade = z.object({
  command: z.object({
    run: z.string().min(1),
    exitCode: z.number().optional(),
    timeoutMs: z.number().optional(),
    stdoutContains: z.string().optional(),
    env: z.record(z.string()).optional(),
    label: z.string().optional(),
  }),
});

const readyProbe = z.object({
  path: z.string().optional(),
  status: z.number().optional(),
  method: z.string().optional(),
  stdoutContains: z.string().optional(),
});

const startGrade = z.object({
  start: z.object({
    command: z.string().min(1),
    env: z.record(z.string()).optional(),
    ready: readyProbe.optional(),
    timeoutMs: z.number().optional(),
    sidecar: z
      .object({
        command: z.string().min(1),
        env: z.record(z.string()).optional(),
        portEnv: z.string().min(1).optional(),
      })
      .optional(),
  }),
});

const stopGrade = z.object({
  stop: z.union([z.literal(true), z.object({})]),
});

const pretestGrade = z.object({
  pretest: z.object({
    command: z.string().min(1),
    timeoutMs: z.number().optional(),
    env: z.record(z.string()).optional(),
    exitCode: z.number().optional(),
  }),
});

const posttestGrade = z.object({
  posttest: z.object({
    command: z.string().min(1),
    timeoutMs: z.number().optional(),
    env: z.record(z.string()).optional(),
    exitCode: z.number().optional(),
  }),
});

const httpExpect = z.object({
  status: z.number().optional(),
  bodyContains: z.string().optional(),
  jsonType: z.enum(["array", "object", "string", "number", "boolean", "null"]).optional(),
  jsonSubset: z.unknown().optional(),
  jsonEquals: z.unknown().optional(),
  jsonPaths: z.array(z.string()).optional(),
  headers: z.record(z.string()).optional(),
  headerContains: z.record(z.string()).optional(),
});

const httpRequest = z.object({
  method: z.string().optional(),
  path: z.string().min(1),
  json: z.unknown().optional(),
  headers: z.record(z.string()).optional(),
  expect: httpExpect.optional(),
});

const httpGrade = z.object({
  http: z.object({
    /** Optional when a suite `start:` is already running. */
    start: z
      .object({
        command: z.string().min(1),
        env: z.record(z.string()).optional(),
      })
      .optional(),
    sidecar: z
      .object({
        command: z.string().min(1),
        env: z.record(z.string()).optional(),
        portEnv: z.string().min(1).optional(),
      })
      .optional(),
    request: httpRequest.optional(),
    requests: z.array(httpRequest).optional(),
    expect: httpExpect.optional(),
    timeoutMs: z.number().optional(),
  }),
});

const sqliteGrade = z.object({
  sqlite_query: z.object({
    dbPath: z.string().min(1),
    sql: z.string().min(1),
    column: z.string().optional(),
    row: z.number().optional(),
    equals: z.union([z.string(), z.number(), z.boolean()]).optional(),
    minimum: z.number().optional(),
  }),
});

const packageSpec = z.union([
  z.string().min(1),
  z.object({
    name: z.string().min(1),
    min: z.string().min(1).optional(),
    max: z.string().min(1).optional(),
    equals: z.string().min(1).optional(),
    installed: z.boolean().optional(),
  }),
]);

const packageDepsGrade = z.object({
  package_deps: z.union([
    z.array(packageSpec).min(1),
    z.object({
      packages: z.array(packageSpec).min(1),
      file: z.string().optional(),
      /** When true, require each package under node_modules (unless overridden per package). */
      installed: z.boolean().optional(),
    }),
  ]),
});

const workspaceChangedGrade = z.object({
  workspace_changed: z.boolean(),
});

const workspaceUnchangedGrade = z.object({
  workspace_unchanged: z.boolean(),
});

export const CheckItemSchema = z.union([
  containsGrade,
  notContainsGrade,
  existsGrade,
  notExistsGrade,
  containsAnyGrade,
  dirHasFilesGrade,
  fileMatchGrade,
  workflowGrade,
  uiGrade,
  testidGrade,
  buildGrade,
  typecheckGrade,
  compileGrade,
  testGrade,
  browserGrade,
  commandGrade,
  startGrade,
  stopGrade,
  pretestGrade,
  posttestGrade,
  httpGrade,
  sqliteGrade,
  packageDepsGrade,
  workspaceChangedGrade,
  workspaceUnchangedGrade,
]);

/** @deprecated use CheckItemSchema */
export const GradeItemSchema = CheckItemSchema;

export const FAMILY_VALUES = [
  "frontend",
  "api",
  "fullstack",
  "repair",
  "migration",
  "project",
];

/** Top-level suite language folder: cases/js, cases/python, … */
export const ECOSYSTEM_VALUES = ["js", "python", "go", "java", "rust", "other"];

/** Canonical starter ids under starters/{ecosystem}/ */
export const STARTER_ALIASES = {
  "base-react-js": "react-js",
  "base-next-js": "next-js",
  "base-node": "node",
  "base-nest-js": "nest-js",
  "base-ts-lib": "ts-lib",
  "react-js": "react-js",
  "next-js": "next-js",
  node: "node",
  "nest-js": "nest-js",
  "ts-lib": "ts-lib",
};

export function normalizeStarterId(raw) {
  if (!raw) return null;
  return STARTER_ALIASES[raw] ?? String(raw).replace(/^base-/, "");
}

/**
 * Migration-only helper: map legacy bases[] / fixture to a single starter id.
 * Not used by the runtime loader.
 */
export function starterFromLegacy(task) {
  if (task.starter) return normalizeStarterId(task.starter);
  if (Array.isArray(task.bases) && task.bases.length > 0) {
    return normalizeStarterId(task.bases[0]);
  }
  if (task.fixture) return normalizeStarterId(task.fixture);
  if (task.type === "migration" && task.toBase) return normalizeStarterId(task.toBase);
  return null;
}

export const TaskSchema = z
  .object({
    id: z.string().min(1),
    title: z.string().min(1),
    ecosystem: z.enum(ECOSYSTEM_VALUES).optional().default("js"),
    /** Single blank-project starter under starters/{ecosystem}/ */
    starter: z.string().min(1),
    family: z.enum(FAMILY_VALUES).optional().default("frontend"),
    packages: z.array(z.string()).optional().default([]),
    type: z.enum(["atomic", "migration"]).optional().default("atomic"),
    fromBase: z.string().optional(),
    toBase: z.string().optional(),
    difficulty: z.enum(["easy", "medium", "hard"]),
    category: z.string().min(1),
    language: z.string().optional().default("javascript"),
    tags: z.array(z.string()).optional().default([]),
    timeoutSec: z.number().int().positive().optional().default(300),
    prompt: z.string().optional(),
    promptFile: z.string().optional().default("prompt.md"),
    readmeFile: z.string().optional().default("README.md"),
    rationale: z.string().optional(),
    setup: z
      .object({
        script: z.string().optional(),
        mock: z.string().optional(),
        env: z.record(z.string()).optional(),
      })
      .optional(),
    checks: z.array(CheckItemSchema).optional().default([]),
    agent: z
      .object({
        mode: z.enum(["agent", "ask", "plan"]).optional().default("agent"),
        workspacePolicy: z.string().optional().default("starter-copy"),
      })
      .optional()
      .default({ mode: "agent", workspacePolicy: "starter-copy" }),
  })
  .superRefine((t, ctx) => {
    if (!t.starter || !String(t.starter).trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Provide starter: (e.g. react-js, next-js, node)",
      });
    }
    if (t.type === "migration" && (!t.fromBase || !t.toBase)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "migration tasks require fromBase and toBase",
      });
    }
  })
  .transform((t) => ({
    ...t,
    starter: normalizeStarterId(t.starter) ?? t.starter,
  }));

export const ManifestSchema = z.object({
  projectId: z.string().min(1),
  title: z.string().optional(),
  ecosystem: z.enum(ECOSYSTEM_VALUES).optional().default("js"),
  language: z.string().optional().default("javascript"),
  cumulative: z.boolean().default(true),
  starter: z.string().optional(),
  family: z.enum(FAMILY_VALUES).optional().default("project"),
  sequence: z
    .array(
      z.object({
        step: z.number().int().positive(),
        caseDir: z.string().min(1),
        weight: z.number().optional().default(1),
        regression: z.boolean().optional().default(true),
      }),
    )
    .min(1),
});
