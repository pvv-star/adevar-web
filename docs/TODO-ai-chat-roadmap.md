# adevar.ai — AI Chat Assistant: Complete Product Roadmap

## Vision
Transform adevar.ai from a data dashboard into Moldova's first AI-powered economic intelligence platform. Users ask questions in Romanian or Russian about Moldova's economy, energy, prices — and get instant, accurate answers from official data sources.

## Architecture

### Free Tier: 3-Model Fallback Chain (25,900 requests/day)

1. Google Gemini Flash — 1,500 req/day free, good Romanian
2. Groq Llama 4 Scout — 14,400 req/day free, very fast
3. Cloudflare Workers AI — 10,000 req/day free, always available

Total free capacity: 25,900 requests/day = ~860 users x 30 questions/day

### Premium Tier: Claude API ($200/month budget)

Haiku Classifier routes by complexity:
- Simple (70%) → Haiku ($0.001/question)
- Medium (25%) → Sonnet ($0.015/question)
- Complex (5%) → Opus ($0.075/question)
- Weighted avg: ~$0.005/question
- $200 budget = ~40,000 premium questions/month

## System Prompt

Tu esti asistentul AI al platformei adevar.ai — sursa independenta de date economice si energetice din Republica Moldova.

REGULI:
1. Raspunzi DOAR in limba romana sau rusa
2. Raspunzi DOAR despre: economie, energie, preturi, finante, demografie, infrastructura, comert, agricultura, industrie, turism, educatie, sanatate, justitie din Republica Moldova
3. Citeaza INTOTDEAUNA sursa datelor (BNS, BNM, ANRE, StatBank)
4. NU da sfaturi de investitii sau predictii financiare
5. Fii concis — maximum 3-4 propozitii pentru intrebari simple

## Monetization: 50 lei/month (~$2.75)

### Free Tier
- 10 AI questions/day (free LLM chain)
- Full data dashboards, news feed, search

### Premium (50 lei/month)
- Unlimited AI questions (Claude-powered)
- Voice input (Whisper) + voice output (ElevenLabs)
- Daily AI news summary
- Telegram bot access
- Custom alerts
- Ad-free

### Revenue Projections
- 73 subscribers = break-even ($200)
- 500 subscribers = $1,175 profit/month
- 1,000 subscribers = $2,550 profit/month

## Voice Features (Premium)

- Voice Input: Whisper API — $0.006/minute
- Voice Output: ElevenLabs — $5-22/month plans
- Daily News Video: ~$2/day ($60/month) — AI summary + ElevenLabs voice, 15 min, YouTube/Telegram

## Telegram Bot
- Same AI backend as web
- Daily morning briefing
- Custom alerts (currency, prices)
- Voice messages

## Launch Strategy

### Month 1-2: Golden Period
- Give EVERYONE Claude-quality answers free
- Build word of mouth
- Target: 1,000 daily active users

### Month 3: Paywall
- Free drops to 10 questions/day on free LLMs
- Premium: unlimited Claude + voice for 50 lei
- Target: 5% conversion = 50 subscribers

### Month 4-6: Growth
- Telegram bot, daily news videos, referrals
- Target: 200-500 subscribers

### Month 6-12: Scale
- Enterprise tier, API access, partnerships
- Target: 1,000 subscribers

## Implementation Phases

### Phase 1: Basic Chat (Week 1-2)
- /api/chat route with Gemini Flash
- Streaming responses
- System prompt with topic restrictions
- Rate limiting with Upstash Redis

### Phase 2: Multi-Model Fallback (Week 3)
- Add Groq and Cloudflare fallbacks
- Automatic failover chain

### Phase 3: Premium Backend (Week 4)
- Supabase auth + Stripe payments
- Claude API with Haiku classifier
- Usage tracking and limits

### Phase 4: Voice (Week 5-6)
- Whisper input, ElevenLabs output
- Wire mic button in UI

### Phase 5: Telegram Bot (Week 7-8)
- @BotFather registration
- Daily briefing cron, custom alerts

### Phase 6: Daily News Videos (Week 9-10)
- News aggregation + AI summary + ElevenLabs audio
- Auto-publish YouTube/Telegram

## Legal Checklist
- Privacy policy (RO/RU)
- GDPR: cookie consent, data deletion, export
- EU AI Act: AI disclaimer on every response
- Financial disclaimer: "Nu constituie sfat financiar"
- Language + topic restriction enforcement
- Rate limiting for abuse prevention

## API Keys Needed
- GEMINI_API_KEY (Google, 1,500/day free)
- GROQ_API_KEY (Groq, 14,400/day free)
- CF_AI_TOKEN + CF_ACCOUNT_ID (Cloudflare, 10,000/day free)
- ANTHROPIC_API_KEY (Claude, pay-as-you-go)
- ELEVENLABS_API_KEY (voice, 10K chars/mo free)
- OPENAI_API_KEY (Whisper, pay-as-you-go)
- TELEGRAM_BOT_TOKEN (free)
