/* Lessons for AP World History: Modern. Steps are documented in study-lessons.js; `q` steps point at a
   question in the course's bank. Lesson ids are permanent.
   Lessons with `track: 'write'` appear in the write tab instead of on the path. */
(window.STUDY_LESSONS = window.STUDY_LESSONS || {})['ap-world'] = [
  /* ---------- 3.1 empires expand ---------- */
  {
    id: 'apw3-map', unit: 'u3', title: 'Who ruled what, and when',
    steps: [
      { type: 'stages', title: 'Seven states to know', visual: 'empire-bars', stages: [
        { name: 'The whole picture', text: 'Unit 3 covers **1450 to 1750**. New weapons, more revenue and stronger claims to rule let states grow larger than most before them. The shaded band marks the unit’s years.' },
        { name: 'Ottoman', text: 'Sunni Muslim rulers of Southern Europe, the Middle East and North Africa. They were already old in 1450 and lasted until 1922.' },
        { name: 'Safavid', text: 'Shi’a Muslim rulers of Persia, from 1501. Their faith put them in constant conflict with the Ottomans.' },
        { name: 'Mughal', text: 'Muslim rulers of a mostly Hindu South Asia, from 1526. Ruling a majority of another faith is what makes them interesting.' },
        { name: 'Ming, then Qing', text: 'Ming China fell in 1644 to the **Manchu**, northern outsiders who founded the Qing and ruled a Han Chinese majority.' },
        { name: 'Russia', text: 'From Moscow, the tsars expanded east across Siberia. Ivan IV was first crowned tsar in 1547, and Peter the Great reshaped the state after him.' },
        { name: 'Songhai', text: 'A West African Muslim-led state that controlled trans-Saharan trade until Morocco’s guns defeated it in 1591.' }
      ]},
      { type: 'teach', title: 'Three empires, side by side', image: 'map', body: 'Historians often group the **Ottoman, Safavid and Mughal** empires together. All three had Muslim rulers and used gunpowder weapons, but they disagreed on a lot, including how Islam should be practiced.\n\nYou’ll also see the **Qing and Russia**. The exam wants you to compare them, not just memorize them.' },
      { type: 'match', prompt: 'Match each empire to the people it mainly ruled over.', pairs: [
        ['Mughal', 'A mostly Hindu population in South Asia'],
        ['Qing', 'A mostly Han Chinese population'],
        ['Safavid', 'Persia, converted to Shi’a Islam'],
        ['Ottoman', 'Anatolia, the Balkans and the Arab world']
      ], why: 'A small ruling group over a large, different population is a pattern to remember. It explains why those rulers needed tolerance, local partners or both.' },
      { type: 'q', ref: 'u3-02' },
      { type: 'q', ref: 'u3-10' }
    ]
  },
  {
    id: 'apw3-guns', unit: 'u3', title: 'Guns win battles. Do they win empires?',
    steps: [
      { type: 'teach', title: 'Walls stop mattering', image: 'siege1453', body: 'In 1453, **Mehmed II** brought huge cannons to Constantinople. The city’s walls had held for about a thousand years, and they fell in weeks.\n\nThe same pattern repeats: at **Chaldiran** (1514) Ottoman guns beat Safavid cavalry, at **Panipat** (1526) Babur’s guns beat a much larger army, and at **Tondibi** (1591) Moroccan guns broke Songhai.' },
      { type: 'order', prompt: 'Put these battles in order, earliest first.', items: ['Fall of Constantinople', 'Battle of Chaldiran', 'Battle of Panipat', 'Battle of Tondibi'], why: 'You rarely need exact dates on the exam, but order matters, because causes come before effects.' },
      { type: 'teach', title: 'Then what?', body: 'A cannon can win a province, but it can’t run one. It can’t collect taxes, pay soldiers or convince people to obey.\n\nThat’s the difference between a weak answer (“they had guns”) and a strong one: **guns explain the conquest, and administration explains why it lasted.** Keep that in mind for every lesson that follows.' },
      { type: 'q', ref: 'u3-01' },
      { type: 'q', ref: 'u3-04' },
      { type: 'q', ref: 'u3-08' }
    ]
  },
  {
    id: 'apw3-rivals', unit: 'u3', title: 'Why empires fought each other',
    steps: [
      { type: 'teach', title: 'Politics and religion, tangled together', image: 'chaldiran', body: 'The course names these rivalries:\n\n**Ottoman vs. Safavid:** Sunni against Shi’a, over Anatolia and Iraq.\n\n**Safavid vs. Mughal:** over the frontier city of Kandahar.\n\n**Songhai vs. Morocco:** over the wealth of trans-Saharan trade.\n\nThe exam likes rivalries because they show causation: a political conflict can change a religion, and a religious conflict can change a border.' },
      { type: 'sort', prompt: 'Which rivalry does this belong to?', buckets: ['Ottoman vs. Safavid', 'Other rivalry'], items: [
        ['The Battle of Chaldiran', 0, 'Yes. Selim I beat Shah Ismail here in 1514.'],
        ['Fighting over Kandahar', 1, 'Yes. That was the Safavids and the Mughals.'],
        ['A Sunni sultan against a Shi’a shah', 0, 'Yes. That religious split ran through the whole conflict.'],
        ['The Battle of Tondibi', 1, 'Yes. That was Morocco against Songhai.']
      ]},
      { type: 'q', ref: 'u3-07' },
      { type: 'q', ref: 'u3-05' }
    ]
  },

  /* ---------- 3.2 administration ---------- */
  {
    id: 'apw3-elites', unit: 'u3', title: 'Who runs an empire for you?',
    steps: [
      { type: 'teach', title: 'The ruler’s problem', image: 'devshirme', body: 'Rich nobles with their own land and armies can challenge you. So rulers looked for officials who **depended on them alone**.\n\nThe **devshirme** is the classic case. Ottoman officials took Christian boys, converted them and trained them. The best became administrators, and many became **Janissaries**, the sultan’s elite infantry. They had no noble family to back them, so they rose only by serving him.' },
      { type: 'match', prompt: 'Match each elite to its empire.', pairs: [
        ['Devshirme and Janissaries', 'Ottoman'],
        ['Mansabdars, ranked officials', 'Mughal'],
        ['Scholar-officials who passed exams', 'Ming and Qing'],
        ['Salaried samurai', 'Tokugawa Japan'],
        ['Table of Ranks', 'Russia']
      ], why: 'They look different, but they share one goal: making status depend on serving the ruler, so that power flows from the center.' },
      { type: 'pick', source: 'busbecq', prompt: 'Why would a Habsburg ambassador praise the Ottoman system this way?', options: [
        ['He’s using it to criticize how Europe’s nobility blocks talented men', true, 'Right. “With us there is no opening left for merit.” His point of view shapes what he notices.'],
        ['He’s trying to flatter the sultan into a treaty', false, 'He wrote this privately to a friend, so the sultan was never going to read it.'],
        ['He’s reporting neutral statistics on Ottoman officials', false, 'There are no numbers here. It’s a persuasive comparison with his own society.']
      ]},
      { type: 'q', ref: 'u3-11' },
      { type: 'q', ref: 'u3-19' },
      { type: 'q', ref: 'u3-20' }
    ]
  },
  {
    id: 'apw3-legit', unit: 'u3', title: 'Why should anyone obey you?',
    steps: [
      { type: 'teach', title: 'God, for a start', image: 'louis14', body: 'Rulers used **religious ideas, art and monumental architecture** to make their power seem natural and right.\n\nIn France, **divine right** said a king answered only to God. Akbar’s court called royalty a “light emanating from God.” Songhai’s rulers promoted Islam. The Mexica joined human sacrifice to state power, and the Sapa Inca claimed descent from the sun.' },
      { type: 'teach', title: 'Then make it look the part', image: 'versailles', body: 'Buildings and portraits are arguments you can see. **Versailles**, the **Taj Mahal**, Qing court portraits and the Inca sun temple at Cuzco all say the same thing: this ruler is too great to challenge.\n\nVersailles also did practical work: nobles at court competing for the king’s favor weren’t home raising armies.' },
      { type: 'sort', prompt: 'Is this religion, or art and architecture?', buckets: ['Religious idea', 'Art or architecture'], items: [
        ['Divine right of kings', 0, 'Yes. It’s an idea about where authority comes from.'],
        ['Qing imperial portraits', 1, 'Yes. They display the emperor’s majesty.'],
        ['Songhai’s promotion of Islam', 0, 'Yes. It tied the ruler to a wider faith.'],
        ['Mughal mausolea', 1, 'Yes. Monuments like the Taj Mahal display wealth and power.'],
        ['Mexica human sacrifice', 0, 'Yes. It’s a religious practice that also showed state power.']
      ]},
      { type: 'q', ref: 'u3-22' },
      { type: 'q', ref: 'u3-21' },
      { type: 'q', ref: 'u3-25' }
    ]
  },
  {
    id: 'apw3-taxes', unit: 'u3', title: 'Paying for all of it',
    steps: [
      { type: 'teach', title: 'Armies are expensive', image: 'mendoza', body: 'Every empire needed revenue, and the course names four systems:\n\n**Tribute lists:** Mexica provinces owed goods, recorded on pages like this one.\n\n**Tax farming:** Ottoman contractors bought the right to collect taxes.\n\n**Zamindars:** Mughal landholders collected revenue from peasants.\n\n**Hard currency:** Ming China began demanding taxes in silver.' },
      { type: 'match', prompt: 'Match each revenue system to its state.', pairs: [
        ['Tribute lists', 'Mexica'],
        ['Tax farming', 'Ottoman'],
        ['Zamindar collection', 'Mughal'],
        ['Taxes in silver', 'Ming']
      ], why: 'Taxes are great evidence because they connect governance to the economy, and connecting themes helps with the complexity point.' },
      { type: 'pick', prompt: 'A tax farmer pays the state up front, then keeps whatever he collects beyond that. What problem would that likely cause?', options: [
        ['Pressure on peasants, since more collected means more profit', true, 'Exactly. The state gets quick money, but it gives up some control over how harshly people are taxed.'],
        ['The state would receive its money much more slowly', false, 'The reverse. Fast money up front is the main appeal of tax farming.'],
        ['Peasants would stop being taxed at all', false, 'They’d still be taxed, and possibly more heavily.']
      ]},
      { type: 'q', ref: 'u3-15' },
      { type: 'q', ref: 'u3-17' },
      { type: 'q', ref: 'u3-18' }
    ]
  },

  /* ---------- 3.3 belief systems ---------- */
  {
    id: 'apw3-reformation', unit: 'u3', title: 'A split in Christianity',
    steps: [
      { type: 'teach', title: 'A monk and a money-box', image: 'luther', body: 'In 1517, **Martin Luther** attacked the sale of indulgences, which were payments said to reduce punishment for sin after death. He taught that salvation came by faith, and that the Bible outranked the pope.\n\nThe new printing press spread his ideas quickly, and German princes had their own reasons to back him: independence from pope and emperor.' },
      { type: 'stages', title: 'Then what happened', visual: 'reformation-chain', stages: [
        { name: 'Protest', text: '**1517:** Luther’s theses attack indulgences. Other reformers, including John Calvin, soon follow.' },
        { name: 'Politics', text: 'Rulers choose sides. **Henry VIII** of England breaks with Rome in the 1530s, and religious wars divide Europe.' },
        { name: 'Response', text: 'The **Catholic Reformation** answers back. The Council of Trent (1545–63) reforms abuses and reaffirms doctrine, and the Jesuits spread Catholicism worldwide.' },
        { name: 'Result', text: 'Christian **unity** is broken for good, but both sides’ energy helps Christianity **grow**. That paradox is exactly how the course describes it.' }
      ]},
      { type: 'q', ref: 'u3-26' },
      { type: 'q', ref: 'u3-27' },
      { type: 'q', ref: 'u3-29' }
    ]
  },
  {
    id: 'apw3-faiths', unit: 'u3', title: 'Sunni, Shi’a and something new',
    steps: [
      { type: 'teach', title: 'A rivalry deepens a divide', image: 'ismail', body: 'The Sunni and Shi’a split dates back to Islam’s early centuries. What changed after 1501 is that two powerful states took opposite sides.\n\n**Shah Ismail** made Twelver Shi’ism the Safavid state religion and forced conversions. The **Ottomans** presented themselves as defenders of Sunni Islam. So the course’s verb is important: the rivalry **intensified** the split. It didn’t create it.' },
      { type: 'teach', title: 'Meanwhile, in Punjab', image: 'nanak', body: 'Where Hindu and Muslim traditions met, **Guru Nanak** (1469–1539) taught a new path. **Sikhism** teaches one God, as Islam does, and draws on Indian ideas like karma and rebirth. It also rejects caste distinctions in worship.\n\nThe exam wording to remember: Sikhism developed **in a context of interactions between Hinduism and Islam**.' },
      { type: 'sort', prompt: 'Is this a change, or a continuity?', buckets: ['Change', 'Continuity'], items: [
        ['A new religion, Sikhism, emerges in South Asia', 0, 'Yes. That’s a new development.'],
        ['Christianity splits into Catholic and Protestant churches', 0, 'Yes. Western Christian unity ended.'],
        ['Rulers keep using religion to justify their power', 1, 'Yes. That idea was already very old.'],
        ['Islam remains divided into Sunni and Shi’a', 1, 'Yes. The split itself is old. It was only intensified.']
      ]},
      { type: 'q', ref: 'u3-30' },
      { type: 'q', ref: 'u3-32' },
      { type: 'q', ref: 'u3-33' }
    ]
  },

  /* ---------- 3.4 comparison ---------- */
  {
    id: 'apw3-compare', unit: 'u3', title: 'Putting empires side by side',
    steps: [
      { type: 'teach', title: 'Same problem, different answers', image: 'akbar', body: 'Akbar and Shah Ismail both had to rule people of different faiths. **Akbar** accommodated them, ended the jizya and married into Rajput families. **Ismail** forced conversion.\n\nA good comparison names **both** sides and explains **why** they differ. Akbar ruled a large Hindu majority he couldn’t convert, while Ismail needed a religious identity to set his new state apart.' },
      { type: 'recall', prompt: 'Without looking back: what methods did rulers use to hold their empires together? Type everything you can remember, in any order.', min: 4, terms: [
        ['Devshirme or Janissaries', 'devshirme', 'janissar*'],
        ['Divine right', 'divine right', 'divine'],
        ['Monumental architecture', 'versailles', 'taj mahal', 'architecture', 'monument*', 'palace*', 'mosque*', 'temple*'],
        ['Tax systems', 'tax*', 'tribute', 'zamindar*', 'revenue'],
        ['Civil service exams', 'exam*', 'civil service', 'scholar*'],
        ['Tolerance', 'toleran*', 'jizya', 'millet*', 'accommodat*'],
        ['Force or gunpowder', 'gun*', 'cannon*', 'army', 'armies', 'military'],
        ['Art and portraits', 'portrait*', 'art', 'painting*']
      ], why: 'Pulling facts out of memory is what makes them stick, and a list like this is exactly what you’ll need before you write an essay.' },
      { type: 'q', ref: 'u3-34' },
      { type: 'q', ref: 'u3-35' },
      { type: 'q', ref: 'u3-39' },
      { type: 'q', ref: 'u3-40' }
    ]
  },

  /* ---------- writing skills ---------- */
  {
    id: 'apw-w-recall', unit: 'u3', track: 'write', title: 'Empty your head first', blurb: 'Recall before you read or write',
    steps: [
      { type: 'teach', title: 'Why essays go blank', body: 'Most students who “know nothing” in an essay do know things. They just try to write and remember at the same time.\n\nSplit the jobs. Spend your first few minutes writing down **every name, event and term** you can recall, in no order at all. That’s your evidence bank. Then you only have to choose from it.' },
      { type: 'recall', prompt: 'Try it. The topic is **the Ottoman Empire, 1450 to 1750**. Type everything you can recall.', min: 4, terms: [
        ['Mehmed II', 'mehmed'], ['Constantinople, 1453', 'constantinople', 'istanbul', '1453'], ['Suleiman I', 'suleiman'], ['Selim I', 'selim'],
        ['Chaldiran', 'chaldiran'], ['Janissaries', 'janissar*'], ['Devshirme', 'devshirme'], ['Millet system', 'millet*'], ['Tax farming', 'tax farm*'], ['Hagia Sophia', 'hagia'], ['Sunni Islam', 'sunni']
      ], why: 'Whatever you missed is what to study next. This list tells you more than rereading ever will.' },
      { type: 'recall', prompt: 'Once more. The topic is **ways rulers raised money**. Type what you remember.', min: 2, terms: [
        ['Tax farming', 'tax farm*', 'farming'], ['Zamindars', 'zamindar*'], ['Tribute lists', 'tribute'], ['Taxes in silver', 'silver', 'hard currency', 'single whip'], ['Jizya', 'jizya']
      ], why: 'Notice how each term can now be used as evidence. Next, you’ll learn to attach it to an argument.' }
    ]
  },
  {
    id: 'apw-w-saq', unit: 'u3', track: 'write', title: 'Three short answers, three points', blurb: 'Short answer: 20% of your score',
    steps: [
      { type: 'teach', title: 'Don’t write an essay', body: 'Each SAQ has three parts worth one point each. There’s no thesis, and no introduction. Graders are looking for a direct answer.\n\nUse **A-C-E**:\n**A**nswer the question in one sentence.\n**C**ite a specific example.\n**E**xplain how it answers the question, using “because” or “this shows.”\n\nOn the May 2027 exam, all three SAQs are required and each one comes with a source.' },
      { type: 'pick', prompt: 'The question says: **Describe ONE way the Ottomans recruited officials.** Which earns the point?', options: [
        ['The Ottomans used the devshirme, taking Christian boys from the Balkans and training them to serve the sultan.', true, 'Yes. It names the practice and gives its details, and that’s what “describe” asks for.'],
        ['The Ottomans used the devshirme.', false, 'That only names a term. “Describe” requires relevant characteristics, and this has none.'],
        ['The Ottoman Empire was very large and needed many people to help run its government well.', false, 'This is true but too general. It never says how they actually recruited anyone.']
      ]},
      { type: 'pick', prompt: 'The question says: **Explain ONE way Akbar’s religious policy helped him rule.** Which earns the point?', options: [
        ['Akbar ended the jizya, which won support from his Hindu majority because they no longer paid a tax for their faith.', true, 'Yes. “Because” shows how the policy led to the result. Explaining means how or why.'],
        ['Akbar ended the jizya and hosted debates among people of many religions at his court.', false, 'This has good facts, but it only describes. It never connects them to how they helped him rule.'],
        ['Akbar was a very tolerant ruler, which made him a good and popular emperor.', false, 'This has no specific evidence, and “good” doesn’t explain anything.']
      ]},
      { type: 'sort', prompt: 'Which verb is the question asking for?', buckets: ['Describe', 'Explain'], items: [
        ['Say what the millet system was and how it was organized', 0, 'Yes. Giving characteristics is describing.'],
        ['Say why the millet system helped the Ottomans keep order', 1, 'Yes. “Why” always means explain.'],
        ['Say what Busbecq noticed about Ottoman officials', 0, 'Yes. You’re reporting characteristics.'],
        ['Say how Peter’s reforms affected the nobility', 1, 'Yes. “How” a relationship works means explain.']
      ]}
    ]
  },
  {
    id: 'apw-w-thesis', unit: 'u3', track: 'write', title: 'A thesis that earns the point', blurb: 'DBQ and LEQ: 1 point',
    steps: [
      { type: 'teach', title: 'Claim + reason', body: 'A thesis has to do more than repeat the prompt. The rubric asks for a **historically defensible claim that establishes a line of reasoning**.\n\nA useful formula: **Although [other side], [your claim] because [reason].**\n\nIt can be more than one sentence, but it has to be all in one place, in your introduction or your conclusion.' },
      { type: 'pick', prompt: 'Prompt: **Evaluate the extent to which gunpowder explains the expansion of land-based empires, 1450 to 1750.** Which thesis earns the point?', options: [
        ['Although gunpowder won key battles like Constantinople, it only partly explains expansion, because lasting rule also required loyal elites and reliable taxes.', true, 'Yes. It takes a position and gives reasons, and those reasons map out the essay.'],
        ['Gunpowder affected the expansion of land-based empires from 1450 to 1750.', false, 'This just restates the prompt. College Board’s own guidelines reject this kind of sentence.'],
        ['Gunpowder was very important to empires in this period.', false, 'This is a claim, but it has no reason. That’s the “defensible, but no line of reasoning” mistake.'],
        ['Religion spread along the trade routes of Afro-Eurasia during this period.', false, 'This may be true, but it doesn’t respond to this prompt.']
      ]},
      { type: 'sort', prompt: 'Does this earn the thesis point?', buckets: ['Earns it', 'Doesn’t'], items: [
        ['Empires used many methods to rule.', 1, 'Right, it doesn’t. It’s too general, and it gives no reason.'],
        ['Both the Ottomans and Mughals relied on dependent officials, but the Ottomans built a slave elite while the Mughals drew in local nobles.', 0, 'Right, it does. It makes a comparison and sets up categories.'],
        ['This essay will compare two empires.', 1, 'Right, it doesn’t. It announces a topic instead of making a claim.'],
        ['Rulers relied on religion less than on revenue, because taxes paid the armies that kept them in power.', 0, 'Right, it does. It takes a position and gives its reason.']
      ]},
      { type: 'order', prompt: 'Build a thesis. Put the pieces in order.', items: ['Although Akbar and Aurangzeb ruled the same empire,', 'they treated non-Muslims very differently,', 'because Akbar needed Hindu allies to secure his rule,', 'while Aurangzeb sought support from Islamic orthodoxy.'], why: 'It concedes something, makes a claim, and then gives the reasoning. You could now write a paragraph for each part.' }
    ]
  },
  {
    id: 'apw-w-context', unit: 'u3', track: 'write', title: 'Set the scene, get a point', blurb: 'DBQ and LEQ: 1 point',
    steps: [
      { type: 'teach', title: 'Zoom out', body: 'The contextualization point asks you to **describe broader events or processes** connected to the prompt. They can happen before, during or after its dates.\n\nA quick test: **what was happening in the wider world that makes this topic make sense?** Write two or three sentences. The rubric says a phrase or a passing mention won’t earn it.' },
      { type: 'pick', prompt: 'Prompt: **Compare how rulers of two land-based empires consolidated power, 1450 to 1750.** Which earns contextualization?', options: [
        ['After the Mongol Empire broke apart, new states filled the gap across Eurasia. Gunpowder then let them conquer larger and more diverse territories, which created the problem of how to govern so many different peoples.', true, 'Yes. It describes larger processes, and it explains why consolidation mattered.'],
        ['There were many empires in this time period around the world.', false, 'This describes nothing specific, so it can’t count as a broader development.'],
        ['The Mongols came first.', false, 'This is only a passing reference. The rubric specifically rules out “merely a phrase or reference.”'],
        ['Akbar ended the jizya to win over his Hindu subjects.', false, 'This is good evidence, but it’s the essay’s specific topic. Context has to be broader than that.']
      ]},
      { type: 'match', prompt: 'Match each essay topic to useful context.', pairs: [
        ['The Protestant Reformation', 'The printing press and earlier Church corruption'],
        ['Ottoman expansion', 'The decline of the Byzantine Empire'],
        ['The Manchu conquest of China', 'Ming weakness, revolts and fiscal trouble'],
        ['Mughal rule', 'Earlier Muslim rule under the Delhi Sultanate']
      ], why: 'Each one explains what made the topic possible, which is exactly the job of context.' }
    ]
  },
  {
    id: 'apw-w-evidence', unit: 'u3', track: 'write', title: 'From fact to evidence', blurb: 'DBQ: 3 points. LEQ: 2 points',
    steps: [
      { type: 'teach', title: 'A fact isn’t evidence yet', body: 'A fact becomes evidence when you **connect it to your claim**. On both rubrics, the higher point requires using specifics to **support an argument**, not just mentioning them.\n\nUse this three-step sentence:\n**Fact:** what happened.\n**Detail:** the specifics.\n**So what:** how this proves your point.' },
      { type: 'pick', prompt: 'Claim: **Rulers used dependent elites to weaken rivals.** Which sentence uses the evidence best?', options: [
        ['Through the devshirme, sultans trained Christian-born boys as officials, and since these men had no noble family behind them, power stayed with the sultan instead of the Turkish nobility.', true, 'Yes. It has the fact, the details and a “so what” that ties back to the claim.'],
        ['The Ottomans had the devshirme and the Janissaries.', false, 'These are specific names, but they aren’t connected to the claim at all.'],
        ['The devshirme was a system in the Ottoman Empire that started in the late 1300s.', false, 'That’s accurate detail, but it never says how it supports the argument.']
      ]},
      { type: 'sort', prompt: 'Claim: **Religion was central to legitimizing rule.** Does this evidence support or complicate the claim?', buckets: ['Supports', 'Complicates'], items: [
        ['Bossuet says the person of the king is sacred', 0, 'Yes. That’s divine right in a sentence.'],
        ['Peter the Great taxes beards despite religious protest', 1, 'Yes. He put his reforms ahead of religious custom.'],
        ['Shah Ismail makes Twelver Shi’ism the state religion', 0, 'Yes. Faith defined his state.'],
        ['Busbecq says men rise in Ottoman service by merit', 1, 'Yes. Here, power rests on loyal service, not faith.']
      ], why: 'Using evidence on both sides lets you argue “to what extent,” and that’s also a route to the complexity point.' },
      { type: 'recall', prompt: 'Claim: **Land empires depended on revenue.** Type specific evidence that would support it.', min: 2, terms: [
        ['Ottoman tax farming', 'tax farm*'], ['Mughal zamindars', 'zamindar*'], ['Mexica tribute', 'tribute'], ['Ming silver taxes', 'silver', 'single whip', 'hard currency'], ['The jizya', 'jizya']
      ], why: 'You just did the whole chain: recall a fact, then aim it at a claim. That’s the core skill of every essay.' }
    ]
  },
  {
    id: 'apw-w-sourcing', unit: 'u3', track: 'write', title: 'Who wrote this, and why?', blurb: 'DBQ: 1 point, and MCQ sources',
    steps: [
      { type: 'teach', title: 'Four questions for any document', body: 'For **at least two documents**, the DBQ rubric asks you to explain how or why one of these matters to your argument:\n\n**Point of view:** who is this person, and how does that shape what they say?\n**Purpose:** why was it created?\n**Historical situation:** what was going on at the time?\n**Audience:** who was it for?\n\nThe trap is stopping too soon. “Bossuet was a bishop” earns nothing. You have to say **why that matters**.' },
      { type: 'pick', source: 'bossuet', prompt: 'Which sentence earns credit for sourcing?', options: [
        ['As a bishop and tutor to the king’s son, Bossuet had every reason to present royal power as sacred, since his position depended on the monarchy.', true, 'Yes. It says who he is, then explains how that shapes the argument.'],
        ['Bossuet was a French bishop who wrote in the late 1600s.', false, 'This only identifies him. The rubric asks how or why that’s relevant.'],
        ['Bossuet is biased.', false, '“Biased” alone explains nothing. Biased how, why, and what does it do to the argument?']
      ]},
      { type: 'pick', source: 'perry', prompt: 'John Perry was an English engineer hired by Peter the Great. How does that most affect his account?', options: [
        ['He sees through a Western outsider’s eyes, and calling beards a “foolish Custom” shows that he shares Peter’s view', true, 'Yes. His own words give away his point of view. That makes him a useful source on the reforms, but a poor one on how Russians felt.'],
        ['He is a Russian priest, so he opposes the beard tax on religious grounds', false, 'Check the source line: he’s English, and he isn’t a priest.'],
        ['He wrote it for Peter’s eyes only, so he is forced to praise the tsar', false, 'It was published as a book in 1716 for English readers.']
      ]},
      { type: 'match', prompt: 'Match each source to the question it most raises.', pairs: [
        ['Abu’l Fazl praising Akbar', 'Point of view: he’s Akbar’s own minister'],
        ['A private letter from Busbecq', 'Audience: a friend, so he can be candid'],
        ['Rigaud’s portrait of Louis XIV', 'Purpose: to display royal majesty'],
        ['The Sacred Edict of 1670', 'Historical situation: a new Manchu dynasty']
      ], why: 'You don’t need all four for every document. Pick the one you can explain best.' }
    ]
  },
  {
    id: 'apw-w-reasoning', unit: 'u3', track: 'write', title: 'Structure and the complexity point', blurb: 'LEQ: 2 points. DBQ: 1 point',
    steps: [
      { type: 'teach', title: 'Frame your argument', body: 'The LEQ’s reasoning point asks you to structure your essay using a historical reasoning process:\n\n**Comparison:** similarities **and** differences.\n**Causation:** why did this happen, and what resulted?\n**Continuity and change:** what changed, and what stayed the same?\n\nLet the prompt’s verb tell you which to use.' },
      { type: 'sort', prompt: 'Which reasoning does this prompt call for?', buckets: ['Comparison', 'Causation'], items: [
        ['Compare the methods of two empires', 0, 'Yes. It says so right there.'],
        ['Evaluate the extent to which gunpowder led to expansion', 1, 'Yes. It’s asking about a cause and its importance.'],
        ['Explain similarities in how Louis XIV and Akbar used art', 0, 'Yes. Similarities mean comparison.'],
        ['Explain what brought about the Protestant Reformation', 1, 'Yes. “Brought about” is asking for causes.']
      ]},
      { type: 'teach', title: 'The hardest point on the rubric', body: 'The complexity point isn’t earned with a single fancy sentence. It has to be **part of your argument**. Some of the ways the rubric lists:\n\n**Explain multiple causes, or multiple similarities or differences.**\n**Explain both** similarity and difference, or cause and effect.\n**Connect** to other periods or regions in a way that serves your argument.\n**DBQ:** use all seven documents, or source at least four.\n\nDon’t chase this first. It’s one point, and the others are more reachable.' },
      { type: 'pick', prompt: 'Which is the best attempt at complexity for an essay on Mughal rule?', options: [
        ['Akbar’s tolerance and Aurangzeb’s orthodoxy differed sharply, yet both served one aim: securing loyal support, which suggests religion was as much a political tool as a belief.', true, 'Yes. It explains both difference and similarity, and draws a larger insight.'],
        ['There are many perspectives on this complicated topic that historians still debate today.', false, 'This only says complexity exists. It doesn’t show any.'],
        ['In conclusion, the Mughal Empire was important to world history.', false, 'This is a generic ending, and it adds nothing to the argument.']
      ]}
    ]
  },
  {
    id: 'apw-w-dbq', unit: 'u3', track: 'write', title: 'A plan for the DBQ', blurb: 'DBQ: 25% of your score',
    steps: [
      { type: 'teach', title: 'Seven points, one hour', body: 'The DBQ has **7 points**: thesis (1), context (1), using documents (2), evidence beyond them (1), sourcing (1) and complexity (1).\n\nYou get 60 minutes including a 15-minute reading period. Use the reading time well: group the documents, mark which ones you’ll source, and plan your thesis **before** writing anything.' },
      { type: 'order', prompt: 'Put these steps in the best order.', items: ['Read the prompt and recall what you know', 'Read the documents, noting each one’s point', 'Group the documents by argument', 'Choose documents to source and outside evidence to add', 'Write your context and thesis', 'Write body paragraphs by group'], why: 'Grouping first is what stops a DBQ from being a list of summaries: Doc 1 says this, Doc 2 says that.' },
      { type: 'pick', prompt: 'What does the higher evidence point require?', options: [
        ['Using at least four documents to support an argument', true, 'Yes. Describing three documents earns one point. Using four to support an argument earns both.'],
        ['Quoting all seven documents at length', false, 'The rubric says to describe rather than simply quote. Using seven can help with complexity, but isn’t required for this point.'],
        ['Listing the author of every document', false, 'Naming authors alone doesn’t address the content of the documents.']
      ]},
      { type: 'sort', prompt: 'Prompt: **Was religion the most important way rulers legitimized power?** Sort these documents into argument groups.', buckets: ['Religion mattered', 'Other tools mattered'], items: [
        ['Bossuet: the king’s person is sacred', 0, 'Yes. It’s direct support for religion.'],
        ['Abu’l Fazl: royalty is a light from God', 0, 'Yes. It’s divine legitimacy, Mughal style.'],
        ['Busbecq: Ottoman men rise by merit', 1, 'Yes. It points to a loyal administrative elite.'],
        ['Codex Mendoza: goods owed as tribute', 1, 'Yes. It points to wealth drawn from subject peoples.'],
        ['Perry: Peter taxes beards despite religious protest', 1, 'Yes. It shows state power overriding religious custom.']
      ], why: 'Those are your body paragraphs. Now try it for real: the full DBQ is waiting below these skills.' }
    ]
  }
];
