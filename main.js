const path = require("path");
const os = require("os");
const imagemin = require("imagemin");
const imageminMozjpeg = require("imagemin-mozjpeg");
const imageminPngquant = require("imagemin-pngquant");
const slash = require("slash");
const { app, BrowserWindow, Menu, ipcMain, shell } = require("electron");
const log = require("electron-log");

process.env.NODE_ENV = "production";

const isDev = process.env.NODE_ENV !== "production" ? true : false;
const isMac = process.platform === "darwin" ? true : false;
// const isWin = process.platform === "win32" ? true : false;

let mainWindow;
let aboutWindow;

function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: isDev ? 800 : 500,
    height: 600,
    title: "Image Shrink",
    icon: `${__dirname}/assets/Icon_256x256.png`,
    resizable: isDev,
    webPreferences: {
      // allows us to import node modules in html scripts
      nodeIntegration: true,
    },
    enableRemoteModule: true,
  });

  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

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

ipcMain.on("image:minimize", (e, data) => {
  // console.log(data);
  data.dest = path.join(`${os.homedir}\\Desktop\\imageshrink`);
  shrinkImage(data);
});

async function shrinkImage({ imgPath, quality, dest }) {
  const pngQuality = quality / 100;
  try {
    const files = await imagemin([slash(imgPath)], {
      destination: dest,
      plugins: [
        imageminMozjpeg({ quality }),
        imageminPngquant({
          quality: [pngQuality, pngQuality],
        }),
      ],
    });
    // console.log(files);
    shell.openPath(dest);
    log.info(files);
    mainWindow.webContents.send("image:done");
  } catch (error) {
    console.error(error);
    log.error(error);
  }
}

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
