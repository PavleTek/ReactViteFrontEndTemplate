Pavletek front end template with React, Vite, and tailwind

## Setup Instructions

1. Install dependencies:
```bash
npm install
```

2. Run development:
```bash
npm run dev
```

### Railway steps for deployment
1) Start your front end repo with this as a template
2) Start a service in railway with your repo as the source
3) Deploy on railway.
4) After deployment deploy a public url to access the webpage
5) Set the .env value VITE_ALLOWED_HOSTS as the public ulr of the webpage
6) after deploying the backend, set the VITE_API_BASE_URL as the backend url and add https:// at the start and /api at the end
