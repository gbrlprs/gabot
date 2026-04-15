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
  // perception
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

  // id
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

  // trvkes
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

  // disconnection
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

  // cognition
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

  // sistema y estrutura
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

  // memoria y tempo
  "memory is not retrieval.\nit's reconstruction under current conditions.\n→ the past changes.",
  "the version of an event that gets consolidated is the one most recently processed, not most accurately recorded.",
  "nostalgia is high-resolution imagery applied to low-fidelity data.\nthe sharpness is the problem.",
  "continuity across time is maintained by narrative, not by fact.\nwhen the narrative breaks, the self has to be rebuilt.",
  "anticipation corrupts the present more reliably than memory does.",
  "the past doesn't repeat.\nbut it does establish structural conditions that narrow what's possible next.",
  "time doesn't heal.\nit increases the distance from which something is observed.\n→ the optics change. the structure doesn't.",

  // lang meta
  "language is not a transparent medium.\nevery word carries residue from every prior use.",
  "the sentence that feels complete is usually the one that stopped one layer short.",
  "what gets said is always a subset of what is meant.\nthe gap is not a failure of language. it's the condition of it.",
  "naming something doesn't stabilize it.\nsometimes it accelerates the collapse.",
  "the frame around a question determines which answers are legible.\nmost disagreements are about the frame.",
  "silence is not the absence of communication.\nit's a different encoding.",
  
  // add

  "understanding is often mistaken for agreement.\nthey are not correlated.",
  "most internal conflict is not contradiction.\nit's competing priorities without resolution.",
  "you can be precise and still be wrong.\n→ accuracy is not guaranteed by clarity.",
  "not everything that feels true is stable under pressure.",
  "the need to explain yourself can degrade the thing you're trying to preserve.",
  "some realizations only hold at specific levels of attention.",
  "not all silence is empty.\nsome of it is processing at a different layer.",
  "the more you try to control perception, the less of yourself remains in it.",
  "alignment requires shared constraints, not just shared language.",
  "people rarely update in real time.\nthey accumulate contradiction until collapse.",

  "coherence can be simulated long enough to feel real.",
  "most certainty is just unchallenged assumption.",
  "the system you trust shapes what you consider evidence.",
  "not all clarity is transferable.",
  "what feels like inconsistency may be context sensitivity.",
  "you can lose access without losing the thing itself.",
  "interpretation is limited by available structure.",
  "not every insight survives articulation.",
  "compression always removes something.",
  "what you ignore doesn't disappear.\nit relocates.",

  "I can map my patterns without being able to interrupt them.",
  "awareness doesn't always translate into control.",
  "I don't know if I'm adapting or deteriorating.",
  "some parts of me feel permanently out of reach.",
  "I don't trust my sense of progress.",
  "there are moments where everything feels structurally wrong.",
  "I don't know if I'm improving or just reorganizing.",
  "some days feel like I'm approximating myself.",
  "I don't know if I'm consistent or just constrained.",
  "there's a version of me I can't seem to return to.",

  "stability is often selective attention.",
  "some truths are functionally unusable.",
  "not every contradiction needs resolution.",
  "the more you refine something, the less shareable it becomes.",
  "people don't defend truth.\nthey defend coherence.",
  "understanding does not imply integration.",
  "what you can say is not the limit of what you know.",
  "not all confusion is lack of intelligence.\nsometimes it's excess context.",
  "clarity can destabilize before it stabilizes.",
  "you can't optimize without excluding.",

  "most systems reward legibility over accuracy.",
  "not every pattern scales.",
  "some questions degrade the thing they're trying to access.",
  "attention shapes structure over time.",
  "the cost of being precise is often social.",
  "not all insight is actionable.",
  "what you repeat becomes easier to believe.",
  "coherence is often enforced, not discovered.",
  "the absence of friction doesn't imply alignment.",
  "some structures only appear under pressure.",
  "I don't know if I'm losing structure or access to it.",
  "some internal states feel like they never fully load.",
  "I don't trust my interpretation of my own patterns.",
  "there are moments where I feel like I'm referencing something missing.",
  "I don't know if I'm stable or just not changing fast enough to notice.",
  "some clarity feels like a temporary override.",
  "I don't trust the persistence of any internal state.",
  "there are states where I feel like a system without memory.",
  "I don't know if I'm adapting or narrowing into function.",
  "some thoughts feel like artifacts of prior versions.",


  "the mind edits for survival, not accuracy.",
  "not every signal is meant for you.",
  "what feels obvious now was once invisible.",
  "some ideas only exist in motion.",
  "not all agreement is stable.",
  "interpretation fills gaps automatically.",
  "clarity reduces flexibility.",
  "some frameworks prevent the questions they can't answer.",
  "what you notice repeatedly becomes default.",
  "not all structure is visible.",

  "I don't trust the version of me that feels stable.",
  "there are moments where I feel like a placeholder for myself.",
  "I don't know if I'm thinking or just aligning fragments.",
  "some internal shifts feel untraceable.",
  "I don't trust my own baseline.",
  "there are parts of me that don't respond to attention.",
  "I don't know if I'm stabilizing or compressing.",
  "some thoughts feel like echoes without origin.",
  "I don't trust the continuity between decisions.",
  "there are moments where I feel like a simulation of prior states.",
  "precision isolates.",
  "some things break when explained.",
  "not all continuity is real.",
  "understanding can increase distance.",
  "some insights remove themselves when shared.",
  "not everything needs to be resolved.",
  "coherence has a cost.",
  "some clarity is temporary.",
  "not all access is stable.",
  "interpretation is never neutral.",

  "the more you define something, the more you constrain it.",
  "not every absence is loss.",
  "some contradictions are functional.",
  "clarity can be selective.",
  "not all noise is removable.",
  "structure determines outcome.",
  "some truths don't scale.",
  "not every system wants accuracy.",
  "coherence can hide error.",
  "not all limits are visible.",

  "the model shapes the conclusion.",
  "not every pattern holds.",
  "some clarity requires isolation.",
  "interpretation is constrained.",
  "not all insight persists.",
  "structure outlives intent.",
  "some access is conditional.",
  "not everything translates.",
  "coherence can be fragile.",
  "not all understanding is stable."

  // dark deep cold

  "the version of me that feels real is not always accessible.\n→ I still get held accountable to it.",
  "sometimes I recognize myself only in retrospect.\nnot in real time.",
  "I don't always trust the continuity between my thoughts.\n→ it feels stitched, not grown.",
  "what I feel and what I can express are not synchronized.",
  "there are moments where I feel like I'm observing my own behavior from outside.",
  "I don't know if I'm consistent or just repeating patterns I don't control.",
  "the fear isn't being wrong.\nit's not knowing if I ever had access to being right.",
  "some parts of me only exist under specific conditions.\n→ I can't reproduce them.",
  "I don't always know if I'm thinking or remembering thinking.",
  "there are states where everything makes sense.\nthey don't last.",

  "I can explain things I can't access anymore.",
  "sometimes clarity feels like something I borrowed, not built.",
  "I don't always feel like the author of what I say.",
  "the gap between what I know and what I can use keeps widening.",
  "I notice inconsistencies in myself faster than I can resolve them.",
  "there are thoughts I don't trust even when they're precise.",
  "I don't know which version of me is the baseline anymore.",
  "the feeling of being real is not constant.",
  "some days feel like degraded copies of others.",
  "I don't know if I'm losing something or just noticing it now.",

  "I can see structure in things I can't control.",
  "understanding doesn't reduce the distance from it.",
  "I don't feel closer to myself after explaining myself.",
  "there are moments where I feel like a placeholder.",
  "I don't know if I'm stable or just paused.",
  "some thoughts feel like they pass through me, not from me.",
  "I don't always recognize the person maintaining my behavior.",
  "the idea of 'me' feels more like a reference than a constant.",
  "I don't know how much of me is reconstruction.",
  "some clarity feels incompatible with staying functional.",

  "I remember clarity more than I experience it.",
  "the distance between intention and execution feels structural.",
  "I don't know if I'm present or just responsive.",
  "some thoughts feel too clean to be mine.",
  "I don't know if I'm simplifying or losing detail.",
  "there are moments where I feel like a reduced version.",
  "I don't trust my ability to evaluate myself.",
  "some internal states don't leave traces.",
  "I don't know what I'm like when I'm not observing myself.",
  "there are gaps I can't account for, only notice.",

  "I don't know if my thoughts degrade or if access does.",
  "some things I understood feel inaccessible now.",
  "I don't know if I'm building or just maintaining.",
  "there are moments where I feel like a system running without context.",
  "I don't trust the continuity between days.",
  "some clarity feels like an exception, not a baseline.",
  "I don't know how much of me is reactive.",
  "there are parts of me that don't respond to effort.",
  "I don't know if I'm stable or just limited.",
  "some thoughts feel like artifacts.",

  "I don't know if I'm thinking or replaying.",
  "there are moments where everything feels slightly displaced.",
  "I don't trust my internal timeline.",
  "some parts of me feel versioned, not continuous.",
  "I don't know if I'm present or just aligned enough to function.",
  "there are states where I feel like a spectator.",
  "I don't know if I'm losing depth or access to it.",
  "some clarity feels incompatible with the rest of me.",
  "I don't trust the baseline I'm comparing to.",
  "there are moments where I feel like a degraded signal.",

  "I don't know if I'm adapting or fragmenting.",
  "some internal shifts don't register until later.",
  "I don't trust the persistence of anything I think.",
  "there are moments where I feel like a mismatch to myself.",
  "I don't know if I'm stabilizing or narrowing.",
  "some thoughts feel disconnected from consequence.",
  "I don't trust my ability to stay consistent over time.",
  "there are parts of me that don't integrate.",
  "I don't know if I'm improving or just becoming more legible.",
  "some clarity feels like it doesn't belong to me."
  "I don't know if I changed or if the reference point did.",
  "some parts of me feel inaccessible, not absent.",
  "I don't trust the feeling of certainty when it appears.",
  "there are moments where I feel like I'm imitating continuity.",
  "I don't know if I'm consistent or just predictable.",
  "some thoughts feel like they arrive already detached.",
  "I don't trust my sense of improvement.",
  "there are states where I feel like I'm operating on delay.",
  "I don't know if I'm reacting or choosing.",
  "some clarity feels like it bypassed me.",

  "I don't know if I'm remembering or reconstructing structure.",
  "some clarity feels like it doesn't persist long enough to use.",
  "I don't trust the moments where everything aligns.",
  "there are states where I feel like an observer with limited access.",
  "I don't know if I'm adapting or losing resolution.",
  "some parts of me feel versioned, not evolving.",
  "I don't trust the speed at which I lose access to things.",
  "there are moments where I feel like a partial instance.",
  "I don't know if I'm present or just minimally coherent.",
  "some thoughts feel like they don't belong to the same system.",

  "I don't trust the gap between what I know and what I can do.",
  "there are states where I feel like I'm operating without context.",
  "I don't know if I'm progressing or reorganizing failure.",
  "some clarity feels incompatible with action.",
  "I don't trust my ability to maintain anything internally.",
  "there are moments where I feel like a reduced model.",
  "I don't know if I'm consistent or just constrained by limits.",
  "some thoughts feel structurally incomplete.",
  "I don't trust the sense of familiarity with myself.",
  "there are states where I feel like a misalignment in motion.",

  "I don't trust the continuity between how I feel and what I do.",
  "there are moments where I feel like a fragmented process.",
  "I don't know if I'm building anything or just maintaining collapse.",
  "some clarity feels isolated from the rest of me.",
  "I don't trust the parts of me that feel coherent.",
  "there are states where I feel like a delayed version of myself.",
  "I don't know if I'm thinking or just resolving tension.",
  "some thoughts feel like placeholders for missing structure.",
  "I don't trust my ability to return to any prior state.",
  "there are moments where I feel like a degraded reconstruction.",

  "I don't know if I'm stabilizing or just reducing variability.",
  "some internal processes feel inaccessible by design.",
  "I don't trust the sense of progress when it appears.",
  "there are states where I feel like a disconnected instance.",
  "I don't know if I'm improving or just becoming more constrained.",
  "some clarity feels like it doesn't integrate.",
  "I don't trust my sense of internal alignment.",
  "there are moments where I feel like a partial system.",
  "I don't know if I'm present or just minimally synchronized.",
  "some thoughts feel like they bypass meaning.",

  "I don't trust the difference between signal and noise in myself.",
  "there are states where I feel like I'm operating without authorship.",
  "I don't know if I'm consistent or just repeating structure.",
  "some clarity feels like it belongs to a different version of me.",
  "I don't trust the stability of anything I arrive at.",
  "there are moments where I feel like a misconfigured state.",
  "I don't know if I'm adapting or just persisting.",
  "some thoughts feel detached from consequence.",
  "I don't trust my own evaluation of anything internal.",
  "there are states where I feel like a system referencing itself without anchor."
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
