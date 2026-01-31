import { create } from 'xmlbuilder';

export default function () {
  return create('root', { version: '1.0' }).att('att', 'val')
    .ele('foo')
      .ele('bar').txt('foobar').up()
    .up()
    .ele('baz')
    .end({ pretty: true });
}
