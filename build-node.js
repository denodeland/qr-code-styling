const path = require("path");
const fs = require("fs/promises");

const arg = process.argv[2];

const cornerSquareFolder = path.join(__dirname, "src/figures/cornerSquare");
const cornerSquareDyanmicPaths = ["shape12Path"];
const cornerDotFolder = path.join(__dirname, "src/figures/cornerDot");
const cornerDotDyanmicPaths = ["square3Path"];

const emptyContent = "export default null;\n";

async function fillStaticFile(folder, file) {
  const content = await fs.readFile(path.join(folder, `${file}.ts`), "utf8");
  await fs.writeFile(path.join(folder, `${file}.static.ts`), content);
}

/* 
  Fill dynamic imports with static content in node build
*/
async function prebuild() {
  await Promise.all(cornerSquareDyanmicPaths.map((file) => fillStaticFile(cornerSquareFolder, file)));
  await Promise.all(cornerDotDyanmicPaths.map((file) => fillStaticFile(cornerDotFolder, file)));
}

async function postbuild() {
  await Promise.all(
    cornerSquareDyanmicPaths.map((file) =>
      fs.writeFile(path.join(cornerSquareFolder, `${file}.static.ts`), emptyContent)
    )
  );
  await Promise.all(
    cornerDotDyanmicPaths.map((file) => fs.writeFile(path.join(cornerDotFolder, `${file}.static.ts`), emptyContent))
  );
}

(async () => {
  if (arg === "--pre") {
    await prebuild();
  }

  if (arg === "--post") {
    await postbuild();
  }
})();
