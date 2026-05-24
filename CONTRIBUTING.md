# Contributing

This is a Final Year Project repository. The guidelines below apply if you are a collaborator, evaluator, or are building on top of this work.

## Reporting Issues

Open a GitHub Issue describing:
- What you did
- What you expected to happen
- What actually happened
- Python version, OS, and whether you have a GPU

## Making Changes

1. Fork the repository and create a branch from `main`.
2. Keep changes focused — one fix or feature per PR.
3. Do not re-run training notebooks unless you intend to retrain from scratch and update all metrics in `README.md` and `docs/model_config.json`.
4. Do not commit model weights (`.pth`, `.pkl`, `.npz`) — they belong in the model directory on the server, not in the repo.
5. Test locally before opening a pull request.

## Code Style

- Python: follow PEP 8 roughly. The existing codebase is dense; prioritize readability over brevity in new code.
- JavaScript: vanilla JS, no frameworks. Match the existing style.
- HTML/CSS: keep pages consistent with the existing dark theme.

## Security Issues

Do not open a public issue for security vulnerabilities. See [SECURITY.md](SECURITY.md).
