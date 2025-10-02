# DevBook Client

## Toxic Comment Detection

- Enable by setting `PERSPECTIVE_API_KEY` in environment.
- Optional threshold: `MODERATION_THRESHOLD` (default `0.8`).
- Middleware blocks posts/comments whose scores exceed the threshold for any of: `SEVERE_TOXICITY`, `TOXICITY`, `INSULT`, `PROFANITY`, `THREAT`, `IDENTITY_ATTACK`.


## Made with React.js

### TODO

- React Toastify for better alerts
- Custom DP (or choose from Github or Default)
- React Hook Forms
- Update forms only if there is a change