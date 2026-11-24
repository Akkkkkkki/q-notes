import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { describe, it, expect, vi } from 'vitest';
import worker from '../worker/index';
import { MockGitHub, makeEnv } from './mock-github';

// Execute the shipped inline scripts with isolated storage and a minimal DOM.
// No real browser profile, credentials, network, or author content is involved.
const read = (path: string) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
const inline = (path: string) => [...read(path).matchAll(/<script is:inline>([\s\S]*?)<\/script>/g)].at(-1)![1];
const shell = inline('src/layouts/CompanionLayout.astro');
const capture = inline('src/pages/capture.astro');
const KEY = 'qn-spark-queue';
const thought = (lines = ['synthetic thought']) => ({ lines, kind: 'link', url: 'https://example.com/source', date: '2026-11-24' });

class Element {
  value = ''; textContent = ''; innerHTML = ''; hidden = true; disabled = false;
  children: Element[] = []; dataset: Record<string, string> = {};
  handlers: Record<string, Function> = {};
  classList = { add() {}, remove() {}, toggle() {} };
  addEventListener(name: string, fn: Function) { this.handlers[name] = fn; }
  setAttribute() {} focus() {} remove() {} click() { this.handlers.click?.(); }
  append(...nodes: Element[]) { this.children.push(...nodes); }
  appendChild(node: Element) { this.append(node); }
  prepend(node: Element) { this.children.unshift(node); }
  replaceChildren(...nodes: Element[]) { this.children = nodes; }
  querySelector() { return this.children[0] ??= new Element(); }
}

function setup(queue: unknown[] = [], response: (init: RequestInit) => Response | Promise<Response> = () => new Response('{}'), token: string | null = 'synthetic-key') {
  const nodes = new Map<string, Element>();
  const node = (id: string) => { if (!nodes.has(id)) nodes.set(id, new Element()); return nodes.get(id)!; };
  const storage = new Map([[KEY, JSON.stringify(queue)]]);
  if (token) storage.set('qn-capture-token', token);
  const events: Record<string, Function> = {};
  const downloads: Blob[] = [];
  const fetch = vi.fn(async (path: string, init: RequestInit) => path === '/api/spark'
    ? response(init)
    : new Response(JSON.stringify({ sparks: [] })));
  const context = vm.createContext({
    console, Response, Blob, URLSearchParams,
    URL: { createObjectURL: (blob: Blob) => { downloads.push(blob); return 'blob:synthetic'; }, revokeObjectURL() {} },
    localStorage: { getItem: (key: string) => storage.get(key) ?? null, setItem: (key: string, val: string) => storage.set(key, val) },
    sessionStorage: { getItem: () => null, setItem() {} },
    document: { readyState: 'loading', getElementById: node, createElement: () => new Element(), addEventListener() {} },
    navigator: { language: 'en' }, location: { search: '', reload() {} }, fetch,
    setTimeout: () => 0, clearTimeout() {}, setInterval: () => 0, clearInterval() {},
    addEventListener: (name: string, fn: Function) => { events[name] = fn; },
  });
  context.window = context;
  vm.runInContext(shell, context);
  vm.runInContext(capture, context);
  return {
    context, node, storage, events, downloads, fetch,
    queue: () => JSON.parse(storage.get(KEY)!),
    posts: () => fetch.mock.calls.filter(([path]) => path === '/api/spark'),
    run: (code: string) => vm.runInContext(code, context),
  };
}
const settle = async () => { for (let i = 0; i < 80; i++) await Promise.resolve(); };
const failure = (status: number, error = `request failed (${status})`, extra = {}) =>
  () => new Response(JSON.stringify({ error, ...extra }), { status });

describe('Capture queue preservation (actual page + shared API scripts)', () => {
  it.each([400, 401, 402, 403, 404, 408, 409, 413, 422, 429, 500, 502, 503, 504, 499])(
    'keeps single and multi-line captures byte-for-byte on HTTP %i', async (status) => {
      for (const entry of [thought(), thought(['first', 'second'])]) {
        const app = setup([entry, thought(['later'])], failure(status));
        await settle();
        expect(app.queue()).toEqual([entry, thought(['later'])]);
        expect(app.posts()).toHaveLength(1);
      }
    },
  );

  it('retains the queue on non-JSON errors and network failures', async () => {
    for (const response of [() => new Response('<html>quota</html>', { status: 402 }), () => new Response('null', { status: 502 }), () => { throw new TypeError('offline'); }]) {
      const app = setup([thought()], response);
      await settle();
      expect(app.queue()).toEqual([thought()]);
    }
  });

  it.each(['GitHub read failed (401)', 'GitHub API error (401)'])(
    'preserves and pauses on upstream auth failure mapped to 502: %s', async (message) => {
      const app = setup([thought()], failure(502, message));
      await settle();
      app.events.online();
      await settle();
      expect(app.queue()).toEqual([thought()]);
      expect(app.posts()).toHaveLength(1);
      expect(app.node('qn-connect').hidden).toBe(true);
    },
  );

  it('does not repeatedly send a rejected device token, including recent/badge requests', async () => {
    const app = setup([thought()], failure(401));
    await settle();
    app.events.online();
    await app.run('flushQueue()');
    await app.run('loadRecent()');
    await app.run("QN.api('/api/flow').catch(() => {})");
    expect(app.fetch).toHaveBeenCalledTimes(1);
    expect(app.queue()).toEqual([thought()]);
    app.storage.set('qn-capture-token', 'changed-synthetic-key');
    await app.run("QN.api('/api/sparks')");
    expect(app.fetch).toHaveBeenCalledTimes(2);
  });

  it('makes no authenticated requests before a device is connected', async () => {
    const app = setup([thought()], undefined, null);
    await settle();
    app.events.online();
    await settle();
    expect(app.fetch).not.toHaveBeenCalled();
    expect(app.queue()).toEqual([thought()]);
  });

  it('splits only explicit too-many-lines validation and keeps order and provenance', async () => {
    for (const [message, extra] of [
      ['too many lines (max 20)', {}],
      ['line count limit exceeded', { code: 'too_many_lines' }],
    ] as const) {
      const entry = thought(Array.from({ length: 41 }, (_, i) => `synthetic ${i}`));
      const app = setup();
      await settle();
      app.fetch.mockImplementation(async (path, init) => {
        if (path !== '/api/spark') return new Response('{"sparks":[]}');
        const body = JSON.parse(String(init.body));
        return body.lines.length > 20
          ? failure(400, message, extra)()
          : new Response('{}');
      });
      app.storage.set(KEY, JSON.stringify([entry]));
      app.fetch.mockClear();
      expect(await app.run('flushQueue()')).toBe(true);
      const sent = app.posts().map(([, init]) => JSON.parse(String(init.body))).filter((s) => s.lines.length <= 20);
      expect(sent.flatMap((s) => s.lines)).toEqual(entry.lines);
      expect(sent[0]).toMatchObject({ date: entry.date, kind: entry.kind, url: entry.url });
      expect(sent.slice(1).every((s) => s.url === '' && s.date === entry.date && s.kind === entry.kind)).toBe(true);
      expect(app.queue()).toEqual([]);
    }
  });

  it.each([['text exceeds 2000 characters', 400], ['too many lines somewhere else', 400], ['too many lines (max 20)', 429]] as const)(
    'does not split other validation or lookalike errors: %s', async (message, status) => {
      const entry = thought(['first', 'second']);
      const app = setup([entry], failure(status, message));
      await settle();
      expect(app.queue()).toEqual([entry]);
      expect(app.posts()).toHaveLength(1);
    },
  );

  it.each([401, 402, 403, 409, 429, 502])('persists a new capture before sending on HTTP %i', async (status) => {
    const app = setup([], failure(status));
    await settle();
    app.node('spark').value = 'new synthetic thought';
    await app.run('send()');
    expect(app.queue()[0].lines).toEqual(['new synthetic thought']);
    expect(app.node('spark').value).toBe('');
  });

  it('exports all rejected content with dates, kind, and source, without deleting it', async () => {
    const entries = [thought(['x'.repeat(2001)]), thought(['<script>synthetic</script>'])];
    const app = setup(entries, failure(400, 'text exceeds 2000 characters'));
    await settle();
    app.node('export-queue').click();
    expect(app.downloads).toHaveLength(1);
    expect(JSON.parse(await app.downloads[0].text())).toEqual(entries);
    expect(app.queue()).toEqual(entries);
    expect(app.node('queue-recovery').hidden).toBe(false);
  });

  it('serializes overlapping flushes and retains captures added during an in-flight send', async () => {
    let release!: (response: Response) => void;
    const app = setup([thought()], () => new Promise<Response>((resolve) => { release = resolve; }));
    const overlapping = app.run('flushQueue()');
    app.node('spark').value = 'added during sync';
    const saving = app.run('send()');
    await settle();
    expect(app.posts()).toHaveLength(1);
    expect(app.queue()).toHaveLength(2);
    app.fetch.mockImplementation(async () => new Response('{}'));
    release(new Response('{}'));
    await Promise.all([overlapping, saving]);
    expect(app.posts()).toHaveLength(2);
    expect(app.queue()).toEqual([]);
  });

  it('keeps the composer intact if local storage cannot save the new thought', async () => {
    const app = setup();
    await settle();
    app.context.localStorage.setItem = () => { throw new Error('storage full'); };
    app.node('spark').value = 'still in composer';
    await app.run('send()');
    expect(app.node('spark').value).toBe('still in composer');
    expect(app.posts()).toHaveLength(0);
  });

  it('supports explicit retry after a server failure and clears only acknowledged entries', async () => {
    const app = setup([thought()], failure(402));
    await settle();
    app.fetch.mockImplementation(async () => new Response('{}'));
    app.node('retry-queue').click();
    await settle();
    expect(app.queue()).toEqual([]);
    expect(app.posts()).toHaveLength(2);
  });

  it.each(['{incomplete JSON', 'null', '{}'])('never overwrites unreadable stored content: %s', async (raw) => {
    const app = setup();
    await settle();
    app.storage.set(KEY, raw);
    app.node('spark').value = 'keep this too';
    await app.run('send()');
    expect(app.storage.get(KEY)).toBe(raw);
    expect(app.node('spark').value).toBe('keep this too');
    app.node('export-queue').click();
    expect(await app.downloads[0].text()).toBe(raw);
    expect(app.posts()).toHaveLength(0);
  });

  it('replays a pending capture through the actual Worker into simulated GitHub, preserving every line', async () => {
    const gh = new MockGitHub();
    gh.seedFile('research/inbox.md', '# Synthetic inbox\n');
    vi.stubGlobal('fetch', gh.fetch);
    const entry = thought(Array.from({ length: 41 }, (_, i) => `synthetic line ${i}`));
    const app = setup([entry], (init) => worker.fetch(new Request('https://app.test/api/spark', {
      ...init, headers: { Authorization: 'Bearer test-capture-token', 'Content-Type': 'application/json' },
    }), makeEnv()));
    expect(await app.run('flushQueue()')).toBe(true);
    expect(app.queue()).toEqual([]);
    const inbox = gh.files.get('research/inbox.md')!;
    const saved = inbox.trim().split('\n').slice(1);
    expect(saved).toHaveLength(41);
    entry.lines.forEach((line, i) => expect(saved[i]).toBe(`${entry.date} — ${line}${i === 0 ? ' ← ' + entry.url : ''}`));
    expect(gh.commits).toHaveLength(3);
  });

  it('syncs a retained item after upstream credentials recover, without reconnecting the device', async () => {
    const gh = new MockGitHub();
    gh.seedFile('research/inbox.md', '# Synthetic inbox\n');
    let upstreamRecovered = false;
    vi.stubGlobal('fetch', (input: RequestInfo | URL, init?: RequestInit) => upstreamRecovered
      ? gh.fetch(input, init) : Promise.resolve(new Response('{}', { status: 401 })));
    const app = setup([thought()], (init) => worker.fetch(new Request('https://app.test/api/spark', {
      ...init, headers: { Authorization: 'Bearer test-capture-token', 'Content-Type': 'application/json' },
    }), makeEnv()));
    expect(await app.run('flushQueue()')).toBe(false);
    expect(app.queue()).toEqual([thought()]);
    upstreamRecovered = true;
    app.node('retry-queue').click();
    expect(await app.run('flushQueue()')).toBe(true);
    expect(app.queue()).toEqual([]);
    expect(gh.commits).toHaveLength(1);
    expect(app.posts()).toHaveLength(2);
    expect(app.node('qn-connect').hidden).toBe(true);
  });
});
