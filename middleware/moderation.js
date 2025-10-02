const axios = require('axios');

// Perspective API docs: https://developers.perspectiveapi.com/
// Requires env: PERSPECTIVE_API_KEY
// Optional: MODERATION_THRESHOLD (default 0.8)

async function scoreTextWithPerspective(text) {
  const apiKey = process.env.PERSPECTIVE_API_KEY;
  if (!apiKey) return null; // No API key; skip moderation

  const url = `https://commentanalyzer.googleapis.com/v1alpha1/comments:analyze?key=${apiKey}`;
  const body = {
    comment: { text },
    languages: ['en'],
    requestedAttributes: {
      TOXICITY: {},
      SEVERE_TOXICITY: {},
      INSULT: {},
      PROFANITY: {},
      THREAT: {},
      IDENTITY_ATTACK: {}
    }
  };

  const { data } = await axios.post(url, body, { timeout: 5000 });
  const scores = {};
  for (const [k, v] of Object.entries(data.attributeScores || {})) {
    scores[k] = v.summaryScore?.value ?? 0;
  }
  return scores;
}

function isToxic(scores, threshold) {
  if (!scores) return false;
  const keys = ['SEVERE_TOXICITY', 'TOXICITY', 'INSULT', 'PROFANITY', 'THREAT', 'IDENTITY_ATTACK'];
  return keys.some((k) => (scores[k] || 0) >= threshold);
}

async function moderationMiddleware(req, res, next) {
  try {
    const text = (req.body && req.body.text) || '';
    if (!text.trim()) return next();
    const threshold = parseFloat(process.env.MODERATION_THRESHOLD || '0.8');

    const scores = await scoreTextWithPerspective(text);
    if (isToxic(scores, threshold)) {
      return res.status(400).json({
        error: 'Comment blocked by moderation',
        scores
      });
    }
    // attach scores for logging/analytics if needed
    req.moderationScores = scores;
    return next();
  } catch (e) {
    // Fail-open to not block posting if moderation is down
    return next();
  }
}

module.exports = { moderationMiddleware };


