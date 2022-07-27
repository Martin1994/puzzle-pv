import { app, BrowserWindow } from "electron";
import * as path from "path";

async function main(): Promise<void> {
    await app.whenReady();

    const win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });

    await win.loadFile(path.join(__dirname, "..", "..", "static", "index.html"), { search: "record=1" });
}

main().catch(err => {
    console.error(err);
    process.exit(1);
});
