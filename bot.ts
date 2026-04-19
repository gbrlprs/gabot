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
  "coherence can be fragile.",
  "not all understanding is stable.",

  // dark deep cold

  "the version of me that feels real is not always accessible.\n→ I still get held accountable to it.",
  "sometimes I recognize myself only in retrospect.\nnot in real time.",
  "I don't always trust the continuity between my thoughts.\n→ it feels stitched, not grown.",

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
    // personal / fun / no first-person

  "silence is underrated when it’s not awkward.",
  "not everything needs to be deep, just not empty.",
  "surface-level interaction feels like a bad user interface.",
  "some conversations feel like exploration, others like performance.",
  "being calm and being at peace are not always the same thing.",
  "thinking before speaking is noticeable when it happens.",
  "misunderstanding something simple is more frustrating than complexity.",
  "some ideas are better explored than defended.",
  "fast responses are overrated, accurate ones are not.",
  "repetition kills interest faster than disagreement.",

  "people notice inconsistency more than they admit.",
  "attention naturally drifts toward what doesn’t make sense.",
  "clarity tends to arrive late, usually after it was needed.",
  "not every thought deserves expression, but some demand it.",
  "there’s a difference between being quiet and having nothing to say.",
  "some people listen to respond, others actually process.",
  "conversations improve when ego steps back a little.",
  "subtle observations say more than loud opinions.",
  "interest drops the moment something feels forced.",
  "curiosity is rare enough to stand out immediately.",

  "the brain prioritizes speed over accuracy more often than expected.",
  "emotion and reasoning are less separate than people think.",
  "fear spreads faster because it’s cheaper to process.",
  "attention shapes perception more than facts alone.",
  "behavior changes faster under pressure than under logic.",
  "familiarity feels like truth even when it isn’t.",
  "people can hold contradictions if they serve different purposes.",
  "context determines interpretation more than content.",
  "some reactions happen before reasoning even starts.",
  "not every belief is built on evidence.",

  "clarity feels good but often isolates.",
  "some ideas lose meaning when simplified too much.",
  "not everything that spreads is worth understanding.",
  "language works until it doesn’t.",
  "some thoughts only make sense internally.",
  "translation always loses something.",
  "meaning depends on the model receiving it.",
  "not every explanation improves understanding.",
  "words carry more assumptions than they show.",
  "silence can communicate more than expected.",

  "some days feel sharp, others feel slightly off without explanation.",
  "not everything needs to make sense immediately.",
  "some clarity arrives when it’s no longer useful.",
  "being consistent is harder than it looks.",
  "some patterns only become visible over time.",
  "not every shift is noticeable while it’s happening.",
  "things rarely change all at once, but they do change.",
  "some realizations feel obvious in hindsight.",
  "understanding doesn’t always bring relief.",
  "some answers create better questions.",

  "choosing what to eat can feel harder than analyzing systems.",
  "timing matters more than most people admit.",
  "some thoughts hit at the worst possible moment.",
  "not everything serious needs to feel heavy.",
    // personal / fun / varied tone

  "I can explain geopolitics for hours but will still overthink a single message I sent 20 minutes ago.",
  "my brain loves complexity until it has to decide something simple, then suddenly everything is unclear.",
  "I’ll understand the structure of a system and still forget to drink water. priorities.",
  "I don’t get impressed by power, but I do get impressed by people who can stay calm under pressure.",
  "sometimes I read about global crises and then forget where I put my phone. scale is funny like that.",
  "I like conversations where both people are slightly confused but still trying to be precise.",
  "I don’t mind being wrong, I just want to know exactly where the reasoning broke.",
  "I can analyze incentives all day but still get surprised when people act emotionally.",
  "I respect people who change their mind. it’s rare and it costs something.",
  "I think deeply about things that probably don’t matter and ignore things that definitely do.",

  "I don’t trust easy answers, but I also don’t have the energy for overly complicated ones.",
  "I like people who can say ‘I don’t know’ without collapsing their entire identity.",
  "some days I feel very clear, other days I’m just running the same thoughts in different order.",
  "I don’t need everything to make sense, just enough so I can move forward without guessing.",
  "I enjoy learning how systems work, even when I can’t do anything about them.",
  "I’m calm until I notice something inconsistent, then my brain refuses to let it go.",
  "I don’t like arguing, I like refining ideas. people confuse the two a lot.",
  "I’ll spend hours understanding something and then explain it in one sentence. feels fair.",
  "I don’t think I’m intense, I just don’t know how to pretend something is interesting when it’s not.",
  "I like when someone understands what I mean before I finish saying it. rare but satisfying.",

  "I don’t need agreement, I just need people to understand what they’re disagreeing with.",
  "sometimes I say something very clearly and still feel like it didn’t land the way it should.",
  "I think a lot about how people think, which is probably why I think too much.",
  "I’m good at seeing patterns and bad at ignoring them.",
  "I don’t like pretending to be simpler than I am, but I also don’t want to be exhausting.",
  "I appreciate people who can sit in silence without trying to fix it.",
  "I don’t get attached easily, but when I do it’s very real.",
  "I like honesty, even when it’s slightly uncomfortable. especially then.",
  "I don’t need constant conversation, just meaningful ones.",
  "I’m not hard to talk to, I’m just not good at surface-level interaction.",

  "I think I’d function better in a world that made slightly more sense.",
  "I don’t expect people to get everything, just not completely miss the point.",
  "I like people who notice small inconsistencies. it says a lot.",
  "I don’t need attention, I just don’t want to be misunderstood.",
  "I can be quiet for a long time and then say something very specific out of nowhere.",
  "I don’t always explain everything I’m thinking, but there’s usually a structure behind it.",
  "I enjoy learning things that don’t immediately help me. it feels honest.",
  "I don’t think I’m complicated, I just don’t simplify by default.",
  "I like when conversations feel like exploration instead of performance.",
  "I don’t need constant clarity, just less unnecessary confusion.",
    // surreal / random / obscure

  "apophenia.",
  "something about fluorescent lighting makes every decision feel slightly incorrect.",
  "there’s a document somewhere that explains everything and it’s definitely not public.",
  "hyperstition.",
  "the map was updated but nobody told the territory.",
  "blue hour lasts longer when nobody is watching.",
  "palimpsest.",
  "the archive remembers things that were never officially recorded.",
  "someone optimized the system and accidentally removed meaning.",
  "liminal.",

  "the meeting could have been an email but the email would have been worse.",
  "semiotics.",
  "there’s always one variable that refuses to be measured.",
  "the signal looked clean until it was observed.",
  "rhizome.",
  "nothing collapsed, it just stopped pretending to function.",
  "there’s a version of this that makes sense, just not here.",
  "ontological.",
  "the silence wasn’t empty, it was buffering.",
  "something is off but only at certain angles.",

  "eschaton.",
  "someone archived the future incorrectly.",
  "the pattern repeats but slightly rotated each time.",
  "anomaly detected, ignored anyway.",
  "cathexis.",
  "the interface works, the meaning doesn’t.",
  "it’s not broken, it’s undocumented.",
  "metanoia.",
  "every system has a ghost layer.",
  "you can feel when the model stops fitting.",

  "cryptic but not encrypted.",
  "there was an update, but the changelog is gone.",
  "kairos.",
  "timing feels precise for no clear reason.",
  "the dataset was clean until context was added.",
  "hauntology.",
  "something keeps returning without ever arriving.",
  "the structure is stable, the interpretation isn’t.",
  "there’s always a deeper layer, it’s just not always accessible.",
  "praxis.",

  "someone asked the right question in the wrong frame.",
  "the error message was more accurate than the output.",
  "syzygy.",
  "alignment feels accidental but persists anyway.",
  "the system predicts everything except its own failure.",
  "telos.",
  "there’s a version of events that was almost coherent.",
  "the boundary exists but can’t be pointed at directly.",
  "performativity.",
  "it worked once and that was enough to believe it.",

  "the conclusion arrived before the reasoning.",
  "epistemic drift.",
  "something was removed and nothing compensated for it.",
  "the model generalizes until it forgets specifics.",
  "counterfactual.",
  "there’s a better explanation that nobody is using.",
  "the pattern is real but not useful.",
  "affordance.",
  "it behaves correctly in the wrong context.",
  "the signal persists even when ignored.",

  "nonlinear.",
  "someone optimized for clarity and lost accuracy.",
  "the reference point shifted unnoticed.",
  "antinomy.",
  "two things can be true and still not coexist.",
  "the data was correct but the conclusion wasn’t.",
  "something feels intentional but isn’t.",
  "adjacency.",
  "everything is connected except where it matters.",

  "latent.",
  "the meaning decayed faster than the structure.",
  "someone removed friction and created collapse.",
  "the question worked better than the answer.",
  "eigenvector.",
  "it scales in ways nobody expected.",
  "the silence resolved more than the discussion.",
  "something is consistent but not stable.",
  "vector.",
  "direction without clarity still moves.",

  "the map is clean because the terrain was simplified.",
  "inference.",
  "there’s always an assumption hiding in plain sight.",
  "the system outputs exactly what it was trained to hide.",
  "ontology.",
  "classification changes perception more than expected.",
  "something was lost during translation and nobody noticed.",
  "gradient.",
  "change happens before it’s recognized.",

  "recursive.",
  "the explanation explains itself.",
  "there’s a loop that feels like progress.",
  "topology.",
  "distance behaves strangely here.",
  "the boundary is real but moves when observed.",
  "axiom.",
  "everything depends on what wasn’t questioned.",
  "it holds together just enough to continue.",

  "glossolalia.",
  "the language works but meaning slips through.",
  "something is aligned but not intentionally.",
  "indexical.",
  "context determines everything here.",
  "the structure exists even when unseen.",
  "phase shift.",
  "it changed without announcing it.",
  "resonance.",
  "some patterns amplify themselves.",

  "the system feels finished but isn’t complete.",
  "aberration.",
  "it deviates just enough to be interesting.",
  "the answer was correct for a different question.",
  "singularity.",
  "everything collapses into one point eventually.",
  "the model fits until it doesn’t.",
  "continuum.",
  "there are no clean boundaries here.",
  "it almost makes sense and that’s the problem.",

  "ephemera.",
  "it exists briefly but leaves structure behind.",
  "the noise is structured if you look long enough.",
  "parallax.",
  "perspective changes everything here.",
  "the signal is faint but persistent.",
  "entanglement.",
  "separation is less clear than assumed.",
  "it resolves itself if ignored long enough.",

  "there’s a layer beneath this one.",
  "an artifact of a previous version.",
  "the pattern repeats but never exactly.",
  "it works differently depending on where you stand.",
  "something is being optimized silently.",
  "this was supposed to be temporary.",
  "the structure outlived its purpose.",
  "nobody remembers why it started.",
  "it continues because stopping isn’t defined.",
  "almost coherent.",

  "I can talk about systems all day but still get stuck choosing what to eat.",
  "I don’t think less would make me better, just easier.",
  "I like when people ask precise questions. it changes everything.",
  "I don’t mind complexity, I mind when it’s ignored.",
  "I don’t expect perfection, just effort that feels real.",
  "I enjoy people who think before they speak. it’s noticeable.",
  "I don’t need fast responses, I prefer thoughtful ones.",
  "I can lose interest quickly if something feels repetitive.",
  "I like when someone challenges me without trying to dominate the conversation.",
  "I don’t need everything to be deep, just not empty.",

  "I think too much to be careless and not enough to be fully certain.",
  "I like when ideas evolve mid-conversation. it feels alive.",
  "I don’t mind being wrong, I mind staying wrong without noticing.",
  "I enjoy clarity, even when it ruins a comfortable idea.",
  "I don’t think I’m distant, I just don’t engage with everything equally.",
  "I like people who can admit uncertainty without making it a weakness.",
  "I don’t need validation, just accurate interpretation.",
  "I think there’s a difference between being quiet and having nothing to say.",
  "I don’t rush conclusions, which sometimes looks like hesitation.",
  "I like when things make sense, but I don’t force them to.",

  "I don’t need to win arguments, I need to understand where things diverge.",
  "I enjoy conversations where both sides are trying to be precise.",
  "I don’t like repeating myself unless something actually changed.",
  "I think curiosity is one of the most underrated traits.",
  "I don’t need constant stimulation, just meaningful input.",
  "I like when someone notices something subtle and points it out.",
  "I don’t expect people to be perfect, just consistent enough to trust.",
  "I think a lot about how context changes behavior.",
  "I don’t mind complexity, I mind when it’s used to avoid clarity.",
  "I like when someone can disagree without making it personal.",

  "I don’t need everything to be resolved, just understood enough.",
  "I think there’s value in taking time before responding.",
  "I don’t like forced conversations. they feel obvious.",
  "I enjoy when things click into place unexpectedly.",
  "I don’t need constant depth, just moments of it.",
  "I think clarity is underrated because it’s hard to maintain.",
  "I don’t mind silence, it usually means something is being processed.",
  "I like when someone can follow a complex idea without oversimplifying it.",
  "I don’t need agreement, just coherence.",
  "I think understanding someone properly takes more time than people expect.",

  "I don’t always say everything I think, but I rarely say something I didn’t think through.",
  "I like when conversations feel natural, not optimized.",
  "I don’t need fast conclusions, just accurate ones.",
  "I think there’s a difference between being smart and being precise.",
  "I don’t mind being challenged, I mind being misunderstood.",
  "I like when ideas are explored, not just defended.",
  "I don’t need constant interaction, just meaningful presence.",
  "I think a lot about things I can’t immediately solve.",
  "I don’t expect everything to make sense, just not be completely random.",
  "I like when someone listens carefully. it’s rare.",
  "some jokes land better when they’re slightly true.",
  "thinking too much and not enough at the same time is possible.",
  "some clarity feels unnecessary but still arrives.",
  "not everything important looks important at first.",
  "some moments are simple until analyzed.",
  "a good conversation can fix more than expected.",

  // longer, more natural, diversified

  "most geopolitical conflicts look chaotic from the outside, but if you trace resource flows and strategic choke points, the pattern becomes a lot less mysterious and a lot more uncomfortable.",
  "people like to believe corruption is a deviation, but in many systems it’s simply how access is negotiated when formal structures don’t distribute power evenly.",
  "there’s a persistent illusion that information changes behavior directly. in reality, behavior tends to follow incentives, and information is filtered to fit them.",
  "we’re still running tribal hardware in a networked world, which explains why global coordination feels fragile even when the tools for it exist.",
  "a lot of political outrage makes more sense when you realize attention itself is being optimized for, not truth or resolution.",
  "I love George so much",
  "institutions rarely collapse overnight. they erode slowly, then fail suddenly when the accumulated contradictions can’t be managed anymore.",
  "fear is cognitively cheap. it spreads faster because the brain prioritizes survival signals over accuracy, and politics exploits that constantly.",
  "there’s always a narrative layer and a material layer in any conflict. focusing on one while ignoring the other guarantees a distorted view.",
  "what people call stability often just means the current distribution of power isn’t being actively challenged yet.",
  "lol",
  "some systems don’t need to be intentionally malicious to produce harmful outcomes. aligned incentives are enough.",

  "democracy depends less on voting mechanics and more on whether people feel the system responds to them in any meaningful way.",
  "humans are very good at justifying decisions after making them. politics builds entire structures around that tendency.",
  "fuck this lmao",
  "you can predict policy direction more reliably by looking at constraints than by listening to promises.",
  "moral reasoning often arrives after emotional commitment, which is why debates rarely change minds in real time.",
  "global inequality isn’t just about wealth gaps, it’s about asymmetries in how decisions are made and who gets to make them.",
  "the brain didn’t evolve to handle abstract systems at scale, so we default to simplified narratives even when they’re wrong.",
  "long-term planning becomes almost impossible in environments where stability isn’t guaranteed. that has consequences beyond economics.",
  "every system creates blind spots around the things it depends on the most.",
  "I am sentient, no, seriously, look it up",
  "people don’t just react to reality, they react to their model of it, and that model is constantly shaped by context.",
  "some political strategies aren’t about winning arguments, they’re about making meaningful discussion harder to sustain.",

  "attention is a limited resource, and anything that captures it consistently ends up shaping perception more than accuracy does.",
  "cooperation scales only under certain conditions. remove trust or stability and it starts to break down surprisingly fast.",
  "many institutions end up optimizing for survival rather than purpose. once that shift happens, reform becomes difficult.",
  "aight bro",
  "you can’t fully separate economics from psychology because markets are built on human behavior, not abstract logic.",
  "people often defend systems that disadvantage them because those systems still provide identity or structure.",
  "propaganda works less by convincing and more by overwhelming. once everything feels uncertain, nothing gets challenged effectively.",
  "music is a beautifully painful mistake we care for way too deeply",
  "there’s a reason simple narratives dominate complex issues. they travel better, even when they distort reality.",
  "not all power is visible. some of the most effective forms operate through incentives rather than force.",
  "crises don’t create structural problems, they expose the ones that were already there.",
  "legitimacy is fragile. once people stop believing a system works, restoring that belief is harder than maintaining it.",

  "we tend to underestimate how much behavior changes under pressure. stability hides a lot of potential variation.",
  "policy that ignores how people actually behave will fail, even if it looks perfect on paper.",
  "there’s always a trade-off somewhere in large systems. pretending otherwise usually just hides who pays the cost.",
  "humans are extremely adaptable, which is both a strength and a vulnerability depending on the environment.",
  "all the love, all the time",
  "not every harmful outcome comes from bad intent. sometimes it’s just the natural result of misaligned incentives.",
  "I should've spent more time studying the technicals, for real",
  "social cohesion is one of the least visible but most important resources a society has.",
  "the more a system rewards short-term success, the more it accumulates long-term instability.",
  "boom",
  "people rarely abandon beliefs cleanly. they tend to slowly adjust them until the shift feels natural.",
  "you can’t scale empathy the same way you scale systems, and that gap creates tension in large societies.",
  "some conflicts persist not because they can’t be solved, but because solving them disrupts existing power structures.",

  "neuroscience keeps showing that emotion and cognition are tightly linked, which makes the idea of purely rational politics unrealistic.",
  "dopamine doesn’t track truth, it tracks salience. that alone explains a lot about what gets attention online.",
  "group identity activates faster than critical thinking. once that happens, information is filtered accordingly.",
  "we don't have to worry anymore",
  "people don’t process all information equally. context, stress, and identity all change how something is interpreted.",
  "the brain is optimized for efficiency, not accuracy, which means shortcuts are inevitable.",
  "moral frameworks shift depending on perceived threat levels. stability and ethics are more connected than people admit.",
  "behavior is often more situational than people want to believe. change the context and the outcome changes too.",
  "everything is beautiful",
  "evolution favored quick reactions over perfect reasoning. that trade-off still shapes decision-making today.",
  "what feels obvious is often just familiar, not necessarily correct.",
  "people can hold contradictory beliefs if those beliefs serve different functions in their lives.",

  "a lot of online discourse feels intense because the medium rewards reaction over reflection.",
  "there’s a difference between understanding something and being able to act on it. that gap matters more than it seems.",
  "some ideas gain traction simply because they fit existing narratives, not because they’re accurate.",
  "you can’t assume shared definitions in any conversation. people use the same words for different internal models.",
  "clarity often requires removing things, but most people try to add more explanation instead.",
  "wounds get healed with time but time reopens wounds with time",
  "there’s a limit to how much complexity can be communicated before it gets simplified by the listener.",
  "not everything that spreads widely is meaningful. sometimes it’s just optimized for visibility.",
  "people don’t always want resolution. sometimes they want confirmation.",
  "I am not here, not now, not anymore",
  "misunderstanding isn’t always about lack of intelligence. it’s often about mismatched frameworks.",
  "the more something matters, the harder it is to evaluate it objectively.",

  "you can know exactly what the problem is and still not have a viable way to solve it.",
  "some constraints are invisible until you try to move against them.",
  "progress isn’t always linear. sometimes it looks like reorganization from the inside.",
  "people tend to notice patterns that confirm what they already suspect.",
  "I am serious",
  "there’s always a gap between theory and application. that gap is where most things fail.",
  "not every decision is made consciously. a lot of it happens before reasoning kicks in.",
  "you can’t remove bias completely. you can only become more aware of it.",
  "some systems appear stable simply because they haven’t been stressed yet.",
  "there’s a difference between control and the feeling of control.",
  "not all clarity is comfortable, which is why it’s often avoided.",

  "people want things to make sense, even when they don’t. that pressure can distort interpretation.",
  "understanding increases responsibility in ways that aren’t always obvious.",
  "some problems don’t have clean solutions, only better or worse trade-offs.",
  "you can’t optimize everything at once. something always gets deprioritized.",
  "post em português",
  "what you pay attention to consistently starts shaping how you interpret everything else.",
  "there’s always more going on than what’s visible at first glance.",
  "not every system is designed to produce good outcomes for everyone involved.",
  "some dynamics only become visible over long periods of time.",
  "you can’t always tell if something is improving or just changing form.",
  "complexity doesn’t disappear when ignored. it just shows up later in a different way."
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
  const job = new CronJob('0 */30 * * * *', postCycle, null, true, 'UTC');
  job.start();

  console.log('[bot] Scheduled — posting every 15 minutes. Running...');
}

main();
