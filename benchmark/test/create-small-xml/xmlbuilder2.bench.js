import { create } from '../../../lib/index.js';

export default function () {
  return create({ version: '1.0' }).ele('root', { att: 'val' })
    .ele('foo')
      .ele('bar').txt('foobar').up()
    .up()
    .ele('baz')
    .end({ prettyPrint: true });
}
