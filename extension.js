const vscode = require("vscode");

let panel;

function activate(context) {
    context.subscriptions.push(
        vscode.commands.registerCommand("sqdbg-profiler-vs.openPanel", () => {
            if (panel) {
                panel.reveal(vscode.ViewColumn.One);
                return;
            }

            panel = vscode.window.createWebviewPanel(
                "sqdbgProfiler",
                "Squirrel Profiler",
                vscode.ViewColumn.One,
                {
                    enableScripts: true
                }
            );

            // initial content
            panel.webview.html = getWebviewContent("");

            panel.onDidDispose(() => {
                panel = null;
            });

            // Receiving messages from WebView (buttons)
            panel.webview.onDidReceiveMessage(message => {
                const session = vscode.debug.activeDebugSession;
                if (!session) return;

                switch(message.command) {
                    case "start":
                        session.customRequest("evaluate", { expression: "sqdbg_prof_start()" });
                        break;
                    case "stop":
                        session.customRequest("evaluate", { expression: "sqdbg_prof_stop()" });
                        break;
                    case "pause":
                        session.customRequest("evaluate", { expression: "sqdbg_prof_pause()" });
                        break;
                    case "resume":
                        session.customRequest("evaluate", { expression: "sqdbg_prof_resume()" });
                        break;
                    case "update":
                        // fetch profiler data and update the panel
                        session.customRequest("evaluate", { expression: "sqdbg_prof_gets(1)" }).then(result => {
                            const rawText = result.result || "";
                            updateProfilerPanel(rawText);
                        });
                        break;
                }
            });
        })
    );
}

function getProfilerControls() {
    return `
        <div>
            <button onclick="send('start')">Start</button>
            <button onclick="send('stop')">Stop</button>
            <button onclick="send('pause')">Pause</button>
            <button onclick="send('resume')">Resume</button>
            <button onclick="send('update')">Update</button>
        </div>
    `;
}

function getWebviewContent(initialText) {
    return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <title>Squirrel Profiler</title>
        </head>
        <body>
            <h1>Squirrel Profiler</h1>
            ${getProfilerControls()}
            <div id="output" style="max-height: 70vh; overflow: auto;">${initialText}</div>
            <script>
                const vscode = acquireVsCodeApi();

                // send command to extension
                function send(cmd) { vscode.postMessage({ command: cmd }); }

                // listen for profiler data updates
                window.addEventListener('message', event => {
                    const message = event.data;
                    if (message.type === 'profilerData') {
                        const outputDiv = document.getElementById('output');
                        outputDiv.innerHTML = message.payload;
                    }
                });
            </script>
        </body>
        </html>
    `;
}

function formatProfilerOutput(rawText) {
    if (!rawText) return "<i>No profiler data</i>";

    // remove leading and trailing quotes if present
    rawText = rawText.trim().replace(/^"|"$/g, "");

    // split lines by literal \n
    const lines = rawText.split("\\n").filter(l => l.trim().length > 0);
    let html = `<table style="font-family: monospace; border-collapse: collapse; width: 100%;">`;

    lines.forEach((line, index) => {
        html += "<tr>";
        const parts = line.trim().split(/\s+/);

        // if header line (first line), keep exact columns
        if (index === 0) {
            // header row – enforce exact columns
            const headers = ["%", "total time", "time/call", "calls", "func"];
            headers.forEach(col => {
                html += `<td style="padding: 2px 6px; border: 1px solid #ccc; white-space: nowrap; font-weight: bold;">${col}</td>`;
            });
        } else {
            const combinedCols = [];

            // combine numeric values with units
            for (let i = 0; i < parts.length - 3; i++) {
                let value = parts[i];
                if (i + 1 < parts.length - 3) {
                    const next = parts[i + 1];
                    if (/^(s|ms|us|ns)$/.test(next)) {
                        value = value + " " + next;
                        i++; // skip unit
                    }
                }
                combinedCols.push(value);
            }

            // last three elements as function name
            const funcParts = parts.slice(-3).join(" ");
            combinedCols.push(funcParts);

            combinedCols.forEach(col => {
                html += `<td style="padding: 2px 6px; border: 1px solid #ccc; white-space: nowrap;">${col}</td>`;
            });
        }
        html += "</tr>";
    });

    html += "</table>";
    return html;
}

// update the WebView panel with formatted profiler output
function updateProfilerPanel(rawText) {
    if (!panel) return;

    const htmlContent = formatProfilerOutput(rawText);

    // send a message to the webview to update only the output div
    panel.webview.postMessage({ type: "profilerData", payload: htmlContent });
}

function deactivate() {}

module.exports = { activate, deactivate };