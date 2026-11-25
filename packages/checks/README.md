# `@mitii-bench/checks`

Pluggable graders for Mitii Bench. Author docs: [`docs/CHECKS.md`](../../docs/CHECKS.md).

## Layout

```text
src/
  index.js              Public API
  compile/              YAML → internal checks (mode-aware workspace policy)
  verify/               Dispatch + registerCheck()
  shared/               result, process, snapshot
  builtins/             One module per check concern
```

Each builtin typically exports `tryCompile` and/or `verify`, then is registered in `builtins/index.js`.
