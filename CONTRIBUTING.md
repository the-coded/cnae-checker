# Contributing

Thank you for your interest in contributing to CNAE Checker!

## Getting Started

```bash
git clone https://github.com/the-coded/cnae-checker.git
cd cnae-checker
npm install
npm start         # Run full pipeline to verify your setup
```

## Project Structure

See [README.md](README.md#project-structure) for a full directory overview. Key entry points:

| File | Purpose |
|------|---------|
| `scripts/start.js` | Full pipeline orchestrator |
| `scripts/extract.js` | CNAE 2.0 classes parser |
| `scripts/extract-subclasses.js` | CNAE 2.3 subclasses parser |
| `scripts/check.js` | Validation for both outputs |
| `scripts/build-web.js` | Web viewer generator |
| `scripts/build-embeddings.js` | Embedding pre-computation |

## How to Contribute

### Reporting Issues

- Use the [GitHub Issues](https://github.com/the-coded/cnae-checker/issues) tracker
- Include the exact error output and your Node.js version (`node -v`)
- For IBGE data issues, include the URL that failed

### Submitting Changes

1. Fork the repository
2. Create a feature branch: `git checkout -b feat/my-change`
3. Make your changes
4. Run the full pipeline to confirm nothing is broken: `npm start`
5. If you changed CNAE data or parsing: `npm run check` must pass
6. Submit a Pull Request with a clear description of what changed and why

### Good First Issues

- Improving error messages in `scripts/check.js`
- Adding support for `.zip` archives (see `docs/update-process.md`)
- Improving Portuguese stopword list in `scripts/extract.js`
- Adding a score threshold control to the semantic search UI

## Code Style

- Plain JavaScript (Node.js 20+) — no build step, no TypeScript
- `require()` over ES modules for compatibility
- Descriptive `console.log` output with emoji prefixes (`✅`, `❌`, `⚠️`) for pipeline visibility
- Keep scripts independent — each should work standalone

## Documentation

If your change affects the data schema, pipeline behavior, or adds a new feature, please update the relevant doc in `docs/`.

## License

By contributing, you agree that your contributions will be licensed under the [MIT License](LICENSE).
