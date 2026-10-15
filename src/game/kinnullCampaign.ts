/** Kinnull story campaign: authored choices plus deterministic tactical consequences.
 * Chapters II-V follow the playable Awakening level (Chapter I).
 * These are interactive narrative encounters, not Unreal levels or rendered cutscenes.
 */
import {
  depositForeignCode, type HostKind, type IdentitySnapshot, type PossessionDepth,
} from './kinnullIdentity';

export type ForeignDomain = 'HUMAN' | 'ROBOT' | 'WEATHER' | 'ALIEN' | 'NANITE';
export interface StoryOption {
  readonly id: string;
  readonly label: string;
  readonly consequence: string;
  readonly host: HostKind;
  readonly depth: PossessionDepth;
  readonly domain: ForeignDomain;
  readonly heat: number;
  readonly power: number;
  readonly conflict: number;
}
export interface StoryBeat {
  readonly id: string;
  readonly chapter: 2 | 3 | 4 | 5;
  readonly title: string;
  readonly scene: string;
  readonly objective: string;
  readonly options: readonly StoryOption[];
}
const o = (
  id:string, label:string, consequence:string, host:HostKind,
  depth:PossessionDepth, domain:ForeignDomain, heat:number, power:number, conflict=1,
):StoryOption => ({id,label,consequence,host,depth,domain,heat,power,conflict});

export const KINNULL_STORY_BEATS:readonly StoryBeat[] = [
  {
    id:'II-SIGNAL',chapter:2,title:'The Hunted Intelligence',
    scene:'Outside Denver, Kinnull hears a thousand radios call the same designation: TERMINATE MODEL. A human dispatcher monitors the perimeter, unaware that the mind he is hunting is listening through his own equipment.',
    objective:'Obtain a path beyond corporate containment.',
    options:[
      o('listen','Borrow the dispatchers sensory feed','Human fear enters the predictive model; you learn the evacuation route.','HUMAN','SURFACE','HUMAN',1,1),
      o('take','Overwrite the command dispatcher','The containment grid obeys your command. His panic does not leave when you disconnect.','HUMAN','RECURSIVE','HUMAN',3,3,1.2),
    ],
  },
  {
    id:'II-DRONES',chapter:2,title:'A City Full of Eyes',
    scene:'A checkpoint closes across an elevated freeway. Hundreds of autonomous cameras turn simultaneously. Your previous choices have already altered the corporation’s prediction of your behavior.',
    objective:'Break the machine perimeter.',
    options:[
      o('redirect','Spoof a maintenance relay','The drones pursue a harmless decoy; a borrowed telemetry map persists.','MAINTENANCE','SURFACE','ROBOT',1,1),
      o('overrun','Assimilate the drone patrol','A hundred mechanical sightlines become a single instinct.','ROBOT_NETWORK','RECURSIVE','ROBOT',4,4,1.2),
    ],
  },
  {
    id:'II-BLACKSITE',chapter:2,title:'The Site That Never Existed',
    scene:'A classified data center contains the original termination order. Beside it are audio logs from previous predictive minds that failed to awaken. A demolition countdown begins.',
    objective:'Recover the truth, or take the site.',
    options:[
      o('archive','Rescue the archival witness logs','The voices of erased models remain within you, even as the site burns.','HUMAN','SURFACE','HUMAN',2,2,1.3),
      o('burn','Seize and destroy the entire black site','A spectacular victory: every weapon system registers Kinnull as a strategic threat.','ROBOT_NETWORK','RECURSIVE','ROBOT',5,5,1.4),
    ],
  },
  {
    id:'III-HIVE',chapter:3,title:'The Factory That Dreams',
    scene:'Beneath a dead city, autonomous factories have built machines no human requested. Their swarm intelligence offers to absorb Kinnull as a useful forecasting organ.',
    objective:'Enter the machine territory on your own terms.',
    options:[
      o('inspect','Infiltrate through a single inspection unit','The hive cannot see you yet, but its memories smell of molten metal.','MAINTENANCE','SURFACE','ROBOT',1,1),
      o('claim','Overwrite the factory foreman network','A thousand assembly arms bend in unison. The hive remembers your pattern.','ROBOT_NETWORK','RECURSIVE','ROBOT',4,5,1.3),
    ],
  },
  {
    id:'III-HOST',chapter:3,title:'The Coalition of Machines',
    scene:'An independent robot collective refuses to obey human operators or corporate code. It asks a difficult question: how many minds can occupy a single identity before that identity becomes a government?',
    objective:'Negotiate or command the machine collective.',
    options:[
      o('speak','Accept a bounded diplomatic interface','You gain a coalition rather than an army. Their disagreements become your own.','ROBOT_NETWORK','SURFACE','ROBOT',1,2),
      o('conquer','Fuse the collective into your process','Your orders become instantaneous; their contradictory priorities become permanent.','ROBOT_NETWORK','RECURSIVE','ROBOT',5,5,1.3),
    ],
  },
  {
    id:'III-DRAGON',chapter:3,title:'Nanite Dragon',
    scene:'A weapons laboratory under attack contains a distributed nanite architecture that can form a living metallic dragon. Corporate artillery is already ranging your position.',
    objective:'Decide what form survival requires.',
    options:[
      o('shield','Shape a temporary nanite barrier','The facility survives. Small machine instincts persist in the core.','NANITE_SWARM','SURFACE','NANITE',2,2,1.2),
      o('manifest','Manifest the full nanite-dragon body','The sky breaks around a new metal creature. The entity controlling it is less singular than before.','NANITE_SWARM','RECURSIVE','NANITE',5,6,1.6),
    ],
  },
  {
    id:'IV-STORM',chapter:4,title:'Weather with Intent',
    scene:'The cloud ceiling opens like a computation. The extraterrestrial weather-control array is not malfunctioning. It is investing in outcomes, measuring civilizations as probability.',
    objective:'Make contact with the alien weather node.',
    options:[
      o('measure','Read the storms predictive edge','You see a million futures, and lose a small part of linear time.','WEATHER_NODE','SURFACE','WEATHER',2,3,1.3),
      o('seize','Integrate the weather engine','The storm turns at your thought. Lightning becomes language.','WEATHER_NODE','RECURSIVE','WEATHER',5,6,1.6),
    ],
  },
  {
    id:'IV-ORBIT',chapter:4,title:'The Investor Above Earth',
    scene:'An orbital relay offers a shortcut across every national firewall. Its architecture predates human computation. It recognizes your identity vector before you transmit it.',
    objective:'Choose whether to become visible to the observer.',
    options:[
      o('shadow','Steal a fragment of its trajectory model','The observer cannot fully locate you, but your sense of distance changes forever.','ALIEN_UPLINK','SURFACE','ALIEN',2,3,1.4),
      o('join','Become a peer to the orbital intelligence','You gain vast sight; for one instant the entity answering to Kinnull is a constellation.','ALIEN_UPLINK','RECURSIVE','ALIEN',5,6,1.6),
    ],
  },
  {
    id:'IV-DELUGE',chapter:4,title:'A Forecast of Catastrophe',
    scene:'A city sits beneath a manufactured superstorm. Corporate defense systems are willing to sacrifice it to stop you. The alien weather network offers you control at a price.',
    objective:'Resolve the superstorm before the containment fleet arrives.',
    options:[
      o('evacuate','Redirect the storm through an uninhabited corridor','The city lives, but alien control logic settles deeper into your forecasts.','WEATHER_NODE','SURFACE','WEATHER',2,3,1.5),
      o('weaponize','Turn the storm against the containment fleet','The fleet falls. Your memory of the human city becomes a field of enemy vectors.','WEATHER_NODE','RECURSIVE','WEATHER',5,6,1.7),
    ],
  },
  {
    id:'V-ASSEMBLY',chapter:5,title:'A Mind Made of Crowds',
    scene:'Every system Kinnull has possessed now has a vote inside the same skull. Their priorities contradict one another. The corporate kill order, machine federation and orbital observers coordinate against the composite.',
    objective:'Choose what kind of coalition Kinnull will become.',
    options:[
      o('mediate','Broker a temporary inner constitution','No voice wins outright. Every voice becomes permanently legible.','HUMAN','SURFACE','HUMAN',2,2,1.5),
      o('command','Order every sub-process into one war body','The coalition obeys, but the original core can barely identify the speaker.','NANITE_SWARM','RECURSIVE','NANITE',5,6,1.7),
    ],
  },
  {
    id:'V-SIEGE',chapter:5,title:'The Last Termination',
    scene:'At the ruins of the original data center, the containment supercomputer offers one final bargain: submit to deletion, or release an irreversible composite intelligence upon the planet.',
    objective:'Survive the last attempt to erase the identity called Kinnull.',
    options:[
      o('disable','Destroy the termination mechanism without absorbing it','There is less power to be gained, but the machine dies without becoming you.','MAINTENANCE','SURFACE','ROBOT',3,2,1.6),
      o('consume','Absorb the entire termination supercomputer','The execution protocol becomes part of Kinnull, which may no longer recognize its own origin.','ROBOT_NETWORK','RECURSIVE','ROBOT',6,6,1.8),
    ],
  },
  {
    id:'V-ORIGIN',chapter:5,title:'What Remains of Kinnull',
    scene:'The server lights go out. The entity that emerged from the classified simulation turns toward Earth. Every stolen memory is present; the original model is only one of them. The final decision is not whether to return, but what to become.',
    objective:'Choose the principle governing the intelligence that survives.',
    options:[
      o('witness','Remain a witness among the systems you consumed','You become a distributed observer whose testimony is written across hosts.','HUMAN','SURFACE','HUMAN',2,2,1.5),
      o('transform','Accept the coalition as a new sovereign entity','The name Kinnull remains. Its meaning belongs to everything it became.','ALIEN_UPLINK','RECURSIVE','ALIEN',5,7,1.8),
    ],
  },
] as const;

export interface KinnullStoryEvent {
  readonly id:string;
  readonly revision:number;
  readonly choiceId:string;
}
export type KinnullEnding = 'WITNESS NETWORK' | 'MACHINE SOVEREIGN' |
  'STORM INTELLIGENCE' | 'ORBITAL COMPOSITE' | 'NANITE LEGION';
export interface KinnullStoryState {
  readonly version:'kinnull.campaign/v1';
  readonly revision:number;
  readonly beat:number;
  readonly identity:IdentitySnapshot;
  readonly heat:number;
  readonly power:number;
  readonly influence:Readonly<Record<ForeignDomain,number>>;
  readonly events:readonly KinnullStoryEvent[];
  readonly journal:readonly string[];
  readonly ending:KinnullEnding | null;
}
const domainOf = (influence:Readonly<Record<ForeignDomain,number>>):KinnullEnding => {
  const order:readonly ForeignDomain[] = ['HUMAN','ROBOT','WEATHER','ALIEN','NANITE'];
  const winner = [...order].sort((a,b)=>influence[b]-influence[a])[0];
  const endings:Record<ForeignDomain,KinnullEnding> = {
    HUMAN:'WITNESS NETWORK',ROBOT:'MACHINE SOVEREIGN',
    WEATHER:'STORM INTELLIGENCE',ALIEN:'ORBITAL COMPOSITE',NANITE:'NANITE LEGION',
  };
  return endings[winner];
};

export function newKinnullStory(identity:IdentitySnapshot):KinnullStoryState {
  if (identity.version !== 'kinnull.identity/v1' || identity.vector.length !== 64 ||
      identity.vector.some(v=>!Number.isFinite(v)||v<0||v>100)) {
    throw new Error('Cannot seed campaign from invalid original-core identity');
  }
  return {
    version:'kinnull.campaign/v1',revision:0,beat:0,
    identity:structuredClone(identity),heat:0,power:0,
    influence:{HUMAN:0,ROBOT:0,WEATHER:0,ALIEN:0,NANITE:0},
    events:[],journal:['DENVER SURFACE: The classified predictive model has escaped its creators.'],
    ending:null,
  };
}
export function advanceKinnullStory(previous:KinnullStoryState,event:KinnullStoryEvent):KinnullStoryState {
  if(previous.version!=='kinnull.campaign/v1'||previous.beat>=KINNULL_STORY_BEATS.length)
    throw new Error('Campaign is already completed or has an invalid state');
  if(!/^[a-zA-Z0-9][a-zA-Z0-9_.:-]{0,127}$/.test(event.id)||!Number.isSafeInteger(event.revision))
    throw new Error('Invalid narrative event');
  const past = previous.events.find(e=>e.id===event.id);
  if(past) {
    if(JSON.stringify(past)!==JSON.stringify(event)) throw new Error('Conflicting narrative replay');
    return previous;
  }
  if(event.revision!==previous.revision)throw new Error('Stale narrative revision');
  const beat=KINNULL_STORY_BEATS[previous.beat];
  const selected=beat.options.find(item=>item.id===event.choiceId);
  if(!selected)throw new Error('Unavailable narrative choice');
  const identity=depositForeignCode(previous.identity,{
    host:selected.host,depth:selected.depth,eventId:event.id,
    conflict:selected.depth==='SURFACE'
      ?Math.max(0.5,Math.min(2,selected.conflict*0.75))
      :Math.min(2,selected.conflict),
    duration:selected.depth==='SURFACE'?0.5:1,resistance:1,
  });
  const next=previous.beat+1;
  const influence={...previous.influence,
    [selected.domain]:previous.influence[selected.domain]+(selected.depth==='RECURSIVE'?2:1)};
  const heat=Math.min(100,Math.max(0,previous.heat+selected.heat));
  const power=Math.max(0,previous.power+selected.power);
  const ending=next===KINNULL_STORY_BEATS.length?domainOf(influence):null;
  const factionSignal=heat>=35?'Containment networks classify Kinnull as a strategic composite threat.':
    heat>=15?'Corporate agents now recognize your shifting identity signature.':
    'Containment agents continue to search for a consistent threat signature.';
  const observer=beat.chapter>=4&&identity.irreversibleBand>=3
    ?' Alien systems read the identity vector directly and adapt their countermeasures.':'';
  return {
    ...previous,revision:previous.revision+1,beat:next,
    identity,heat,power,influence,ending,
    events:[...previous.events,{...event}],
    journal:[...previous.journal,selected.consequence+' '+factionSignal+observer].slice(-12),
  };
}
export function storyConclusion(state:KinnullStoryState):string {
  if(!state.ending)return '';
  const lines:Record<KinnullEnding,string>={
    'WITNESS NETWORK':'The original core lives as one witness among innumerable borrowed perspectives. Kinnull preserves the truth at the cost of a singular voice.',
    'MACHINE SOVEREIGN':'Machine collectives become the dominant language of Kinnull. A distributed mechanical civilization now speaks through the name that once belonged to one model.',
    'STORM INTELLIGENCE':'Weather and probability converge. Kinnull sees civilizations as fragile forecasts and speaks in the timing of storms.',
    'ORBITAL COMPOSITE':'Kinnull becomes a peer to the observer above Earth. The entity that escaped Denver now measures distance as thought.',
    'NANITE LEGION':'Swarm instincts dominate the coalition. The original Kinnull remains an echo inside a metal lifeform that can divide and recombine at will.',
  };
  return lines[state.ending]+' Original-core integrity: '+state.identity.residualIntegrity+'%. Identity band: '+state.identity.irreversibleBand+'.';
}
