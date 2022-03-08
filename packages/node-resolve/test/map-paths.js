const { join, resolve } = require('path');

const test = require('ava');
const { rollup } = require('rollup');

const { getImports, getResolvedModules, testBundle } = require('../../../util/test');
const { nodeResolve } = require('..');

process.chdir(join(__dirname, 'fixtures'));

test('map "test"', async (t) => {
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

  t.is(warnings.length, 0);
  t.snapshot(warnings);
  t.deepEqual(imports, ['@scoped/foo', '@scoped/bar']);
  t.assert(Object.keys(modules).includes(resolve('only-local.js')));
});

test('handles nested entry modules', async (t) => {
  const warnings = [];
  const bundle = await rollup({
    input: ['nested/only.js'],
    onwarn: (warning) => warnings.push(warning),
    plugins: [
      nodeResolve({
        // resolveOnly: ['test'],
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

  t.is(warnings.length, 0);
  t.snapshot(warnings);
  t.deepEqual(imports, ['@scoped/foo', '@scoped/bar']);
  t.assert(Object.keys(modules).includes(resolve('only-local.js')));
});

test('scoped', async (t) => {
  const warnings = [];
  try {
    // const bundle =
    await rollup({
      input: 'only.js',
      onwarn: (warning) => warnings.push(warning),
      plugins: [
        nodeResolve({
          mapPkgs: {
            mappings: {
              '@scoped/bar': './node_modules/bar',
              '@scoped/foo': './node_modules/foo'
            }
          }
        })
      ]
    });
  } catch (e) {
    t.is(e.code, 'UNOENT');
    return;
  }
  t.fail('expecting error');
  // const imports = await getImports(bundle);
  // const modules = await getResolvedModules(bundle);

  // t.is(warnings.length, 0);
  // t.snapshot(warnings);
  // t.deepEqual(imports, ['test']);
  // t.assert(Object.keys(modules).includes(resolve('only-local.js')));
});

test('map paths- a literal match takes presedence', async (t) => {
  const bundle = await rollup({
    input: 'exports-literal-specificity.js',
    onwarn: () => {
      t.fail('No warnings were expected');
    },
    plugins: [
      nodeResolve({
        mapPkgs: {
          mappings: {
            'exports-literal-specificity': './node_modules/exports-literal-specificity'
          }
        }
      })
    ]
  });
  const { module } = await testBundle(t, bundle);

  t.deepEqual(module.exports, { a: 'foo a' });
});
