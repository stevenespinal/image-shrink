const { app, BrowserWindow, Menu } = require("electron");

process.env.NODE_ENV = "development";

const isDev = process.env.NODE_ENV !== "production" ? true : false;
const isMac = process.platform === "darwin" ? true : false;
// const isWin = process.platform === "win32" ? true : false;

let mainWindow;
let aboutWindow;

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

function createAboutWindow() {
  aboutWindow = new BrowserWindow({
    width: 300,
    height: 300,
    title: "About Image Shrink",
    icon: `${__dirname}/assets/Icon_256x256.png`,
    resizable: false,
  });

  aboutWindow.webContents.on("new-window", function (e, url) {
    e.preventDefault();
    require("electron").shell.openExternal(url);
  });

  // mainWindow.loadURL(`file://${__dirname}/app/index.html`);
  aboutWindow.loadFile(`./app/about.html`);
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

  // globalShortcut.register("CmdOrCtrl+R", () => mainWindow.reload());
  // globalShortcut.register(isMac ? "Cmd+Alt+I" : "Ctrl+Shift+I", () =>
  //   mainWindow.toggleDevTools()
  // );

  mainWindow.on("closed", () => (mainWindow = null));
});

const menu = [
  ...(isMac
    ? [
        {
          label: app.name,
          submenu: [
            {
              label: "About",
              click: createAboutWindow,
            },
          ],
        },
      ]
    : []),
  {
    role: "fileMenu",
  },
  ...(!isMac
    ? [
        {
          label: "Help",
          submenu: [
            {
              label: "About",
              click: createAboutWindow,
            },
          ],
        },
      ]
    : []),
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
