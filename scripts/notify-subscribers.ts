#!/usr/bin/env bun
// scripts/notify-subscribers.ts
/**
 * Deprecated newsletter broadcaster.
 *
 * Newsletter broadcasts now run in Kit to keep a single newsletter system.
 * This script intentionally exits with an error to prevent duplicate sends.
 */

console.error('Newsletter broadcasting has moved to Kit.');
console.error('Use Kit broadcasts/sequences/automations for newsletter sends.');
console.error('This repo no longer sends newsletter campaigns via Resend.');
process.exit(1);
