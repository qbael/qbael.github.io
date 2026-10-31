# Portfolio screenshot demos

These runners render the original Findie, Medify and Instory frontend components
with fictional local data. They never connect to the projects' databases or
production APIs. Sample people, item records, appointments, messages and media
exist only to demonstrate the interfaces.

The API fixtures are for screenshots, not for validating authentication, AI
inference, notifications, persistence or other backend behavior.

## Run locally

Run from `Portfolio/site`. The sibling application checkouts and their existing
frontend dependencies must be available; the runners do not install packages.

```sh
node scripts/demos/findie.mjs
node scripts/demos/medify.mjs
node scripts/demos/instory.mjs
```

Each process copies frontend files into `Portfolio/tmp/project-demos`, excludes
source environment files and binds its web/API servers to loopback. Original
application source and databases are not changed. Stop each runner with Ctrl+C.

| Project | Original frontend | Local web | Local API |
| --- | --- | --- | --- |
| Findie | `Hackathon/apps/web` | `http://127.0.0.1:5181` | `http://127.0.0.1:5182` |
| Medify | `HealthPro/frontend` | `http://127.0.0.1:5183` | `http://127.0.0.1:5184` |
| Instory | `Instory/frontend` | `http://127.0.0.1:5185` | `http://127.0.0.1:5186` |

The runners print their capture routes. Seed data and locally authored sample
media are stored in `public/projects/demo-assets`. Interface captures are saved
in `public/projects` and must be labeled as using fictional demo data.

## Five screens per project

| Project | Screens |
| --- | --- |
| Findie | Search homepage, six search results, item details, claim review, Hub intake |
| Medify | Patient homepage, doctor discovery, booking slots, clinic appointments, weekly schedule form |
| Instory | Feed and stories, messaging, user administration, profile and highlights, trending hashtags |

For Medify, use `?demo=1` on all routes and select **Chọn ngày 02/11** on
`/doctors/doctor-1`. The two staff views are `/clinic/appointment` and
`/doctor/schedules`; open **Đăng Ký Lịch Làm** for the weekly template.
For Instory, select **Minh Anh** on `/chat`; the profile is
`/profile/linh.nguyen` and trends are `/hashtagtrending?tag=dulich`.
Findie prints complete URLs with its fixture IDs. Enter review notes and tick
the physical verification checkboxes for the claim/intake screens, without
submitting changes.

## Check fixtures

These checks do not require running the original backends or frontend servers.

```sh
node scripts/demos/findie.mjs --check
node scripts/demos/medify.mjs --check
node scripts/demos/instory.mjs --check
```
