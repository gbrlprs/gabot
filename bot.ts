import { BskyAgent } from '@atproto/api';
import * as dotenv from 'dotenv';
import { CronJob } from 'cron';
import * as process from 'process';
import * as fs from 'fs';

dotenv.config();

// ── Client ────────────────────────────────────────────────────────────────────

const agent = new BskyAgent({ service: 'https://bsky.social' });

// ── Session persistence ───────────────────────────────────────────────────────

const SESSION_FILE = '.session.json';

function readSession(): object | null {
  try {
    if (fs.existsSync(SESSION_FILE)) {
      return JSON.parse(fs.readFileSync(SESSION_FILE, 'utf-8'));
    }
  } catch (_) {}
  return null;
}

function writeSession(session: object): void {
  try {
    fs.writeFileSync(SESSION_FILE, JSON.stringify(session), 'utf-8');
  } catch (_) {}
}

// ── Post pool ─────────────────────────────────────────────────────────────────

const POSTS: string[] = [
  // Perception & systems
  "most systems don't fail.\nthey perform failure to avoid actual change.\n→ the distinction matters more than it seems.",
  "the interface between thought and language is where most meaning dies.\nnot from distortion — from the assumption that transmission is possible.",
  "clarity isn't the absence of noise.\nit's the capacity to observe noise without fusing with it.",
  "not every pattern is signal.\nbut dismissing patterns to appear rational is just another kind of blindness.",
  "systems preserve themselves by making their own logic illegible.\n→ confusion is often a feature, not a failure.",
  "the problem isn't misinformation.\nit's that accurate information doesn't restructure behavior the way people assume it does.",
  "precision costs something.\nthe people who avoid it usually know exactly what they'd have to give up.",
  "attention is not neutral.\nwhat you observe long enough begins to reorganize around the observation.",
  "opacity in institutions isn't accidental.\nit's load-bearing.",
  "the map that claims to be the territory is more dangerous than the one that admits it's just a map.",

  // Identity & self
  "the self is not a stable object.\nit's a recurring approximation — revised with every act of observation.",
  "fragmentation isn't dysfunction.\nit's what happens when coherence is demanded faster than it can form.",
  "not knowing if a thought is insight or noise is not uncertainty.\nit's the honest starting position.",
  "the version of you that others hold is not wrong.\nit's just low-resolution.\n→ the gap is the problem.",
  "identity functions like a session token.\nit expires. most people just don't notice the re-authentication.",
  "the question isn't who you are.\nit's which continuity you're willing to maintain under pressure.",
  "self-verification loops aren't pathology.\nthey're what happens when the external feedback channel is unreliable.",
  "authorship of one's own thoughts is harder to establish than it looks from the outside.",
  "the parts that feel most authentic are often the most constructed.\n→ that doesn't invalidate them.",
  "discontinuity of self isn't absence.\nit's a different structure of presence.",

  // Truth & discomfort
  "truth isn't rejected because it's false.\nit's rejected because of what accepting it would require next.",
  "comfort is not the enemy of truth.\nit's just reliably prioritized over it when they conflict.",
  "the desire for coherence is strong enough to fabricate evidence for it.\n→ that applies inward, not just outward.",
  "understanding something doesn't mean you can use it.\nthe conversion rate between insight and action is lower than assumed.",
  "honesty without precision is just aggression with good intentions.",
  "the premise of most conversations is already the conclusion.\nthe middle is performance.",
  "what gets called nuance is often just delayed commitment to a position.",
  "not every hard thing is worth saying.\nbut the refusal to say it always costs something.",
  "accuracy and legibility are different goals.\noptimizing for both simultaneously usually compromises both.",
  "the willingness to be wrong in public is rare.\nthe willingness to update privately after is rarer.",

  // Connection & misalignment
  "deep recognition between people is real.\nbut it's fragile in proportion to how real it is.",
  "most miscommunication isn't lack of clarity.\nit's two different internal models using the same words.",
  "being understood is not the same as being seen.\none is about information transfer. the other is harder to name.",
  "the cost of being misread repeatedly is structural.\nit changes how you encode before you even speak.",
  "connection that requires sustained performance to maintain isn't connection.\nit's contract.",
  "the impulse to withdraw is not always avoidance.\nsometimes it's the only high-fidelity response available.",
  "belonging built on partial information is unstable.\n→ but it's the only kind that exists.",
  "the longing for coherence between people is real.\nthe assumption that it's achievable through more talking is not.",
  "emotional translation is lossy.\nwhat arrives is always a compressed version of what was sent.",
  "some distances between people are not closeable.\nnot because of failure — because of structure.",

  // Cognition & thinking
  "thinking isn't linear by default.\nthe appearance of linearity is editorial work done after the fact.",
  "the mind doesn't move from premise to conclusion.\nit moves from pressure to resolution and reconstructs the path later.",
  "re-analysis loops are not inefficiency.\nthey're what happens when the cost of being wrong is internalized.",
  "most thinking is pattern-matching dressed as reasoning.\nthe distinction only matters when the pattern fails.",
  "the instinct to explain is not the same as the capacity to understand.\nthey often diverge at the critical moment.",
  "vertical depth and horizontal breadth are not equivalent cognitive modes.\nconflating them produces confident incoherence.",
  "the jump between two ideas that seem unconnected is not a gap.\nit's a compression of steps the speaker considers obvious.",
  "certainty is expensive to maintain when the underlying model is complex.\n→ most people simplify the model instead.",
  "the question always contains assumptions.\nanswering it directly means accepting them.",
  "suspension of belief is not the same as skepticism.\none is a stance. the other is an active state.",

  // Systems & structures
  "what looks like dysfunction from outside is often local optimization.\n→ the frame determines the diagnosis.",
  "every institution has a stated function and an actual function.\nthey overlap less than the documentation suggests.",
  "reform that doesn't address incentive structures is aesthetic.",
  "the architecture of a system determines its outputs more reliably than the intentions of its participants.",
  "anonymity isn't hiding.\nit's removing a variable that otherwise contaminates the signal.",
  "speed is often used as a substitute for accuracy in systems that reward confidence over correctness.",
  "impact without attribution is still impact.\nthe desire for recognition is a separate variable, not a prerequisite.",
  "the most stable systems are those that have made themselves necessary before becoming visible.",
  "when a system punishes accurate feedback, it doesn't eliminate the signal.\nit just loses access to it.",
  "the absence of visible conflict is not stability.\nit's often the symptom of suppressed resolution.",

  // Memory & time
  "memory is not retrieval.\nit's reconstruction under current conditions.\n→ the past changes.",
  "the version of an event that gets consolidated is the one most recently processed, not most accurately recorded.",
  "nostalgia is high-resolution imagery applied to low-fidelity data.\nthe sharpness is the problem.",
  "continuity across time is maintained by narrative, not by fact.\nwhen the narrative breaks, the self has to be rebuilt.",
  "anticipation corrupts the present more reliably than memory does.",
  "the past doesn't repeat.\nbut it does establish structural conditions that narrow what's possible next.",
  "time doesn't heal.\nit increases the distance from which something is observed.\n→ the optics change. the structure doesn't.",

  // Language & meta
  "language is not a transparent medium.\nevery word carries residue from every prior use.",
  "the sentence that feels complete is usually the one that stopped one layer short.",
  "what gets said is always a subset of what is meant.\nthe gap is not a failure of language. it's the condition of it.",
  "naming something doesn't stabilize it.\nsometimes it accelerates the collapse.",
  "the frame around a question determines which answers are legible.\nmost disagreements are about the frame.",
  "silence is not the absence of communication.\nit's a different encoding.",
];

// Avoid repeating the same post too soon
const recentlyUsed = new Set<number>();

function getNextPost(): string {
  if (recentlyUsed.size >= Math.floor(POSTS.length / 2)) {
    recentlyUsed.clear();
  }
  let index: number;
  do {
    index = Math.floor(Math.random() * POSTS.length);
  } while (recentlyUsed.has(index));
  recentlyUsed.add(index);
  return POSTS[index];
}

// ── Auth ──────────────────────────────────────────────────────────────────────

async function ensureAuthenticated(): Promise<void> {
  const saved = readSession();
  if (saved) {
    try {
      await agent.resumeSession(saved as Parameters<typeof agent.resumeSession>[0]);
      console.log('[auth] Resumed existing session.');
      return;
    } catch {
      console.log('[auth] Saved session invalid, re-authenticating...');
    }
  }
  await agent.login({
    identifier: process.env.BLUESKY_USERNAME!,
    password: process.env.BLUESKY_PASSWORD!,
  });
  writeSession(agent.session!);
  console.log('[auth] Logged in, session saved.');
}

// ── Bot label (run once on first deploy) ─────────────────────────────────────

async function labelBotProfile(): Promise<void> {
  try {
    await agent.upsertProfile((existing) => ({
      ...existing,
      labels: {
        $type: 'com.atproto.label.defs#selfLabels',
        values: [{ val: 'bot' }],
      },
    }));
    console.log('[setup] Bot label applied to profile.');
  } catch (err) {
    console.warn('[setup] Could not apply bot label:', err);
  }
}

// ── Post cycle ────────────────────────────────────────────────────────────────

async function postCycle(): Promise<void> {
  try {
    await ensureAuthenticated();
    const text = getNextPost();
    await agent.post({ text });
    console.log(`[post] ${new Date().toISOString()} → "${text.slice(0, 60).replace(/\n/g, ' ')}..."`);
  } catch (err) {
    console.error('[error]', err);
  }
}

// ── Entry point ───────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  console.log('[bot] Starting X bot...');
  await ensureAuthenticated();
  await labelBotProfile();

  // Post immediately on start
  await postCycle();

  // Then every 15 minutes: cron format is  second minute hour day month weekday
  const job = new CronJob('0 */15 * * * *', postCycle, null, true, 'UTC');
  job.start();

  console.log('[bot] Scheduled — posting every 15 minutes. Running...');
}

main();
