/**
 * Chat provider orchestration — fallback chain
 *
 * Tries providers in order: Gemini → Groq → Cloudflare
 * If one fails or hits quota, falls through to next.
 * All providers return AsyncIterable<string> of text chunks.
 */

import * as gemini from './providers/gemini.js';
import * as groq from './providers/groq.js';
import * as cloudflare from './providers/cloudflare.js';
import * as claude from './providers/claude.js';

/** Ordered free-tier fallback chain */
const FREE_PROVIDERS = [gemini, groq, cloudflare];

/**
 * Get the list of configured providers in fallback order
 * @returns {Array} configured providers
 */
export function getProviderChain() {
  return FREE_PROVIDERS.filter(p => p.isConfigured());
}

/**
 * Try each provider in sequence until one streams successfully.
 *
 * @param {Array<{role: string, content: string}>} messages - Conversation history (user/assistant roles)
 * @param {string} systemPrompt - System instruction text
 * @returns {{ provider: string, stream: AsyncIterable<string> }}
 * @throws {Error} if all providers fail
 */
export async function streamWithFallback(messages, systemPrompt) {
  const chain = getProviderChain();

  if (chain.length === 0) {
    throw new Error('no_providers_configured');
  }

  let lastError = null;

  for (const provider of chain) {
    try {
      console.log(`[api] chat: trying ${provider.name}`);
      const iterable = await provider.stream(messages, systemPrompt);
      console.log(`[api] chat: using ${provider.name}`);
      return { provider: provider.name, stream: iterable };
    } catch (err) {
      lastError = err;
      const isQuota = provider.isQuotaError(err);
      console.warn(
        `[api] chat: ${provider.name} failed${isQuota ? ' (quota)' : ''}:`,
        err?.message || err
      );
      // Continue to next provider for any error type
    }
  }

  const err = new Error(`all_providers_failed: ${lastError?.message || 'unknown'}`);
  err.lastError = lastError;
  throw err;
}

/**
 * Stream from Claude Haiku (premium users only).
 * No fallback — Claude is the premium experience.
 *
 * @param {Array<{role: string, content: string}>} messages
 * @param {string} systemPrompt
 * @returns {{ provider: string, stream: AsyncIterable<string> }}
 * @throws {Error} if Claude is not configured or fails
 */
export async function streamPremium(messages, systemPrompt) {
  if (!claude.isConfigured()) {
    throw new Error('claude_not_configured');
  }

  console.log('[api] chat: using claude (premium)');
  const iterable = await claude.stream(messages, systemPrompt);
  return { provider: 'claude', stream: iterable };
}
