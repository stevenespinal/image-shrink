const { app, BrowserWindow, Menu, globalShortcut } = require("electron");

process.env.NODE_ENV = "development";

const isDev = process.env.NODE_ENV !== "production" ? true : false;
const isMac = process.platform === "darwin" ? true : false;
const isWin = process.platform === "win32" ? true : false;

let mainWindow;

function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 500,
    height: 600,
    title: "Image Shrink",
    icon: `${__dirname}/assets/Icon_256x256.png`,
    resizable: isDev,
  });

  // mainWindow.loadURL(`file://${__dirname}/app/index.html`);
  mainWindow.loadFile(`./app/index.html`);
}

app.on("window-all-closed", () => {
  if (process.platform !== isMac) {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createMainWindow();
  }
});

app.on("ready", () => {
  createMainWindow();

  const mainMenu = Menu.buildFromTemplate(menu);
  Menu.setApplicationMenu(mainMenu);

  globalShortcut.register("CmdOrCtrl+R", () => mainWindow.reload());
  globalShortcut.register(isMac ? "Cmd+Alt+I" : "Ctrl+Shift+I", () =>
    mainWindow.toggleDevTools()
  );

  mainWindow.on("closed", () => (mainWindow = null));
});

const menu = [
  ...(isMac
    ? [
        {
          role: "appMenu",
        },
      ]
    : []),
  {
    role: "fileMenu",
  },
  ...(isDev
    ? [
        {
          label: "Developer",
          submenu: [
            { role: "reload" },
            { role: "forcereload" },
            { type: "separator" },
            { role: "toggledevtools" },
          ],
        },
      ]
    : []),
  // {
  //   label: "File",
  //   submenu: [
  //     {
  //       label: "Quit",
  //       // accelerator: isMac ? "Command+W" : "Ctrl+W",
  //       accelerator: "CmdOrCtrl+W",
  //       click: () => app.quit(),
  //     },
  //   ],
  // },
];
