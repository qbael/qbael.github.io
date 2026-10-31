// Runs the original Medify components in a disposable checkout with fictional data.
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, symlinkSync, writeFileSync } from 'node:fs';
import { createServer } from 'node:http';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const site = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const source = resolve(site, '../../HealthPro/frontend');
const runtime = resolve(site, '../tmp/project-demos/medify');
const fixturePath = join(site, 'public/projects/demo-assets/medify-data.json');
const fixture = JSON.parse(readFileSync(fixturePath, 'utf8'));
const apiOrigin = 'http://127.0.0.1:5184';
const webOrigin = 'http://127.0.0.1:5183';
const appointments = fixture.appointments.map((appointment) => ({
  ...appointment,
  clinicId: fixture.clinic.id,
  clinicName: fixture.clinic.clinicName,
}));
const slots = (date) => ['08:00', '09:30', '14:00', '16:00'].map((time, index) => ({
  id: `demo-slot-${index + 1}`,
  appointmentDate: date,
  startTime: `${time}:00`,
  endTime: `${time.endsWith('00') ? `${time.slice(0, 2)}:30` : `${String(Number(time.slice(0, 2)) + 1).padStart(2, '0')}:00`}:00`,
}));

function responseFor(url) {
  const path = url.pathname.replace(/^\/api/, '');
  if (path === '/v3/appointments/clinic' || path === '/v3/appointments/doctor') return appointments;
  if (path === '/v3/doctor-schedule-template') return fixture.templates;
  if (path.includes('/available-dates/')) return { data: Object.keys(fixture.availability) };
  if (path.includes('/fast-available-dates/')) return { data: fixture.availability };
  if (path.includes('/available-slots/')) return { data: slots(url.searchParams.get('date') || '2026-11-02') };
  if (path === '/v1/profile/is-fully-registered') return { isFullyRegistered: true };
  if (path === '/v2/doctors') return { data: { content: fixture.doctors, totalPages: 1, pageable: { pageNumber: 0 } } };
  if (path.startsWith('/v2/doctors/')) return { data: fixture.doctors.find((doctor) => doctor.id === path.split('/').at(-1)) || fixture.doctors[0] };
  if (path === '/v2/clinics') return { data: { content: [fixture.clinic], totalPages: 1, pageable: { pageNumber: 0 } } };
  // shortcut: search shows the sample set; add filtering if this becomes an interactive demo.
  if (path === '/v2/search') return { success: true, data: { doctors: fixture.doctors, clinics: [fixture.clinic] } };
  return undefined;
}

function makeApi() {
  return createServer((request, response) => {
    response.setHeader('Access-Control-Allow-Origin', webOrigin);
    response.setHeader('Access-Control-Allow-Credentials', 'true');
    response.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    response.setHeader('Content-Type', 'application/json; charset=utf-8');
    if (request.method === 'OPTIONS') return response.writeHead(204).end();
    if (request.method !== 'GET') return response.writeHead(405).end(JSON.stringify({ message: 'This screenshot demo is read-only.' }));
    const result = responseFor(new URL(request.url, apiOrigin));
    response.writeHead(result === undefined ? 404 : 200);
    response.end(JSON.stringify(result ?? { message: 'Demo route not found.' }));
  });
}

function checkFixtures() {
  assert.equal(new Set(appointments.map(({ id }) => id)).size, 6);
  assert.equal(appointments.filter(({ status }) => status === 'SCHEDULED').length, 3);
  assert(fixture.doctors.length >= 4);
  for (const template of fixture.templates) {
    assert(template.fromTime < template.toTime);
    assert(template.slotDuration > 0);
  }
  assert.equal(responseFor(new URL(`${apiOrigin}/api/v3/appointments/clinic`)).length, 6);
  assert.equal(responseFor(new URL(`${apiOrigin}/api/v3/schedule/doctor/available-slots/doctor-1?date=2026-11-02`)).data.length, 4);
  for (const [date, count] of Object.entries(fixture.availability)) assert.equal(count, slots(date).length);
  assert.equal(responseFor(new URL(`${apiOrigin}/api/v2/search`)).data.doctors.length, fixture.doctors.length);
  assert.equal(responseFor(new URL(`${apiOrigin}/api/unknown`)), undefined);
}

checkFixtures();
if (process.argv.includes('--check')) {
  console.log('Medify fixtures and API response checks passed.');
} else {
  assert(existsSync(join(source, 'node_modules/next/dist/bin/next')), 'HealthPro frontend dependencies are required; this script never installs packages.');
  mkdirSync(runtime, { recursive: true });
  for (const name of ['src', 'public', 'package.json', 'tsconfig.json', 'postcss.config.mjs', 'next.config.ts']) {
    cpSync(join(source, name), join(runtime, name), { recursive: true });
  }
  if (!existsSync(join(runtime, 'node_modules'))) symlinkSync(join(source, 'node_modules'), join(runtime, 'node_modules'), 'dir');
  writeFileSync(join(runtime, 'src/demo-fixtures.json'), JSON.stringify(fixture));
  writeFileSync(join(runtime, 'src/lib/demoData.ts'), `import fixture from '@/demo-fixtures.json';\nexport const demoDoctors = fixture.doctors;\nexport const demoClinics = [fixture.clinic];\nexport const demoAvailability = fixture.availability;\n`);
  const copiedSource = join(runtime, 'src');
  for (const name of readdirSync(copiedSource, { recursive: true })) {
    if (!/\.[jt]sx?$/.test(name)) continue;
    const file = join(copiedSource, name);
    const original = readFileSync(file, 'utf8');
    const localized = original.replaceAll('http://localhost:4004/api', `${apiOrigin}/api`);
    if (localized !== original) writeFileSync(file, localized);
    assert(!localized.includes('localhost:4004/api'), `Unlocalized demo API in ${name}`);
  }
  // Keep the original UI; only demo authentication and local API origins change.
  writeFileSync(join(runtime, 'src/contexts/AuthContext.tsx'), `'use client';
import { createContext, useContext } from 'react';
import type { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
export const AuthContext = createContext<any>(null);
export function AuthContextProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const role = pathname.startsWith('/clinic/') ? 'CLINIC' : pathname === '/doctor/schedules' ? 'DOCTOR' : null;
  const user = role ? { id: 'demo-user', email: 'demo@example.invalid', role, userRoleId: role === 'DOCTOR' ? 'doctor-1' : 'demo-clinic-central' } : null;
  return <AuthContext.Provider value={{ user, loading: false, dispatch: () => {} }}>{children}</AuthContext.Provider>;
}
export const useAuth = () => useContext(AuthContext);
`);
  const layoutPath = join(runtime, 'src/app/layout.tsx');
  let layout = readFileSync(layoutPath, 'utf8');
  layout = layout.replace('import {Geist, Geist_Mono} from "next/font/google";', '');
  layout = layout.replace(/const geistSans = Geist\([\s\S]*?\);/, "const geistSans = { variable: '' };");
  layout = layout.replace(/const geistMono = Geist_Mono\([\s\S]*?\);/, "const geistMono = { variable: '' };");
  writeFileSync(layoutPath, layout);
  const configPath = join(runtime, 'next.config.ts');
  writeFileSync(configPath, readFileSync(configPath, 'utf8').replace('const nextConfig: NextConfig = {', 'const nextConfig: NextConfig = {\n    devIndicators: false,'));

  const api = makeApi();
  await new Promise((resolveReady, reject) => {
    api.once('error', reject);
    api.listen(5184, '127.0.0.1', resolveReady);
  });
  const child = spawn(process.execPath, [join(runtime, 'node_modules/next/dist/bin/next'), 'dev', '--hostname', '127.0.0.1', '--port', '5183'], {
    cwd: runtime,
    stdio: 'inherit',
    env: { ...process.env, NEXT_PUBLIC_API_URL: `${apiOrigin}/api/`, NEXT_TELEMETRY_DISABLED: '1' },
  });
  const stop = () => { child.kill('SIGTERM'); api.close(); };
  process.once('SIGINT', stop);
  process.once('SIGTERM', stop);
  child.once('exit', (code) => { api.close(); process.exitCode = code || 0; });
  console.log(`Medify actual components + fictional read-only data: ${webOrigin}/?demo=1`);
}
