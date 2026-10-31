// Run unchanged Instory components against fictional, loopback-only fixtures.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createServer as createHttpServer } from 'node:http';
import { cp, mkdir, symlink, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const site = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const source = resolve(site, '../../Instory/frontend');
const runtime = resolve(site, '../tmp/project-demos/instory');
const assets = join(site, 'public/projects/demo-assets');
const { users, posts: postSpecs, hashtags, stories, highlights, messages, chats } = JSON.parse(readFileSync(join(assets, 'instory-data.json'), 'utf8'));
const sampleTime = '2026-10-31T08:00:00Z';
const paginated = (data, url) => ({
  data: Number(url.searchParams.get('pageNumber') ?? 1) > 1 ? [] : data,
  page: 1, pageNumber: 1, pageSize: 20, totalCount: data.length, totalPages: 1,
  hasNextPage: false, hasPreviousPage: false,
});

function fixture(url, method = 'GET') {
  if (method !== 'GET') return undefined;
  const path = url.pathname.replace(/^\/api/, '');
  const query = (url.searchParams.get('query') ?? url.searchParams.get('search') ?? '').replace(/^#/, '').toLocaleLowerCase();
  if (path === '/v1/auth/me') return users[0];
  if (path === '/v1/notifications/unread-count') return 3;
  if (path === '/v1/notifications') return paginated([], url);
  if (path === '/v1/posts/feed') return paginated(postSpecs, url);
  if (path === '/v1/posts/search') return paginated(postSpecs.filter((p) => p.hashtags.includes(url.searchParams.get('hashtag'))), url);
  if (/^\/v1\/users\/\d+\/(posts|shared-posts|liked-posts)$/.test(path)) {
    const userId = Number(path.split('/')[3]);
    return paginated(postSpecs.filter((p) => path.endsWith('/posts') ? p.userId === userId : path.endsWith('/liked-posts') ? p.isLiked : p.userId !== userId), url);
  }
  if (path.startsWith('/v1/profile/')) {
    const user = users.find((u) => u.userName === decodeURIComponent(path.split('/').at(-1)));
    return user ? { ...user, postsCount: postSpecs.filter((p) => p.userId === user.id).length,
      friendsCount: 128, friendshipStatus: user.id === 1 ? null : 'accepted', friendshipRequestId: null, isRequester: null } : null;
  }
  if (path === '/v1/story') return stories;
  if (path.startsWith('/v1/story/user/')) return stories.find((g) => g.user.id === Number(path.split('/').at(-1))) ?? null;
  if (path === '/v1/highlights') return highlights;
  if (path === '/v1/hashtags/trending') return hashtags;
  if (path === '/v1/hashtags/search' || path === '/v1/search/hashtags') return hashtags.filter((h) => h.tag.includes(query));
  if (path === '/v1/search/users') return users.filter((u) => `${u.userName} ${u.fullName}`.toLocaleLowerCase().includes(query));
  if (path === '/v1/search/posts') return postSpecs.filter((p) => p.content.toLocaleLowerCase().includes(query));
  if (path === '/v1/chat') return chats;
  if (/^\/v1\/chat\/\d+\/messages$/.test(path)) return Number(path.split('/')[3]) === 1 ? messages : messages.map((m) => ({ ...m, chatId: Number(path.split('/')[3]) }));
  if (path.startsWith('/v1/chat/direct/')) return { id: 1, type: 'Direct' };
  if (path === '/v1/friendship/friends' || path === '/v1/users/suggested') return users.slice(1);
  if (/^\/v1\/users\/\d+\/friends$/.test(path)) return paginated(users.slice(1), url);
  if (path === '/v1/admin/users') return paginated(users.filter((u) => `${u.userName} ${u.email}`.includes(query)), url);
  if (path === '/v1/admin/posts') return paginated(postSpecs.map((p) => ({ ...p, isDeleted: false, deletedAt: null, likeCount: p.likesCount, commentCount: p.commentsCount, reportCount: 0 })), url);
  if (path === '/v1/admin/reports') return paginated([
    { id: 601, reason: 'Nội dung không phù hợp', reasonDetail: 'Vui lòng kiểm tra nội dung được cộng đồng phản ánh.', status: 'Pending', createdAt: sampleTime, reporter: users[2], post: postSpecs[2] },
    { id: 602, reason: 'Thông tin gây hiểu nhầm', reasonDetail: 'Bài viết cần được đối chiếu trước khi chia sẻ rộng rãi.', status: 'Pending', createdAt: sampleTime, reporter: users[3], post: postSpecs[1] },
  ], url);
  if (path === '/v1/admin/report-reasons' || path === '/v1/reports/reasons') return [
    { id: 1, code: 'SPAM', name: 'Nội dung rác', description: 'Nội dung lặp lại hoặc quảng cáo không phù hợp', severity: 2, isActive: true, createdAt: sampleTime, usageCount: 5 },
    { id: 2, code: 'MISLEADING', name: 'Thông tin gây hiểu nhầm', description: 'Thông tin cần kiểm chứng', severity: 3, isActive: true, createdAt: sampleTime, usageCount: 2 },
  ];
  if (/^\/v1\/posts\/\d+\/comments$/.test(path)) return paginated([
    { id: 1, content: 'Bảng màu đẹp quá! 🌿', user: users[1], createdAt: sampleTime, updatedAt: null },
    { id: 2, content: 'Nét vẽ gọn và dễ thương quá.', user: users[3], createdAt: sampleTime, updatedAt: null },
  ], url);
  return undefined;
}

function selfCheck() {
  assert.equal(new Set(users.map((u) => u.id)).size, users.length);
  assert.ok(users.every((u) => u.email.endsWith('@example.test')));
  assert.ok(postSpecs.every((p) => p.user.id === p.userId && p.images.length));
  for (const path of ['/v1/auth/me', '/v1/profile/linh.nguyen', '/v1/posts/feed', '/v1/users/1/posts', '/v1/story', '/v1/highlights', '/v1/hashtags/trending', '/v1/posts/search?hashtag=dulich', '/v1/chat', '/v1/chat/1/messages', '/v1/admin/users']) {
    assert.notEqual(fixture(new URL(path, 'http://127.0.0.1')), undefined, path);
  }
  assert.equal(fixture(new URL('http://127.0.0.1/v1/users/1/posts')).data.length, 6);
  assert.ok(fixture(new URL('http://127.0.0.1/v1/posts/search?hashtag=dulich')).data.length > 0);
  assert.equal(fixture(new URL('http://127.0.0.1/v1/posts/feed?pageNumber=2')).data.length, 0);
  assert.equal(fixture(new URL('http://127.0.0.1/v1/auth/me'), 'POST'), undefined);
  assert.ok(messages.every((message, index) => index === 0 || Date.parse(messages[index - 1].createdAt) < Date.parse(message.createdAt)));
  assert.deepEqual(chats[0].lastMessage, messages.at(-1));
  console.log('Instory fictional fixture routes and relationships verified.');
}

async function prepare() {
  await mkdir(runtime, { recursive: true });
  await mkdir(assets, { recursive: true });
  await cp(join(source, 'src'), join(runtime, 'src'), { recursive: true });
  await cp(join(source, 'public'), join(runtime, 'public'), { recursive: true });
  await writeFile(join(runtime, 'package.json'), '{"type":"module"}');
  await symlink(join(source, 'node_modules'), join(runtime, 'node_modules')).catch((error) => { if (error.code !== 'EEXIST') throw error; });
  await writeFile(join(runtime, 'index.html'), '<!doctype html><html lang="vi"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Instory — dữ liệu minh họa</title></head><body><div id="root"></div><script type="module" src="/demo-main.tsx"></script></body></html>');
  await writeFile(join(runtime, 'demo-main.tsx'), `import React from 'react';import {createRoot} from 'react-dom/client';import {Provider} from 'react-redux';import {store} from './src/store';import App from './src/App';import './src/index.css';createRoot(document.getElementById('root')!).render(<Provider store={store}><App/></Provider>);`);
  // No live connections or credentials are needed to render the actual pages.
  await writeFile(join(runtime, 'demo-signalr.ts'), 'export const LogLevel={Warning:3};export class HubConnectionBuilder{withUrl(){return this}withAutomaticReconnect(){return this}configureLogging(){return this}build(){return {on(){},start:async()=>{},stop:async()=>{}}}}');
  const colors = ['#F4B6AB', '#9ACAB5', '#B8C9E8', '#D6BCE8', '#E3C797', '#A5C7CC'];
  for (const [i, name] of ['linh', 'minh', 'huy', 'thao', 'khanh', 'bao'].entries()) {
    await writeFile(join(assets, `instory-${name}.svg`), `<svg xmlns="http://www.w3.org/2000/svg" width="240" height="240" viewBox="0 0 240 240"><rect width="240" height="240" fill="${colors[i]}"/><circle cx="120" cy="94" r="43" fill="#FFE2CA"/><path d="M73 94Q62 25 119 29Q179 25 168 96L153 64Q111 89 82 67Z" fill="#3F3432"/><path d="M40 240Q38 149 120 147Q204 148 201 240" fill="${['#3D6673', '#F7F2E8', '#335546', '#B25652', '#475B82', '#916649'][i]}"/><path d="M102 135Q120 146 138 135" fill="none" stroke="#BF806F" stroke-width="3"/><circle cx="104" cy="98" r="3" fill="#493D37"/><circle cx="137" cy="98" r="3" fill="#493D37"/></svg>`);
  }
  const scenes = {
    city: '<rect width="900" height="650" fill="#E4B2A3"/><circle cx="720" cy="140" r="76" fill="#FFDAA9"/><path d="M0 445H900V650H0Z" fill="#93B6B1"/><path d="M0 470Q280 395 480 475T900 460V650H0Z" fill="#487D7B"/><g fill="#35676C"><path d="M70 440V240H155V440M170 440V306H244V440M284 440V184H359V440M410 440V267H500V440M535 440V135H579V440M630 440V226H714V440M752 440V287H835V440"/></g><path d="M542 136L557 55L571 136Z" fill="#35676C"/><g stroke="#D8CCC0" stroke-width="6"><path d="M92 274V405M115 274V405M308 215V405M335 215V405M437 297V410M466 297V410M654 255V408M682 255V408"/></g><path d="M0 568Q370 489 900 577" fill="none" stroke="#B7D0C7" stroke-width="8"/>',
    mountains: '<rect width="900" height="650" fill="#CDDCD7"/><circle cx="727" cy="135" r="64" fill="#F9E3B8"/><path d="M0 408L210 133L414 385L595 170L900 422V650H0Z" fill="#8EA9A4"/><path d="M0 520L340 244L564 484L738 311L900 479V650H0Z" fill="#527D71"/><path d="M0 650L230 487L449 562L659 450L900 585V650Z" fill="#2E594A"/><path d="M383 650L460 559L476 530L507 513" fill="none" stroke="#D5B787" stroke-width="25"/><g fill="#244C40"><path d="M101 453L59 550H85L48 616H155L120 550H143Z"/><path d="M746 375L701 483H728L694 546H801L767 483H791Z"/></g>',
    workspace: '<rect width="900" height="650" fill="#E8D8BE"/><rect x="55" y="48" width="370" height="313" rx="6" fill="#B9D0CE"/><path d="M55 275Q160 144 270 238T425 205V361H55Z" fill="#799E8F"/><path d="M239 48V361M55 205H425" stroke="#F9F2DF" stroke-width="13"/><path d="M0 435H900V650H0Z" fill="#B68059"/><rect x="299" y="262" width="366" height="229" rx="12" fill="#35494E"/><rect x="315" y="278" width="334" height="187" rx="4" fill="#E7EDE6"/><path d="M327 315H458M327 340H557M327 365H492M347 390H598M347 415H512" stroke="#709893" stroke-width="9"/><path d="M299 491L253 526H709L665 491Z" fill="#677E7F"/><ellipse cx="155" cy="521" rx="51" ry="17" fill="#8B5A3F"/><path d="M113 459H187V512Q151 539 113 512Z" fill="#EEE4D0"/><path d="M187 468Q224 469 212 490Q205 501 186 495" fill="none" stroke="#EEE4D0" stroke-width="9"/><path d="M752 438V231" stroke="#546E43" stroke-width="9"/><path d="M750 345Q640 285 703 244Q772 251 750 345M756 287Q821 173 855 225Q846 288 756 287" fill="#648056"/><path d="M709 414H806L789 486H727Z" fill="#C26443"/>',
    plants: '<rect width="900" height="650" fill="#E8E4D5"/><rect x="60" y="65" width="330" height="415" fill="#D0DECD"/><path d="M225 65V480M60 273H390" stroke="#FAF7E9" stroke-width="12"/><rect x="0" y="519" width="900" height="131" fill="#BE9973"/><path d="M527 487V187M527 311Q375 267 443 189Q537 205 527 311M530 392Q684 299 699 366Q681 448 530 392M532 249Q649 113 683 189Q667 254 532 249" fill="#70946D" stroke="#4B744D" stroke-width="7"/><path d="M450 461H615L591 605H476Z" fill="#C9805E"/><path d="M181 525V355M180 409Q87 344 118 315Q196 324 180 409M185 455Q289 350 310 405Q287 459 185 455" fill="#749872" stroke="#4B744D" stroke-width="5"/><path d="M129 499H245L228 587H146Z" fill="#EAE4CE"/>',
    coast: '<rect width="900" height="650" fill="#C4DCE0"/><circle cx="734" cy="116" r="62" fill="#FFE6B3"/><path d="M0 302H900V650H0Z" fill="#79B9B7"/><path d="M0 409Q213 340 463 432T900 408V650H0Z" fill="#429895"/><path d="M0 477Q295 409 505 506T900 490V650H0Z" fill="#FAF0D9"/><path d="M0 522Q307 451 513 546T900 534V650H0Z" fill="#E4C99B"/><path d="M0 467Q213 408 463 488T900 470" fill="none" stroke="#FAFBEB" stroke-width="11"/><path d="M104 517L94 259" stroke="#695C43" stroke-width="14"/><path d="M96 266Q-36 170 6 156Q77 146 96 266M99 263Q155 114 198 167Q183 233 99 263M95 265Q219 246 223 290Q170 316 95 265" fill="#4B7B62"/>',
    coffee: '<rect width="900" height="650" fill="#D8C6AD"/><path d="M0 0H900V650H0Z" fill="#B7936D"/><path d="M0 213H900M0 432H900" stroke="#A4805C" stroke-width="4"/><ellipse cx="309" cy="341" rx="187" ry="170" fill="#EDE4CF"/><circle cx="309" cy="330" r="125" fill="#F8F1E0"/><circle cx="309" cy="330" r="99" fill="#795239"/><path d="M295 302Q240 247 264 331Q290 385 321 335Q365 273 323 291Q306 306 309 341" fill="#DBB88E"/><path d="M417 306Q493 283 479 346Q463 384 426 361" fill="none" stroke="#F8F1E0" stroke-width="18"/><path d="M586 159L774 208L706 517L521 471Z" fill="#49685D"/><path d="M603 188L753 228L696 489L548 452Z" fill="#F6EEDC"/><path d="M603 254L720 286M592 286L708 318M582 318L696 349M572 350L686 381M562 383L675 414" stroke="#AAAD99" stroke-width="4"/><path d="M808 75Q684 98 736 173Q791 181 808 75" fill="#6E8E64"/>',
  };
  for (const [name, scene] of Object.entries(scenes)) {
    await writeFile(join(assets, `instory-${name}.svg`), `<svg xmlns="http://www.w3.org/2000/svg" width="900" height="900" viewBox="0 0 900 650" preserveAspectRatio="xMidYMid slice">${scene}</svg>`);
  }
  await symlink(assets, join(runtime, 'public/demo-assets')).catch((error) => { if (error.code !== 'EEXIST') throw error; });
}

selfCheck();
if (process.argv.includes('--check')) process.exit(0);
await prepare();
const api = createHttpServer((request, response) => {
  const url = new URL(request.url, 'http://127.0.0.1:5186');
  const data = fixture(url, request.method);
  response.writeHead(request.method !== 'GET' ? 405 : data === undefined ? 404 : 200, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', Allow: 'GET' });
  response.end(JSON.stringify(data === undefined ? { error: 'Unknown demo endpoint', path: url.pathname } : data));
});
await new Promise((accept, reject) => { api.once('error', reject); api.listen(5186, '127.0.0.1', accept); });
const { createServer } = await import(pathToFileURL(join(source, 'node_modules/vite/dist/node/index.js')));
const { default: react } = await import(pathToFileURL(join(source, 'node_modules/@vitejs/plugin-react/dist/index.js')));
const { default: tailwindcss } = await import(pathToFileURL(join(source, 'node_modules/@tailwindcss/vite/dist/index.mjs')));
const vite = await createServer({
  configFile: false, envFile: false, root: runtime, cacheDir: join(runtime, '.vite'),
  plugins: [react(), tailwindcss()],
  resolve: { alias: { '@': join(runtime, 'src'), '@microsoft/signalr': join(runtime, 'demo-signalr.ts') } },
  define: { 'import.meta.env.VITE_API_URL': JSON.stringify('/api'), 'import.meta.env.VITE_SIGNALR_URL': JSON.stringify('/hubs') },
  server: { host: '127.0.0.1', port: 5185, strictPort: true, fs: { allow: [runtime, source, assets] }, proxy: { '/api': 'http://127.0.0.1:5186' } },
});
await vite.listen();
console.log('Instory real UI with fictional seed: http://127.0.0.1:5185/');
console.log('Capture routes: / | /chat (select Minh Anh) | /admin | /profile/linh.nguyen | /hashtagtrending?tag=dulich');
console.log('Demo only: API fixture data and disconnected live hubs; original Instory repository is unchanged.');
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, async () => { await vite.close(); api.close(); process.exit(0); });
