import {
  defineNuxtModule,
  installModule,
  addImportsDir,
  createResolver,
  addPlugin,
  addComponentsDir,
  addImports,
  addLayout,
  addRouteMiddleware,
} from "@nuxt/kit";

import fs from "fs";
import path from "path";
import pkg from "fs-extra";
const { copySync } = pkg;
import copyJsonFile from "./runtime/app/utils/copyJsonFile.js";
import getPages from "./runtime/app/utils/getPages.js";
import createTsConfigFile from "./runtime/app/utils/createTsConfigFile.js";
export interface ModuleOptions {}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: "webapp-nuxt-module",
    configKey: "webappModule",
  },

  defaults: {},
  async setup(options: Record<any, any>, nuxt) {
    const { resolve } = createResolver(import.meta.url);
    const runtimeDir = resolve("./runtime/app");
    const layers: string[] = options.layers || [];
    // Add the runtime directory to the transpile array
    nuxt.options.build.transpile.push(runtimeDir);
    // // Add global.scss to the global CSS array
    nuxt.options.css = nuxt.options.css || [];
    nuxt.options.css.push(
      resolve(runtimeDir, "assets", "styles", "tailwind.css")
    );
    nuxt.options.css.push(
      resolve(runtimeDir, "assets", "styles", "global.scss")
    ); 

    // Install external modules
    const modulesToInstall = [
      "@nuxt/ui",
      "@vueuse/nuxt",
      "nuxt-swiper",
      "@nuxt/content",
      "@pinia/nuxt",
      "@nuxtjs/i18n",
      // "nuxt-content-assets",
    ];
    for (const mod of modulesToInstall) {
      await installModule(mod);
    }

    addImports([
      { name: "ref", from: "vue" },
      { name: "reactive", from: "vue" },
      { name: "computed", from: "vue" },
      { name: "watch", from: "vue" },
      { name: "onMounted", from: "vue" },
      { name: "onUpdated", from: "vue" },
      { name: "onUnmounted", from: "vue" },
      { name: "toRefs", from: "vue" },
      { name: "useAttrs", from: "vue" },
      { name: "useSlots", from: "vue" },
      { name: "provide", from: "vue" },
      { name: "inject", from: "vue" },
      { name: "nextTick", from: "vue" },
      { name: "defineProps", from: "vue" },
      { name: "defineEmits", from: "vue" },
    ]);

    // add import utils, stores, composables
    const dirsToAdd = ["utils", "composables", "stores"];
    for (const dir of dirsToAdd) {
      addImportsDir(resolve(runtimeDir, dir));
    }

    // add middleware
    const middlewareDir = resolve(runtimeDir, "middlewares");
    if (fs.existsSync(middlewareDir)) {
      const middlewareFiles = fs
        .readdirSync(middlewareDir)
        .filter((file) => file.endsWith(".js"));
      middlewareFiles.forEach((file) => {
        const name = file.replace(/\.js$/, ""); // Remove .js extension
        const filePath = resolve(middlewareDir, file);
        addRouteMiddleware({ name: name, path: filePath, global: false });
      });
    }

    // Copy fonts from runtime to assets/fonts
    nuxt.hook("build:before", () => {
      const srcDir = resolve("./runtime/app/assets/fonts");
      const destDir = path.join(nuxt.options.rootDir, "assets/fonts");

      if (fs.existsSync(destDir)) {
        fs.rmSync(destDir, { recursive: true, force: true });
      }

      copySync(srcDir, destDir, { overwrite: true });
    });

    // add layouts
    const layoutsDir = resolve(runtimeDir, "layouts");
    if (fs.existsSync(layoutsDir)) {
      const layoutFiles = fs
        .readdirSync(layoutsDir)
        .filter((file) => file.endsWith(".vue"));
      layoutFiles.forEach((file) => {
        const name = file.replace(/\.vue$/, ""); // Remove .vue extension
        addLayout(resolve(layoutsDir, file), name);
      });
    }

    // Add components and recursively
    addComponentsDir({
      path: resolve(runtimeDir, "components"),
      prefix: options.prefix || "",
      pathPrefix: false,
    });
    const componentsDir = path.join(runtimeDir, "components");
    console.log("Components: ----------------->",componentsDir);
    function addComponentsFromDir(
      directory: string,
      baseDir: string = componentsDir
    ) {
      const items = fs.readdirSync(directory, { withFileTypes: true });
      items.forEach((item) => {
        const itemPath = path.join(directory, item.name);
        if (item.isDirectory()) {
          addComponentsDir({
            path: resolve(
              runtimeDir,
              "components",
              path.relative(baseDir, itemPath).replace(/\\/g, "/")
            ),
            prefix: options.prefix || "",
            pathPrefix: false,
          });
          // // Recursively process subdirectories
          addComponentsFromDir(itemPath, baseDir);
        }
      });
    }
    addComponentsFromDir(componentsDir);

    // // Add plugin
    addPlugin(resolve(runtimeDir, "plugins", "plugin"));
    addPlugin(resolve(runtimeDir, "plugins", "assets"));

    // Merge lang JSON files to app locales
    const lang = ["km", "en"];

    for (const lan of lang) {
      const assetLangs = layers?.map((l) => {
        const baseDir = path.dirname(
          path.posix.join(...process.cwd().split(/\\+/))
        );
        return `${baseDir}/${l}/assets/lang/${lan}.json`;
      });

      // Add current working directory's assets path at the beginning
      assetLangs.unshift(
        `${path.posix.join(
          ...process.cwd().split(/\\+/)
        )}/assets/lang/${lan}.json`
      );

      copyJsonFile({
        inputPaths: assetLangs.reverse(),
        outputPath: `${path.posix.join(
          ...process.cwd().split(/\\+/)
        )}/_locales/${lan}.json`,
        deep: false,
      });
    }

    // Create tsconfig.json file
    createTsConfigFile(layers);

    // Create km routes when generate
    nuxt.hook("nitro:config", async (nitroConfig) => {
      if (nitroConfig.prerender?.routes) {
        const pages = [...["pages"], ...layers.map((l) => `../${l}/pages`)];
        const routes = [
          "/km",
          ...getPages(pages).map((r: string) => `/km/${r}`),
        ];

        nitroConfig.prerender.routes.push(...routes);
      }
    });
  },
});


// import { defineNuxtModule, addPlugin, createResolver, addComponentsDir } from '@nuxt/kit'

// // Module options TypeScript interface definition
// export interface ModuleOptions {}

// export default defineNuxtModule<ModuleOptions>({
//   meta: {
//     name: 'my-module',
//     configKey: 'myModule',
//   },
//   // Default configuration options of the Nuxt module
//   defaults: {},
//   setup(_options, _nuxt) {
//     const resolver = createResolver(import.meta.url)

//     addComponentsDir({
//       path: resolver.resolve("./runtime/app/components"),
//       pathPrefix: false,
//       extensions: ["vue"],
//       prefix: "",
//     });

//     addComponentsDir({
//       path: resolver.resolve("./runtime/app/utils"),
//       pathPrefix: false,
//       extensions: ["js"],
//       prefix: "",
//     });

//     addComponentsDir({
//       path: resolver.resolve("./runtime/app/composables"),
//       pathPrefix: false,
//       extensions: ["js"],
//       prefix: "",
//     });
    
//     // Do not add the extension since the `.ts` will be transpiled to `.mjs` after `npm run prepack`
//     addPlugin(resolver.resolve('./runtime/plugin'))
//   },
// })
