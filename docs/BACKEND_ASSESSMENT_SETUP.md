# Backend assessment integration

## What the frontend calls

The frontend uses same-origin URLs under `/api/edubridge`:

- `GET /api/edubridge/assessment/bank`
- `GET /api/edubridge/assessment/images/{question_id}`
- `POST /api/edubridge/assessment/submit`

The proxy maps these to the backend `/api/v1` routes and injects `X-API-Key` on the server. The API key must never use a `VITE_` prefix or be sent to browser JavaScript.

## Local development

Create a local `.env` file (do not commit it):

```dotenv
EDUBRIDGE_API_TARGET=http://127.0.0.1:8000
EDUBRIDGE_API_KEY=your_backend_api_key
```

Start the backend, then run `npm run dev`. Vite adds the API key to proxied requests.

## Production

The frontend repository is a Vite SPA and does not include a production application server. Configure the HTTPS reverse proxy in front of the static frontend using `deploy/nginx-edubridge-proxy.conf`. Create `/etc/nginx/secrets/edubridge-api-key.conf` with a `set $edubridge_api_key "...";` directive, readable only by the deployment administrator. The sample Nginx config includes this file. Do not put the secret in frontend environment variables or static files.

The backend should remain bound to localhost or a private network. The image endpoint also requires the backend's configured image directory to contain the licensed image files named `{QuestionId}.jpg`.

## Assessment behavior and constraints

- Catalog entries are grouped from `concept_names` returned by `/assessment/bank`.
- Each selected concept starts one assessment and displays its question images.
- A/B/C/D are submitted as `AnswerValue` 1/2/3/4.
- Pre-test, post-test, and remedial modes remain available in the assessment UI.
- The frontend expects the backend score-summary extension from the companion `feature/assessment-score-summary` backend change (`correct_count`, `incorrect_count`, `incorrect_question_ids`, and `score`). Merge/deploy that backend change for the final score and remedial wrong-question list to appear. The browser never receives the answer key.
- The current student identifier is a random browser-local pseudonymous ID. Real student accounts and server-side persistence still require the application's authentication/database integration.
- Teacher dashboard is a UI skeleton only; it does not yet have class/student records or authorization.
