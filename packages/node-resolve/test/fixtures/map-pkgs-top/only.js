import foo from '@scoped/foo';
import bar from '@scoped/bar';
import test from 'test';

import local from './only-local';

export default "only"
console.log(foo);
console.log(bar);
console.log(test);
console.log(local);
