# Squirrel Profiler VS

**Squirrel Profiler VS** is a simple Visual Studio Code extension providing a UI for the `sqdbg` profiler used in OpenTTD. It allows you to start, stop, pause, resume, and update profiler sessions, and view a flat graph of profiling data directly in VS Code.

## Features

- Start, stop, pause, and resume profiling.
- Fetch and display profiler data in a table.
- Simple flat graph representation of function execution times.
- Scrollable output for long sessions.
- Lightweight and easy to use.

## Installation

You can install **Squirrel Profiler VS** directly as a VS Code extension:

1. Download the `.vsix` package from [here](https://github.com/PaSaSaP/sqdbg-profiler-vs/releases/download/0.1.0/sqdbg-profiler-vs-0.1.0.vsix).
2. Open Visual Studio Code.
3. Press `Ctrl+Shift+P` (or `Cmd+Shift+P` on macOS) to open the Command Palette.
4. Select `Extensions: Install from VSIX...`.
5. Choose the downloaded `.vsix` file.
6. Once installed, open the command palette again and run `Open Squirrel Profiler`.

## Usage

Once the profiler panel is open:

- **Start** – start a new profiling session.
- **Stop** – stop the current profiling session.
- **Pause** – pause profiling.
- **Resume** – resume paused profiling.
- **Update** – fetch and display the latest profiling data.

The profiler output will appear in a table with columns:

- `%` – percentage of total execution time.
- `total time` – total time spent in the function.
- `time/call` – average time per call.
- `calls` – number of function calls.
- `func` – function name, file, and address.

## Requirements

- Patched OpenTTD from [OpenTTD-sqdbg-debugger](https://github.com/PaSaSaP/OpenTTD-sqdbg-debugger), branch `sqdbg`.
- VS Code ≥ 1.80.

## License

MIT, see [LICENSE](LICENSE).
