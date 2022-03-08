const { join, resolve } = require('path');

const fs = require('fs');

const test = require('ava');
const { rollup } = require('rollup');

const { getImports, getResolvedModules } = require('../../../util/test');
const { nodeResolve } = require('..');

process.chdir(join(__dirname, 'fixtures', 'map-pkgs-top'));

if (!fs.existsSync('only.js')) throw new Error('oops');

test('mapPkgs "test" (self)', async (t) => {
  const warnings = [];
  const bundle = await rollup({
    input: ['only.js'],
    onwarn: (warning) => warnings.push(warning),
    plugins: [
      nodeResolve({
        mapPkgs: {
          mappings: {
            test: '.'
          }
        }
      })
    ]
  });
  const imports = await getImports(bundle);
  const modules = await getResolvedModules(bundle);

  t.is(warnings.length, 1);
  t.is(warnings[0].code, 'CIRCULAR_DEPENDENCY');
  t.deepEqual(warnings[0].cycle, ['only.js', 'only.js']);
  t.deepEqual(imports, ['@scoped/foo', '@scoped/bar']);
  t.assert(Object.keys(modules).includes(resolve('only-local.js')));
});

test('mapPkgs "test" to ./map-pkgs/no-such-dir', async (t) => {
  const warnings = [];
  try {
    // const bundle =
    await rollup({
      input: ['only.js'],
      onwarn: (warning) => warnings.push(warning),
      plugins: [
        nodeResolve({
          mapPkgs: {
            mappings: {
              test: './map-pkgs/no-such-dir'
            }
          }
        })
      ]
    });
  } catch (e) {
    t.is(warnings.length, 0);
    t.is(e.code, 'PLUGIN_ERROR');
    t.is(e.pluginCode, 'MAP_PKGS_ENOENT');
    return;
  }
  t.fail('expecting error');
});

test('mapPkgs "test" (./map-pkgs/1-no-package-json)', async (t) => {
  const warnings = [];
  try {
    // const bundle =
    await rollup({
      input: ['only.js'],
      onwarn: (warning) => warnings.push(warning),
      plugins: [
        nodeResolve({
          mapPkgs: {
            mappings: {
              test: './map-pkgs/1-no-package-json'
            }
          }
        })
      ]
    });
  } catch (e) {
    t.is(warnings.length, 0);
    t.is(e.code, 'PLUGIN_ERROR');
    t.is(e.pluginCode, 'MAP_PKGS_ENOENT');
    return;
  }
  t.fail('expecting error');
});

test('mapPkgs "test" (./map-pkgs/2-different-name)', async (t) => {
  const warnings = [];
  try {
    // const bundle =
    await rollup({
      input: ['only.js'],
      onwarn: (warning) => warnings.push(warning),
      plugins: [
        nodeResolve({
          mapPkgs: {
            mappings: {
              test: './map-pkgs/2-different-name'
            }
          }
        })
      ]
    });
  } catch (e) {
    t.is(warnings.length, 0);
    t.is(e.code, 'PLUGIN_ERROR');
    t.is(e.pluginCode, 'MAP_PKGS_WRONG_PACKAGE_NAME');
    return;
  }
  t.fail('expecting error');
});

test('mapPkgs "test" (./map-pkgs/3-no-export-prop)', async (t) => {
  const warnings = [];
  try {
    // const bundle =
    await rollup({
      input: ['only.js'],
      onwarn: (warning) => warnings.push(warning),
      plugins: [
        nodeResolve({
          mapPkgs: {
            mappings: {
              test: './map-pkgs/3-no-export-prop'
            }
          }
        })
      ]
    });
  } catch (e) {
    t.is(warnings.length, 0);
    t.is(e.code, 'PLUGIN_ERROR');
    t.is(e.pluginCode, 'MAP_PKGS_NO_EXPORT_PROP');
    return;
  }
  t.fail('expecting error');
});

test('mapPkgs "test" (./map-pkgs/4-has-empty-exports)', async (t) => {
  const warnings = [];
  let bundle;
  try {
    bundle = await rollup({
      input: ['only.js'],
      onwarn: (warning) => warnings.push(warning),
      plugins: [
        nodeResolve({
          mapPkgs: {
            mappings: {
              test: './map-pkgs/4-has-empty-exports'
            }
          }
        })
      ]
    });
  } catch (e) {
    t.is(warnings.length, 0);
    t.is(e.code, 'PLUGIN_ERROR');
    t.is(e.pluginCode, 'XXXXX');
    return;
  }
  t.is(warnings.length > 0, true);
  t.is(
    warnings.some(
      (w) => w.code === 'UNRESOLVED_IMPORT' && w.source === 'test' && w.importer === 'only.js'
    ),
    true
  );
  const imports = await getImports(bundle);
  t.is(imports.includes('test'), true);
  const modules = await getResolvedModules(bundle);
  t.is(
    !Object.keys(modules).some((m) => !m.endsWith('/only.js') && !m.endsWith('/only-local.js')),
    true
  );
});
