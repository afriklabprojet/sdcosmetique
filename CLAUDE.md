# Instructions for Claude

## Package Manager
- **Use `bun`** for all package management, installation, and script execution:
  - Install: `bun install`
  - Dev server: `bun dev`
  - Build: `bun run build`
  - Lint: `bun run lint`
  - Test: `bun test` or `bunx playwright test`

## Command-line Tools
- **Prioritize Rust-based alternatives** for performance:
  - Use `rg` (ripgrep) instead of `grep` for searching file contents.
  - Use `fd` instead of `find` for finding files.
  - Use `graft` commands (`graft map`, `graft ask`, etc.) for codebase orientation and semantic searches.
