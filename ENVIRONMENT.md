# Development and production environments

Requires Node.js 20.12+ (tested with Node.js 22).

Each app has local `.env`, `.env.development`, and `.env.production` files.
Actual environment files are ignored by Git; `.env.*.example` files are safe templates.
`.env.development.local` and `.env.production.local` override the corresponding file.
Shell/service environment variables take precedence over file values.

The launcher selects `APP_ENV` explicitly. Direct server commands use `.env`'s
`APP_ENV=development` default unless APP_ENV or NODE_ENV is supplied externally.
Never copy backend credentials into REACT_APP_* or EXPO_PUBLIC_* variables: those
values are visible in the frontend bundle.

| Project | Development | Production |
| --- | --- | --- |
| backendNew | `npm run dev` | `npm start` |
| CRMDude | `npm start` | `npm run build`, then `npm run serve` |
| crm_technician_app | `npm start` / `npm run web` | `npm run export:production` |
| video_server | `npm run dev` | `npm start` |

Restart development servers after changing environment files. Rebuild/re-export
frontends for production; frontend environment values are embedded at build time.

## Database

Only backendNew connects to MongoDB. Development uses:

```text
mongodb://localhost:27117,localhost:27118,localhost:27119/crmdude?replicaSet=crmDevRS
```

The restored database is selected by the URI, including the change-stream client.
The backend's migration/helper scripts use the same environment configuration.
This setup does not run migrations or connect to production automatically.

For production, edit `backendNew/.env.production` on the API server:

```dotenv
MONGO_URI=mongodb://USERNAME:URL_ENCODED_PASSWORD@YOUR_PRODUCTION_HOST:27017/crmdude?authSource=admin
JWT_SECRET=YOUR_LONG_RANDOM_PRODUCTION_SECRET
PUBLIC_API_URL=https://your-api-host
```

Use `mongodb+srv://...` if your database service requires it, and include TLS or
replicaSet parameters required by that server. URL-encode username/password special
characters. Production database credentials and JWT secret are intentionally blank
in the generated local production file; the backend refuses missing credentials.

## API clients

Set `REACT_APP_API_URL` in CRMDude and `EXPO_PUBLIC_API_URL` in the technician app
to the API origin **without `/api`**. Set CRMDude's `REACT_APP_SOCKET_URL` to the
socket server origin. Uploaded document URLs use the selected API origin.
On a physical phone, localhost points to the phone: change the development API URL
to `http://YOUR_COMPUTER_LAN_IP:5001`. Keep MongoDB bound to localhost; the phone
connects to the API, not the database. Match PUBLIC_API_URL to the reachable API
origin if photos/documents must load on a phone.

The CRM still contains legacy Firebase features. Development routes these to local
Firebase Database/Storage emulators (localhost:9000 and localhost:9199) using a demo
project. Run your Firebase emulators if testing those features. Production public
Firebase settings are preserved from the original app configuration. No Firebase
or production database data is modified by this environment setup.

## Video server

The video server stores files, not MongoDB records. Configure PORT, HOST, and
UPLOAD_DIR in its selected environment file. Relative upload paths resolve inside
the video_server project. HTTPS can be provided by your deployment reverse proxy.
