const { join } = require('path');

const test = require('ava');
const { rollup } = require('rollup');

const { nodeResolve } = require('..');

process.chdir(join(__dirname, 'fixtures', 'custom-module-dir'));

test('mapPkgs - no package json fail, wont contiunue search', async (t) => {
  try {
    await rollup({
      input: 'dedupe.js',
      plugins: [
        nodeResolve({
          mapPkgs: {
            mappings: {
              'package-a': './js-modules/package-a',
              'package-b': './js-modules/package-b'
            }
          },
          dedupe: ['package-b'],
          moduleDirectories: ['js_modules']
        })
      ]
    });
  } catch (e) {
    t.is(e.pluginCode, 'MAP_PKGS_ENOENT');
    return;
  }
  t.fail('expecting error');
});
