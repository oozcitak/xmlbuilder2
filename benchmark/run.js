import { configureBenchMarks } from './test/bench-util.js';
import { run } from 'mitata';

await configureBenchMarks();
await run();
