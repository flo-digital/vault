// Ad-hoc code sign the app after electron-builder packages it.
// This prevents "app is damaged" on other Macs — they'll see
// "unidentified developer" instead, which is bypassable with right-click → Open.
const { execSync } = require('child_process');
const path = require('path');

exports.default = async function(context) {
  if (process.platform !== 'darwin') return;
  const appPath = path.join(
    context.appOutDir,
    `${context.packager.appInfo.productFilename}.app`
  );
  console.log(`\n→ Ad-hoc signing: ${appPath}`);
  execSync(`codesign --deep --force --sign - "${appPath}"`, { stdio: 'inherit' });
  console.log('→ Ad-hoc signing complete\n');
};
