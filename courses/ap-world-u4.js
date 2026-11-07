/* AP World History: Modern, Unit 4: Transoceanic Interconnections. Original practice content written
   to College Board's course framework (effective fall 2026). Same formats as ap-world.js; each
   unit lives in its own file and adds itself to the course. Ids are permanent. */
(function(){
  const course = window.STUDY_COURSES.find(c => c.id === 'ap-world');
  course.units.find(u => u.id === 'u4').objectives = [
    '4.1 Technological innovations', '4.2 Exploration: causes and events', '4.3 Columbian Exchange', '4.4 Maritime empires established',
    '4.5 Maritime empires maintained', '4.6 Challenges to state power', '4.7 Changing social hierarchies', '4.8 Continuity and change'
  ];

  /* ---------- images: checked by eye, licenses from Wikimedia Commons. Later works say so. ---------- */
  Object.assign(course.images, {
    caravel: { alt: 'A caravel with triangular lateen sails, from a Portuguese altarpiece', credit: 'Detail of the Santa Auta altarpiece, c. 1520. Public domain', page: 'https://commons.wikimedia.org/wiki/File:Caravela_latina_from_the_Santa_Auta_altarpiece.jpg' },
    astrolabe: { alt: 'A corroded round bronze instrument with a hole at its center and a royal crest', credit: 'Recovered from a Portuguese wreck, made before 1503. Public domain', page: 'https://commons.wikimedia.org/wiki/File:Sodre_Astrolabe_1503.jpg' },
    cantino: { alt: 'A hand-painted world map showing Africa, Brazil and the Caribbean crossed by compass lines', credit: 'Portuguese world map, 1502. Public domain', page: 'https://commons.wikimedia.org/wiki/File:Cantino_planisphere_1502.jpg' },
    fluyt: { alt: 'An engraving of a broad-bellied three-masted Dutch cargo ship', credit: 'Dutch engraving, 1642. CC0, Rijksmuseum', page: 'https://commons.wikimedia.org/wiki/File:Een_fluitschip,_1642,_RP-P-1926-217.jpg' },
    henry: { alt: 'A man with a thin mustache and a very large black hat', credit: 'Nuno Gonçalves, 1400s, traditionally identified. Public domain', page: 'https://commons.wikimedia.org/wiki/File:Henry_the_Navigator1.jpg' },
    dagama: { alt: 'An older man with a long white beard and a black cap', credit: 'Gregório Lopes, c. 1524. Public domain', page: 'https://commons.wikimedia.org/wiki/File:Greg%C3%B3rio_Lopes_-_Vasco_da_Gama_(ca_1524).jpg' },
    columbus: { alt: 'A man in a dark robe and black hat with one hand on his chest', credit: 'Sebastiano del Piombo, before 1519, sitter traditionally identified. Public domain', page: 'https://commons.wikimedia.org/wiki/File:Portrait_of_a_Man,_Said_to_be_Christopher_Columbus.jpg' },
    magellan: { alt: 'A dark-bearded man in a black hat with a Latin inscription above him', credit: 'Unknown painter, c. 1550 to 1625, after his death. Public domain', page: 'https://commons.wikimedia.org/wiki/File:Ferdinand_Magellan.jpg' },
    isabella: { alt: 'A crowned queen with long fair hair reading a book', credit: 'Spanish painting of the queen. CC0, New World Encyclopedia', page: 'https://commons.wikimedia.org/wiki/File:Queen_Isabella_I_of_Castile.jpg' },
    smallpox: { alt: 'Black and white drawings of people with spots lying sick while others tend to them', credit: 'Florentine Codex, Book 12, c. 1585. Public domain', page: 'https://commons.wikimedia.org/wiki/File:FlorentineCodex_BK12_F54_smallpox.jpg' },
    malinche: { alt: 'Drawing of a Spanish commander and a Native woman standing beside him as Indigenous leaders approach', credit: 'Lienzo de Tlaxcala, 1500s, later copy. Public domain', page: 'https://commons.wikimedia.org/wiki/File:Malinche_Tlaxcala_cropped.jpg' },
    potosi: { alt: 'A woodcut of a huge cone-shaped mountain above a town, with paths and workers on its slopes', credit: 'Pedro Cieza de León, Crónica del Perú, 1553. Public domain', page: 'https://commons.wikimedia.org/wiki/File:Capitulo-CIX.jpg' },
    pizarro: { alt: 'Drawing of an Inca ruler carried on a litter and surrounded, facing Spanish soldiers', credit: 'Felipe Guaman Poma de Ayala, early 1600s. Public domain', page: 'https://commons.wikimedia.org/wiki/File:Atawallpa_Pizarro_tinkuy.jpg' },
    real: { alt: 'Both sides of a rough-edged silver coin stamped with a shield and a cross', credit: 'Spanish colonial coin struck under Philip II, 1556 to 1598. CC BY-SA 2.5', page: 'https://commons.wikimedia.org/wiki/File:SPANISH_COLONIAL._Philip_II._1556-1598._AR_Cob_8_Reales_(38mm,_26.70_gm)._Potos%C3%AD_mint.jpg' },
    manila: { alt: 'A painted galleon surrounded by small outrigger canoes', credit: 'Boxer Codex, c. 1590. Public domain', page: 'https://commons.wikimedia.org/wiki/File:Reception_of_the_Manila_Galleon_by_the_Chamorro_in_the_Ladrones_Islands,_ca._1590.jpg' },
    elmina: { alt: 'A large white fortress on the African coast with palm trees and the sea behind it', credit: 'Photo: Damien Halleux Radermecker. CC BY-SA 2.0', page: 'https://commons.wikimedia.org/wiki/File:Elmina_Castle_-_Ghana.jpg' },
    brookes: { alt: 'A printed diagram showing hundreds of human figures packed in rows in the decks of a ship', credit: 'British abolitionist print, 1787. Public domain', page: 'https://commons.wikimedia.org/wiki/File:Brookes_slave_ship,_British_Library.jpg' },
    sugar: { alt: 'Enslaved workers cutting cane in a field while an overseer on horseback watches', credit: 'William Clark, 1823, later than this unit. CC0', page: 'https://commons.wikimedia.org/wiki/File:Slaves_cutting_the_sugar_cane_-_Ten_Views_in_the_Island_of_Antigua_(1823),_plate_IV_-_BL.jpg' },
    casta: { alt: 'A Spanish man, an African woman and their child, painted as a labeled family group', credit: 'Miguel Cabrera, c. 1763. Public domain', page: 'https://commons.wikimedia.org/wiki/File:De_espa%C3%B1ol_y_negra,_mulata.jpg' },
    guadalupe: { alt: 'A brown-skinned Virgin Mary in a blue star-covered cloak surrounded by golden rays', credit: 'Image held at the Basilica in Mexico City, 1500s. Public domain', page: 'https://commons.wikimedia.org/wiki/File:1531_Nuestra_Se%C3%B1ora_de_Guadalupe_anagoria.jpg' },
    nzinga: { alt: 'A lithograph of a woman with a jeweled headdress and a draped robe', credit: 'French lithograph, 1800s, long after her reign, cropped. Public domain', page: 'https://commons.wikimedia.org/wiki/File:Ann_Zingha,_queen_of_Matamba.jpg' },
    surat: { alt: 'A busy harbor with European ships in front of a large walled Indian port city', credit: 'Dutch print, c. 1753. Public domain', page: 'https://commons.wikimedia.org/wiki/File:AMH-8002-KB_View_of_Surat.jpg' },
    dejima: { alt: 'A harbor view of a bay ringed by green hills with a town along the shore', credit: 'Kawahara Keiga, 1823, later than this unit. Public domain', page: 'https://commons.wikimedia.org/wiki/File:Bay_of_Nagasaki_with_frigates_-_KONB11-360-7887.jpg' },
    nanban: { alt: 'Japanese painted screen of Portuguese men in baggy trousers under a parasol', credit: 'Japanese folding screen, c. 1600 to 1625. Public domain', page: 'https://commons.wikimedia.org/wiki/File:Rijksmuseum_Namban_folding_screens_001_detail_01.jpg' },
    shivaji: { alt: 'A portrait of a bearded Indian warrior in a white robe holding a sword', credit: 'Indian painting, 1680s. Public domain', page: 'https://commons.wikimedia.org/wiki/File:Shivaji_British_Museum.jpg' },
    metacom: { alt: 'An engraving of a Native American leader standing with a musket and wrapped in a robe', credit: 'Paul Revere, 1772, a century after his death. Public domain', page: 'https://commons.wikimedia.org/wiki/File:Philip_King_of_Mount_Hope_by_Paul_Revere_(cropped).jpeg' },
    maroon: { alt: 'An engraving of a shirtless man running with a long gun', credit: 'Engraving, 1796, cropped. Public domain', page: 'https://commons.wikimedia.org/wiki/File:Leonard_Parkinson,_Maroon_Leader,_Jamaica,_1796.jpg' },
    asante: { alt: 'Photograph of a stool on its own throne chair, surrounded by people', credit: 'Photograph, 1935. Public domain', page: 'https://commons.wikimedia.org/wiki/File:Golden_stool_31_January_1935.jpg' },
    kongo: { alt: 'A colored print of an African ruler in striped robes holding a staff', credit: 'French costume print, 1790s, cropped. CC BY-SA 4.0', page: 'https://commons.wikimedia.org/wiki/File:Manikongo.jpg' },
    jews: { alt: 'Painting of an elderly man pleading before a king and queen on a throne', credit: 'Emilio Sala, 1889, long after the event. Public domain', page: 'https://commons.wikimedia.org/wiki/File:Expulsi%C3%B3n_de_los_jud%C3%ADos.jpg' },
    fronde: { alt: 'Cavalry fighting outside the high walls of a fortress in France', credit: 'Unknown painter, 1600s. Public domain', page: 'https://commons.wikimedia.org/wiki/File:Episode_of_the_Fronde_at_the_Faubourg_Saint-Antoine_by_the_Walls_of_the_Bastille.png' },
    razin: { alt: 'A leader sitting in the middle of a long boat full of Cossacks on a wide river', credit: 'Vasily Surikov, 1906, long after the event. Public domain', page: 'https://commons.wikimedia.org/wiki/File:Stenka_Razin_by_Vasily_Surikov_1906.jpg' },
    pueblo: { alt: 'A colorful mural of Pueblo people dancing and fighting', credit: 'Loren Mozley, mural, 1936, long after the event. Public domain', page: 'https://commons.wikimedia.org/wiki/File:Loren_Mozley_Pueblo_Revolt_1680_installed_1936_ABQ_NM.jpg' },
    porcelain: { alt: 'A blue and white Chinese porcelain dish with paneled decoration', credit: 'Jingdezhen, Wanli period, Ming China. CC0', page: 'https://commons.wikimedia.org/wiki/File:Porcelain_dish_from_Jingdezhen,_Wanli_period,_HMA.JPG' },
    sipahi: { alt: 'An Ottoman horseman’s armor and weapons in a colorful costume painting', credit: 'Ottoman costume painting, before 1657. Public domain', page: 'https://commons.wikimedia.org/wiki/File:Ralamb_Sipahi.jpg' },
    boyars: { alt: 'A seated tsar’s empty chair and rows of nobles in long robes in a painted hall', credit: 'Andrei Ryabushkin, 1907, long after the period. Public domain', page: 'https://commons.wikimedia.org/wiki/File:Tsar_boyar_duma_by_Andrei_Ryabushkinv,_galerie_Tretiakov.jpg' }
  });

  /* ---------- sources: quoted word for word from the public-domain texts named ---------- */
  Object.assign(course.sources, {
    columbus: {
      kind: 'primary',
      text: 'They all go completely naked, even the women. . . . Weapons they have none, nor are acquainted with them, for I showed them swords which they grasped by the blades, and cut themselves through ignorance. . . . It appears to me, that the people are ingenious, and would be good servants and I am of opinion that they would very readily become Christians, as they appear to have no religion.',
      cite: 'Christopher Columbus, journal of his first voyage, written for the Spanish monarchs, October 1492 (from Olson and Bourne, The Northmen, Columbus, and Cabot, 1906)'
    },
    lascasas: {
      kind: 'primary',
      text: 'The Spaniards first assaulted the innocent Sheep, so qualified by the Almighty, as is premention’d, like most cruel Tygers, Wolves and Lions hunger-starv’d, studying nothing, for the space of Forty Years, after their first landing, but the Massacre of these Wretches, whom they have so inhumanely and barbarously butcher’d and harass’d with several kinds of Torments, never before known, or heard . . . that of Three Millions of Persons, which lived in Hispaniola itself, there is at present but the inconsiderable remnant of scarce Three Hundred.',
      cite: 'Bartolomé de las Casas, Spanish priest and former encomienda holder, A Brief Account of the Destruction of the Indies, written for the Spanish crown, 1552 (English translation, 1689)'
    },
    equiano: {
      kind: 'primary',
      text: 'The closeness of the place, and the heat of the climate, added to the number in the ship, which was so crowded that each had scarcely room to turn himself, almost suffocated us. This produced copious perspirations, so that the air soon became unfit for respiration, from a variety of loathsome smells, and brought on a sickness among the slaves, of which many died, thus falling victims to the improvident avarice, as I may call it, of their purchasers.',
      cite: 'Olaudah Equiano, formerly enslaved African and British abolitionist, describing his crossing in the 1750s, The Interesting Narrative, 1789'
    },
    'smith-discovery': {
      kind: 'primary',
      text: 'The discovery of America, and that of a passage to the East Indies by the Cape of Good Hope, are the two greatest and most important events recorded in the history of mankind. . . . By uniting in some measure the most distant parts of the world, by enabling them to relieve one another’s wants, to increase one another’s enjoyments, and to encourage one another’s industry, their general tendency would seem to be beneficial. To the natives, however, both of the East and West Indies, all the commercial benefits which can have resulted from those events have been sunk and lost in the dreadful misfortunes which they have occasioned.',
      cite: 'Adam Smith, Scottish economist and critic of mercantilism, The Wealth of Nations, 1776'
    },
    'smith-mercantile': {
      kind: 'primary',
      text: 'The encouragement of exportation, and the discouragement of importation, are the two great engines by which the mercantile system proposes to enrich every country.',
      cite: 'Adam Smith, Scottish economist and critic of mercantilism, The Wealth of Nations, 1776'
    },
    silver: {
      kind: 'secondary',
      text: 'For a long time, historians described the early modern economy as a story of Europe’s rise. The silver trail suggests something else. Most of the silver mined at Potosí and in Mexico left Europe’s hands, because Europeans had little else that Asian sellers wanted. Much of it ended up in China, where the Ming state collected its taxes in silver and where the metal was worth more than it was elsewhere. Spanish ships carried it, but Chinese demand set the direction of the flow.',
      cite: 'Written for this app in the style of a historian’s argument. Not a real publication.'
    },
    exchange: {
      kind: 'secondary',
      text: 'The exchange of living things after 1492 was never a fair trade. The Americas received smallpox and measles, which killed a large share of their people. Afro-Eurasia received maize, potatoes and cassava, which fed growing populations for centuries. Yet those two results were linked: as Indigenous populations collapsed, colonists turned to forced African labor, and the crops that left the Americas helped feed the societies that were part of that traffic.',
      cite: 'Written for this app in the style of a historian’s argument. Not a real publication.'
    },
    'img-poma': { kind: 'image', img: 'pizarro', cite: 'The capture of the Inca ruler Atahualpa at Cajamarca in 1532, drawn by Felipe Guaman Poma de Ayala, an Indigenous Andean writer, for a letter to the Spanish king, early 1600s.' },
    'img-potosi': { kind: 'image', img: 'potosi', cite: 'The silver mountain at Potosí in Spanish Peru, from a chronicle by the Spanish soldier Pedro Cieza de León, 1553.' },
    'img-surat': { kind: 'image', img: 'surat', cite: 'The Indian port of Surat, a center of Gujarati commerce, from a Dutch print, about 1753.' },
    'img-casta': { kind: 'image', img: 'casta', cite: 'A casta painting from New Spain by Miguel Cabrera, about 1763. Paintings like this one labeled the children of mixed unions by racial category.' },
    'img-brookes': { kind: 'image', img: 'brookes', cite: 'Diagram of the British slave ship Brookes, printed by British abolitionists in 1787.' },
    'img-guadalupe': { kind: 'image', img: 'guadalupe', cite: 'The Virgin of Guadalupe, venerated in Mexico from the 1500s. She is said to have appeared to an Indigenous man near an older Mexica shrine.' },
    'img-cantino': { kind: 'image', img: 'cantino', cite: 'The Cantino map, a Portuguese world chart from 1502, smuggled out of Lisbon for an Italian duke.' },
    'img-smallpox': { kind: 'image', img: 'smallpox', cite: 'Mexica victims of smallpox, drawn by Indigenous artists for the Florentine Codex, about 1585.' }
  });

  /* ---------- multiple choice ---------- */
  course.questions.push(
    /* 4.1 technology */
    ['u4-01',1,'The lateen sail and the magnetic compass are best used as evidence that European navigation',['drew on knowledge from Asian and Islamic societies','developed in isolation from the rest of Afro-Eurasia','was copied directly from Indigenous American sailors','became possible only after the Industrial Revolution'],'The compass came from China and the lateen sail spread through the Indian Ocean and Mediterranean. Cross-cultural exchange is the course’s main point in this topic.'],
    ['u4-02',1,'What was the main advantage of the caravel for Portuguese voyages along Africa?',['It was small and could sail well against the wind','It carried more cargo than any other ship of its age','It needed no crew members who could navigate','It was powered by rowers when winds failed'],'Caravels were light and used lateen sails to work upwind, which helped on coasts and on the return trip north. Bigger carracks carried more cargo.'],
    ['u4-03',1,'The Dutch fluyt is best explained as a response to which goal?',['Carrying bulk cargo cheaply with a small crew','Carrying heavy guns for battles with Ottoman fleets','Moving troops up the rivers of South America','Sailing around the world without a stop for supplies'],'The fluyt was built for profit: a large hold and a small crew lowered costs, which helped the Dutch dominate shipping.'],
    ['u4-04',1,'An improved understanding of wind and current patterns most directly made possible',['reliable round trips across open ocean','the end of overland trade in Central Asia','the invention of the printing press in Europe','the first contact between Europe and China'],'Sailors could plan routes out and back using trade winds and currents. Silk Road contact with China was centuries older.'],
    ['u4-05',1,'A map like this 1502 chart would have been most valuable to the Portuguese state because it',['recorded routes and coasts that gave it a trade advantage','proved to Europeans for the first time that the earth was round','was published widely so all rivals could use it freely','showed that no trade route to Asia could exist by sea'],'Geographic knowledge meant commercial and military power, so Iberian crowns tried to guard it. Educated Europeans already knew the earth was round.','img-cantino'],

    /* 4.2 exploration */
    ['u4-06',2,'Prince Henry of Portugal is significant mainly because he',['sponsored voyages down the African coast','led the first voyage to reach India by sea','conquered the Aztec Empire for Portugal','founded the Dutch East India Company'],'Henry never sailed the long voyages himself but sponsored them, which is the “state support” the course emphasizes. Da Gama reached India in 1498.'],
    ['u4-07',2,'Vasco da Gama’s voyage of 1498 mattered economically because it',['let Portugal reach Asian markets without overland middlemen','ended Muslim merchants’ activity in the Indian Ocean','opened the first direct trade between Spain and Mexico','brought American silver to Chinese markets for the first time'],'A sea route avoided the Venetian and Ottoman-controlled routes. Muslim merchants kept trading, which is a continuity the exam likes.'],
    ['u4-08',2,'Based on the passage, which motive for exploration did Columbus consider most useful to mention to his sponsors?',['Spreading Christianity and gaining new subjects','Studying local plants for scientific purposes','Finding a peaceful partner for equal trade','Escaping religious persecution back in Spain'],'He tells the monarchs the people would be “good servants” and “become Christians.” His audience shapes what he emphasizes.','columbus'],
    ['u4-09',2,'Columbus’s statement that the people “appear to have no religion” is best understood as evidence of',['his assumptions as a European Christian observer','careful study of Taíno religious beliefs over years','Taíno leaders’ formal conversion to Christianity','Spanish laws forbidding Indigenous worship'],'He’d been there for days and shared no language with them. A sourcing question often asks what a writer could actually know.','columbus'],
    ['u4-10',2,'English, French and Dutch voyages across the North Atlantic were often motivated by',['finding other sailing routes to Asia','escaping the Black Death in European cities','joining Spain’s war against the Aztecs','replacing Portuguese settlers in Brazil'],'Late to the race, northern states looked for a northern passage to Asia, such as the voyages of Cabot and Hudson.'],
    ['u4-11',2,'Which is the strongest contrast with European exploration after 1450?',['Ming China’s end of state-sponsored Zheng He voyages','The Ottoman capture of Constantinople with cannons','The Mughal use of zamindars to collect land revenue','The Protestant attack on the sale of indulgences'],'China had the ships but stopped sponsoring long voyages by the 1430s, while European states were beginning theirs. It’s a useful comparison for an essay.'],

    /* 4.3 Columbian Exchange */
    ['u4-12',3,'The drawing from the Florentine Codex is best used as evidence of which effect of contact?',['Disease devastating Indigenous American populations','Mexica adoption of European medical practices','Spanish efforts to protect Mexica communities','Plague spreading from the Americas to Europe'],'Eastern Hemisphere diseases like smallpox, measles and malaria killed huge numbers because Indigenous peoples had no prior exposure.','img-smallpox'],
    ['u4-13',3,'The transfer of smallpox to the Americas is best described as',['mostly unintentional but catastrophic','a planned policy of every European state','rare until after the year 1750','limited to the Caribbean islands'],'The course wording is “unintentional transfer of disease vectors,” with “catastrophic” effects across many areas.'],
    ['u4-14',3,'Which pairing correctly shows a crop and a region that adopted it as a staple?',['Potatoes in Europe','Wheat in the pre-contact Andes','Maize in pre-contact Spain','Sugar in pre-contact Mexico'],'American potatoes fed Europe’s growing population. The other three crops weren’t in those places before contact.'],
    ['u4-15',3,'Which was brought to the Americas by enslaved Africans?',['Okra and rice','Maize and cassava','Potatoes and tomatoes','Cacao and tobacco'],'The course names okra and rice. The others are American crops that traveled in the opposite direction.'],
    ['u4-16',3,'Horses, pigs and cattle in the Americas had which effect?',['They changed Indigenous diets, land and ways of life','They had little effect because none of them survived','They were used only by Spanish colonial governors','They ended all farming across the American continents'],'Horses transformed Plains societies, while grazing animals reshaped land and competed with Indigenous crops.'],
    ['u4-17',3,'According to the passage, how were disease and forced labor connected?',['Population collapse led colonists to turn to enslaved Africans','Enslaved Africans brought smallpox to Europe for the first time','Forced labor ended once American foods reached Europe','Disease caused Europeans to give up their American colonies'],'The author links the two: “as Indigenous populations collapsed, colonists turned to forced African labor.”','exchange'],
    ['u4-18',3,'Which evidence would best support the author’s claim that American crops “fed growing populations”?',['China’s population growth after adopting sweet potatoes and maize','The founding of the Dutch East India Company in the year 1602','Mexica tribute lists recorded in the Codex Mendoza in the 1540s','The use of lateen sails on Portuguese caravels in the 1400s'],'New crops grew on land unsuited to rice, supporting population growth in Qing China. The other choices don’t address food.','exchange'],

    /* 4.4 maritime empires established */
    ['u4-19',4,'The Portuguese empire in Africa and Asia is best described as',['a network of fortified trading posts','a large land empire ruled from Delhi','a union of Muslim merchant sultanates','a settler colony across most of China'],'From Elmina to Goa to Malacca, Portugal held coastal posts rather than ruling large interiors. The course calls it a “trading-post empire.”'],
    ['u4-20',4,'Ming China and Tokugawa Japan are best compared as states that',['restricted foreign trade to limit its disruptive effects','became colonies of the Portuguese trading empire','banned all contact with the outside world forever','encouraged Christian missions to expand freely'],'Both limited contact, as with the Dutch confined to Dejima, but neither cut off all trade.'],
    ['u4-21',4,'The growth of the Asante and the Kingdom of the Kongo shows that',['African states could gain influence through maritime trade','European powers had conquered West Africa by 1500','African states avoided Atlantic trading networks','trans-Saharan trade had fully ended by the year 1450'],'The course’s point is African agency: participation in trade increased these states’ influence, even as the slave trade did great harm.'],
    ['u4-22',4,'Indian Ocean trade after the Portuguese arrived is best described by which statement?',['Asian merchants kept thriving despite some disruption','Europeans quickly replaced all Asian merchants','Trade ended as ships moved to the Atlantic','Only Chinese ships were allowed to sail there'],'Gujaratis, Omanis, Swahili Arabs and Javanese kept trading. This is one of the unit’s most tested continuities.'],
    ['u4-23',4,'The Spanish use of the mit’a at mines like Potosí is an example of',['adapting an existing labor system for colonial purposes','a new labor system invented in Spain and imposed','chattel slavery of people taken from West Africa','a wage system that Andean workers freely joined'],'The mit’a was Inca rotational labor that Spain redirected to silver mining, often with deadly results. The course calls it an existing system.'],
    ['u4-24',4,'Which is the key difference between chattel slavery and the encomienda system?',['Chattel slaves were legally property, inherited by owners','Encomienda workers were all brought over from Africa','Chattel slavery existed only in the Ottoman Empire','Encomienda holders were not allowed to demand labor'],'Encomienda gave Spanish settlers rights to Indigenous labor and tribute. Chattel slavery made people and their children permanent property.'],
    ['u4-25',4,'Which best describes a change in slavery from 1450 to 1750?',['Plantations in the Americas greatly increased demand','African slavery of all kinds ended by 1750','Slavery first appeared anywhere in this period','Ottoman rulers abolished slavery in their lands'],'Slavery in Africa continued in its older forms, but plantation demand transformed its scale.'],

    /* 4.5 maritime empires maintained */
    ['u4-26',5,'According to Adam Smith, what were the two main tools of the mercantile system?',['Limiting imports and encouraging exports','Free trade and low taxes on all goods','Abolishing colonies and ending monopolies','Lending silver to rival states at low interest'],'He names “the encouragement of exportation, and the discouragement of importation.” The goal was to keep wealth from flowing out.','smith-mercantile'],
    ['u4-27',5,'A historian using Smith’s description should note that he',['opposed mercantilism and wrote to argue against it','was a Spanish official who designed the policy','wrote before mercantilism began in Europe','benefited from a monopoly he was defending'],'Smith is a critic writing in 1776, which is useful and also a reason to read him carefully. Sourcing is often about purpose.','smith-mercantile'],
    ['u4-28',5,'Joint-stock companies such as the Dutch VOC helped European expansion mainly by',['spreading risk among many investors','banning private investment in overseas trade','ending wars between rival European states','placing every ship under direct royal command'],'Selling shares let investors share the cost of risky voyages. States also gave these companies monopolies and even military powers.'],
    ['u4-29',5,'According to the passage, why did so much American silver reach China?',['Chinese demand and tax policy pulled it there','Spain conquered China and took its tribute','Silver was worthless in Europe and Mexico','Portugal banned the use of silver in India'],'The author says the Ming collected taxes in silver and valued it highly, so “Chinese demand set the direction of the flow.”','silver'],
    ['u4-30',5,'The author of the passage is most directly challenging which view?',['That this period’s economy is mainly a story of Europe’s rise','That Spain’s colonies in the Americas produced silver','That the Ming state collected some of its taxes in silver','That Spanish ships carried silver across the Pacific'],'The opening sets up the old view, and the rest argues against it. The other three are facts the author accepts.','silver'],
    ['u4-31',5,'The Manila Galleons are significant because they',['linked the Americas to Asia across the Pacific','carried Chinese troops into the Spanish colonies','ended Spain’s silver mining in the Americas','brought the first enslaved Africans to Brazil'],'They carried American silver to Manila for Chinese silks and porcelain, a direct global link.'],
    ['u4-32',5,'The image of the Virgin of Guadalupe is best used as evidence of',['syncretism, as Catholic and Indigenous traditions blended','the rejection of Christianity across New Spain','Protestant expansion into the Spanish Americas','the removal of all Indigenous people from Mexico'],'A dark-skinned Virgin linked to an older sacred site is a classic blend of beliefs. Vodun and Santería are others.','img-guadalupe'],
    ['u4-33',5,'Which is a documented demographic effect of the Atlantic slave trade in parts of West and Central Africa?',['Populations with more women than men','The disappearance of all farming there','Populations with far more men than women','A sudden rise in European settlers inland'],'Traders took more men, which left a gender imbalance that changed families and labor. The course lists this under gender and family restructuring.'],
    ['u4-34',5,'Increased demand for consumer goods affected peasants and artisans in which way?',['Labor intensified in textiles like Indian cotton and Chinese silk','Machines replaced nearly all hand labor by the year 1600','Peasant farming disappeared across all of Afro-Eurasia','Artisans stopped selling goods outside their villages'],'This is before industrialization, so it’s more human labor, not machines. Unit 5 and 6 are when factories arrive.'],

    /* 4.6 challenges */
    ['u4-35',6,'The Pueblo Revolt of 1680 is best understood as resistance to',['Spanish rule and pressure on Indigenous religion','Portuguese control of the Indian Ocean trade','Mughal taxes on non-Muslim subjects','Tokugawa limits on foreign merchants'],'Led by Popé, the Pueblo drove the Spanish out of New Mexico for over a decade, partly in defense of their religion.'],
    ['u4-36',6,'Ana Nzinga is significant because she',['resisted the Portuguese in Southwest Africa','ruled a Spanish colony in the Philippines','founded Sikhism in the Punjab region','directed the Dutch East India Company'],'As ruler of Ndongo and Matamba, she used diplomacy and war against Portuguese expansion in Angola.'],
    ['u4-37',6,'Maroon societies in the Caribbean and Brazil are examples of',['enslaved people resisting by forming free communities','European colonists rebelling against their monarchs','Indigenous leaders who converted to Protestantism','African rulers who sold captives to the Portuguese'],'People who escaped slavery built their own settlements, such as Palmares in Brazil.'],
    ['u4-38',6,'The Fronde in France and Cossack revolts in Russia are similar in that both',['were reactions to the growing power of central monarchs','were caused by Spanish attacks on overseas colonies','were led by enslaved people from the Atlantic world','resulted in a permanent end to monarchy in those states'],'Both show state centralization creating resistance at home. Both monarchies survived and grew stronger.'],
    ['u4-39',6,'The conflict between Shivaji’s Marathas and the Mughals most directly shows',['regional resistance to a powerful land empire','Portuguese support for Mughal religious policy','Mughal expansion into the Safavid heartland','the decline of Indian textile production'],'A Hindu-led Maratha state fought Mughal expansion, especially under Aurangzeb, weakening the empire.'],
    ['u4-40',6,'Las Casas’s purpose in this passage is most likely to',['persuade Spanish authorities to stop abuses against Indigenous people','encourage more settlers to go to Hispaniola for gold','defend the encomienda holders against royal critics','record scientific data about the population of Cuba'],'He’s writing to the crown to demand reform, which helps explain the moral language and may affect his numbers.','lascasas'],

    /* 4.7 social hierarchies */
    ['u4-41',7,'The casta paintings of New Spain are best used as evidence that colonial society',['ranked people by ancestry and race','treated all colonial subjects as legal equals','forbade all marriage across ethnic lines','was led by Indigenous and African elites'],'Paintings like this labeled mixed ancestry in a hierarchy with Spanish-born people on top.','img-casta'],
    ['u4-42',7,'Which contrast is the course’s example of different treatment of the same group?',['Spain expelled Jews, while the Ottoman Empire accepted them','Spain accepted Jews, while the Ottoman Empire expelled them','Both Spain and the Ottomans gave Jews full political equality','Both Spain and the Ottomans banned all Jews from their lands'],'After 1492, many Jews expelled from Spain settled in Ottoman lands. Comparisons like this are great essay evidence.'],
    ['u4-43',7,'Qing policies such as requiring Han men to wear the queue hairstyle are best understood as',['Manchu rulers asserting authority over a Han majority','a Han Chinese effort to overthrow the Qing rulers','evidence that the Qing adopted Han clothing entirely','a European influence on Chinese court fashion'],'The queue marked submission to the new dynasty, one of the “restrictive policies” the course names.'],
    ['u4-44',7,'How did Ottoman timars, Russian boyars and European nobles experience this period?',['Their power rose and fell as monarchs grew stronger','They all gained complete independence from their rulers','They disappeared from all three societies by 1500','They were all replaced by merchants from overseas'],'The course says elites’ power “fluctuated” as rulers centralized, as when Peter the Great and Ivan IV pressured the boyars.'],

    /* 4.8 continuity and change */
    ['u4-45',8,'Which statement best shows both change and continuity in trade from 1450 to 1750?',['New oceanic routes grew while older Asian networks continued','Oceanic trade replaced every older trade network by 1500','Trade routes stayed the same as they had been in 1200','Global trade stopped because of constant warfare at sea'],'A strong answer holds both ideas: the Atlantic and Pacific links were new, while regional markets kept flourishing.'],
    ['u4-46',8,'Which best explains how an economic development changed social structure?',['Plantation profits drove a racial hierarchy of forced labor','Ships with lateen sails were faster on upwind routes','Spanish silver coins were struck at the Potosí mint','Chinese porcelain was decorated in blue and white'],'The question asks for economy causing social change. The other three are true facts with no social effect stated.'],
    ['u4-47',8,'Adam Smith’s statement that benefits to “the natives” were “sunk and lost” is best used to',['complicate a claim that global trade helped everyone','prove that trade between Europe and Asia never grew','show that Smith supported the mercantile system','demonstrate that Indigenous people ran global trade'],'He sees “general” benefits but says colonized people suffered, so his view has both sides. Using a source like this helps with complexity.','smith-discovery'],
    ['u4-48',8,'The Brookes diagram was most likely printed in order to',['build public opposition to the slave trade','advertise a shipping company to new investors','teach ship captains how to build faster vessels','show how well the enslaved were cared for at sea'],'British abolitionists printed it because the image itself makes the argument. Its purpose shapes what it shows.','img-brookes']
  );

  /* ---------- rulers, explorers and evidence ---------- */
  course.cards.push(
    { id: 'henry', unit: 'u4', kind: 'ruler', img: 'henry', clue: 'A Portuguese prince who rarely sailed far himself, but sent ships down Africa’s coast.', name: 'Prince Henry the Navigator', when: 'Portugal, 1394–1460', fact: 'Sponsored expeditions along West Africa, supporting better ships and navigation.', use: 'Prince Henry’s sponsorship of voyages along West Africa shows that state support, not just individual daring, drove Portuguese maritime expansion.' },
    { id: 'isabella', unit: 'u4', kind: 'ruler', img: 'isabella', clue: 'She sponsored a voyage west in the same year her kingdom finished conquering Granada.', name: 'Isabella I of Castile', when: 'Spain, r. 1474–1504', fact: 'With Ferdinand, she funded Columbus and expelled Spain’s Jews in 1492.', use: 'Isabella’s funding of Columbus in 1492 shows how religious and political ambitions combined with the search for wealth to drive Spanish expansion.' },
    { id: 'columbus', unit: 'u4', kind: 'ruler', img: 'columbus', clue: 'Sailing for Spain, he was trying to reach Asia when he reached the Caribbean.', name: 'Christopher Columbus', when: 'Sailed for Spain, 1492', fact: 'His voyages opened lasting contact between the hemispheres, and the Columbian Exchange that followed.', use: 'Columbus’s voyages under Spanish sponsorship began lasting contact between the hemispheres and dramatically increased European interest in transoceanic trade.' },
    { id: 'dagama', unit: 'u4', kind: 'ruler', img: 'dagama', clue: 'He rounded Africa and reached India by sea in 1498.', name: 'Vasco da Gama', when: 'Portugal, c. 1460–1524', fact: 'Opened the direct sea route that let Portugal bypass overland middlemen.', use: 'Vasco da Gama’s voyage to Calicut in 1498 let Portugal reach Asian markets directly, avoiding the middlemen who controlled overland routes.' },
    { id: 'magellan', unit: 'u4', kind: 'ruler', img: 'magellan', clue: 'He died in the Philippines, but his expedition finished the first trip around the world.', name: 'Ferdinand Magellan', when: 'Sailed for Spain, 1519–21', fact: 'His expedition crossed the Pacific, and Juan Sebastián Elcano finished the voyage in 1522.', use: 'Magellan’s expedition crossed the Pacific under Spanish sponsorship, which later made a Spanish link between the Americas and Asia possible.' },
    { id: 'nzinga', unit: 'u4', kind: 'ruler', img: 'nzinga', clue: 'A ruler in Southwest Africa who fought and negotiated with the Portuguese for decades.', name: 'Ana Nzinga', when: 'Ndongo and Matamba, r. 1624–63', fact: 'Used alliances, diplomacy and war to resist Portuguese expansion in Angola.', use: 'Ana Nzinga’s long resistance in Ndongo and Matamba shows that African rulers actively challenged European expansion instead of simply being its victims.' },
    { id: 'shivaji', unit: 'u4', kind: 'ruler', img: 'shivaji', clue: 'He founded a Hindu-led state and fought the Mughals under Aurangzeb.', name: 'Shivaji', when: 'Maratha, r. 1674–80', fact: 'Built Maratha power in western India, using forts and mobile warfare.', use: 'Shivaji’s Marathas challenged Mughal authority, showing how state expansion under Aurangzeb produced resistance from regional powers.' },
    { id: 'metacom', unit: 'u4', kind: 'ruler', img: 'metacom', clue: 'English colonists in New England called this Wampanoag leader King Philip.', name: 'Metacom', when: 'New England, war of 1675–76', fact: 'Led a major Indigenous war against English colonial expansion.', use: 'Metacom’s War shows Indigenous resistance to colonial expansion in North America, and it was one of that region’s deadliest conflicts for its population.' },

    { id: 'caravel', unit: 'u4', kind: 'evidence', img: 'caravel', clue: 'Name this small ship type, and what those triangular sails let it do.', name: 'Caravel', when: 'Portugal, 1400s', fact: 'A light ship whose lateen sails, a technology from the Indian Ocean world, could work against the wind.', use: 'The caravel’s lateen sails show how European sailors adapted technology from other cultures to make long ocean voyages possible.' },
    { id: 'astrolabe', unit: 'u4', kind: 'evidence', img: 'astrolabe', clue: 'What did sailors use this bronze tool to find?', name: 'Mariner’s astrolabe', when: 'Refined in Portugal, 1400s', fact: 'Measured the height of the sun or stars to find latitude. Astrolabes developed in the Greek and Islamic worlds.', use: 'The astrolabe shows how knowledge from the Classical and Islamic worlds spread to Europe and made open-ocean navigation possible.' },
    { id: 'cantino', unit: 'u4', kind: 'evidence', img: 'cantino', clue: 'Why would a state guard a map like this as a secret?', name: 'Cantino world map', when: 'Portuguese, 1502', fact: 'A chart of the new routes, smuggled out of Portugal for an Italian duke.', use: 'The Cantino map, smuggled out of Portugal, shows that geographic knowledge had become a valuable source of commercial and state power.' },
    { id: 'fluyt', unit: 'u4', kind: 'evidence', img: 'fluyt', clue: 'Which country built this ship type, and why was it so profitable?', name: 'Fluyt', when: 'Dutch, from the late 1500s', fact: 'A cargo ship with a big hold and a small crew, which cut the cost of shipping.', use: 'The Dutch fluyt’s large hold and small crew lowered shipping costs, showing how technology helped the Dutch compete in global trade.' },
    { id: 'smallpox', unit: 'u4', kind: 'evidence', img: 'smallpox', clue: 'What disease is this, and what did it do to the Americas?', name: 'Smallpox', when: 'Americas, from the 1500s', fact: 'An Eastern Hemisphere disease that killed huge numbers of Indigenous people who had no prior exposure.', use: 'Smallpox devastated Indigenous populations, weakening resistance to conquest and pushing colonists to look for other sources of labor.' },
    { id: 'malinche', unit: 'u4', kind: 'evidence', img: 'malinche', clue: 'Who is the woman translating beside the Spanish commander, and why did he need her?', name: 'Malinche and Cortés', when: 'Mexico, 1519–21', fact: 'An Indigenous woman who interpreted for Cortés, as Indigenous allies such as the Tlaxcalans fought the Mexica alongside him.', use: 'Malinche and the Tlaxcalans show that the conquest of the Mexica depended on Indigenous interpreters and allies, not just Spanish weapons.' },
    { id: 'pizarro', unit: 'u4', kind: 'evidence', img: 'pizarro', clue: 'Which Inca ruler is being seized here, and who drew this?', name: 'Capture of Atahualpa', when: 'Cajamarca, 1532', fact: 'Pizarro’s forces seized the Inca ruler, during a civil war and epidemic. Guaman Poma, an Andean writer, later drew it.', use: 'Guaman Poma’s drawing of Atahualpa’s capture gives an Indigenous Andean view of the conquest, written to win the Spanish king’s attention to abuses.' },
    { id: 'potosi', unit: 'u4', kind: 'evidence', img: 'potosi', clue: 'What was mined here, and who was forced to work it?', name: 'Potosí and the mit’a', when: 'Spanish Peru, from 1545', fact: 'A silver mountain worked by Indigenous laborers through the mit’a, an Inca system the Spanish redirected.', use: 'At Potosí the Spanish redirected the Inca mit’a to silver mining, showing how colonial economies adapted existing labor systems for new global markets.' },
    { id: 'silver', unit: 'u4', kind: 'evidence', img: 'real', clue: 'Where was this coin’s metal mined, and why did so much of it end up in China?', name: 'Spanish silver', when: 'From the mid-1500s', fact: 'American silver became a global currency, drawn especially by Chinese demand.', use: 'The global flow of Spanish American silver, driven by Chinese demand, linked the Americas, Europe and Asia into one trading system for the first time.' },
    { id: 'manila', unit: 'u4', kind: 'evidence', img: 'manila', clue: 'What route did this ship sail, and what did it carry?', name: 'Manila Galleon', when: 'Spanish, 1565–1815', fact: 'Carried American silver to Manila and returned with Asian goods such as silk and porcelain.', use: 'The Manila Galleons connected Acapulco to Manila, showing how American silver directly purchased Chinese goods across the Pacific.' },
    { id: 'elmina', unit: 'u4', kind: 'evidence', img: 'elmina', clue: 'Who built this fort on the Gold Coast, and what kind of empire does it show?', name: 'Elmina Castle', when: 'Portuguese, 1482', fact: 'A fortified trading post for gold, and later for the trade in enslaved people.', use: 'Elmina Castle shows the Portuguese trading-post empire, which controlled coastal points for trade rather than ruling large inland territories.' },
    { id: 'brookes', unit: 'u4', kind: 'evidence', img: 'brookes', clue: 'What was this diagram showing, and who printed it?', name: 'The Brookes diagram', when: 'Britain, 1787', fact: 'Abolitionists printed it to show the conditions of the Middle Passage.', use: 'The Brookes diagram, printed by British abolitionists, shows both the horrors of the Middle Passage and the purpose of a source meant to shock its audience.' },
    { id: 'sugar', unit: 'u4', kind: 'evidence', img: 'sugar', clue: 'What crop is this, and why did it drive the Atlantic slave trade?', name: 'Sugar plantations', when: 'Atlantic world, from the 1500s', fact: 'Sugar was a labor-intensive cash crop, grown with enslaved labor for European markets.', use: 'The growth of sugar plantations increased demand for enslaved labor, causing major demographic and social change on both sides of the Atlantic.' },
    { id: 'casta', unit: 'u4', kind: 'evidence', img: 'casta', clue: 'Why did New Spain produce paintings that label families by ancestry?', name: 'Casta system', when: 'Spanish America', fact: 'A hierarchy ranking people by ancestry, with Spanish-born people on top.', use: 'Casta paintings show how colonial society created a new racial hierarchy, tying a person’s status and opportunity to their ancestry.' },
    { id: 'guadalupe', unit: 'u4', kind: 'evidence', img: 'guadalupe', clue: 'Why would this image win over Indigenous Mexicans?', name: 'Virgin of Guadalupe', when: 'Mexico, from the 1500s', fact: 'A Catholic image linked to an Indigenous man and an older sacred site. A classic example of syncretism.', use: 'The Virgin of Guadalupe shows religious syncretism, as Christianity spread in Mexico partly by blending with Indigenous traditions.' },
    { id: 'surat', unit: 'u4', kind: 'evidence', img: 'surat', clue: 'Which Indian merchants made this port rich, before and after Europeans came?', name: 'Surat and Gujarati merchants', when: 'India', fact: 'A major Indian Ocean port, where Asian merchants kept trading alongside Europeans.', use: 'The continued wealth of Gujarati merchants at Surat shows that Asian trade networks survived and thrived despite the arrival of Europeans.' },
    { id: 'nanban', unit: 'u4', kind: 'evidence', img: 'nanban', clue: 'Who are these foreigners on a Japanese screen, and how did Japan respond to them?', name: 'Portuguese in Japan', when: 'Japan, from 1543', fact: 'Portuguese traders and missionaries arrived, and the Tokugawa later expelled them.', use: 'Japanese art of Portuguese visitors shows early curiosity about Europeans, before the Tokugawa limited that contact to protect their rule.' },
    { id: 'dejima', unit: 'u4', kind: 'evidence', img: 'dejima', clue: 'In this harbor, a small island was the one place Dutch traders were allowed. Name it.', name: 'Nagasaki and Dejima', when: 'Tokugawa Japan, from 1641', fact: 'The Dutch were confined to Dejima, an artificial island in Nagasaki’s harbor.', use: 'By confining Dutch traders to Dejima, Tokugawa Japan shows how Asian states restricted European trade to limit its disruptive effects.' },
    { id: 'porcelain', unit: 'u4', kind: 'evidence', img: 'porcelain', clue: 'Why did this kind of dish pull so much silver to Asia?', name: 'Chinese export porcelain', when: 'Ming China', fact: 'A prized Chinese good that was bought around the world, largely with American silver.', use: 'Worldwide demand for Chinese porcelain shows that Asia remained a center of global manufacturing, with Europeans paying largely in American silver.' },
    { id: 'asante', unit: 'u4', kind: 'evidence', img: 'asante', clue: 'This sacred object symbolized the unity of which West African state?', name: 'Asante and the Golden Stool', when: 'West Africa, from c. 1700', fact: 'The Asante state grew powerful through trade in gold and enslaved people, and through firearms.', use: 'The rise of the Asante shows that some African states grew in influence through Atlantic trade networks, gaining firearms and wealth.' },
    { id: 'kongo', unit: 'u4', kind: 'evidence', img: 'kongo', clue: 'Which Central African kingdom’s rulers converted to Catholicism and traded with Portugal?', name: 'Kingdom of the Kongo', when: 'Central Africa', fact: 'Its elites converted to Catholicism and traded with Portugal. The slave trade later undermined it.', use: 'The Kingdom of the Kongo gained influence through trade with Portugal, but the slave trade also weakened it, showing the mixed effects of Atlantic trade on African states.' },
    { id: 'maroon', unit: 'u4', kind: 'evidence', img: 'maroon', clue: 'People like this man escaped slavery and built their own communities. What are they called?', name: 'Maroon societies', when: 'Caribbean and Brazil', fact: 'Free communities of people who escaped slavery, such as Palmares in Brazil.', use: 'Maroon societies show that enslaved people challenged colonial authority through organized resistance and by building independent communities.' },
    { id: 'pueblo', unit: 'u4', kind: 'evidence', img: 'pueblo', clue: 'Which uprising drove the Spanish out of New Mexico in 1680?', name: 'Pueblo Revolt', when: 'New Mexico, 1680', fact: 'Led by Popé, the Pueblo expelled the Spanish for about twelve years, partly in defense of their religion.', use: 'The Pueblo Revolt shows local resistance to Spanish rule and religious pressure, briefly reversing colonial expansion in New Mexico.' },
    { id: 'fronde', unit: 'u4', kind: 'evidence', img: 'fronde', clue: 'Why did French nobles and courts rise up against a child king’s government?', name: 'The Fronde', when: 'France, 1648–53', fact: 'Revolts against royal power during the youth of Louis XIV.', use: 'The Fronde shows nobles resisting royal centralization, and its failure helped Louis XIV build the absolute power he later displayed at Versailles.' },
    { id: 'razin', unit: 'u4', kind: 'evidence', img: 'razin', clue: 'Which frontier people rose up against the Russian state along the Volga in the 1670s?', name: 'Cossack revolts', when: 'Russia, 1670–71', fact: 'Stenka Razin led Cossacks and peasants against nobles and tsarist officials.', use: 'Stenka Razin’s revolt shows that Russian centralization and serfdom provoked resistance from frontier Cossacks and peasants.' },
    { id: 'jews', unit: 'u4', kind: 'evidence', img: 'jews', clue: 'What decree is this man pleading against, and where did many of those affected go?', name: 'Expulsion of the Jews', when: 'Spain 1492, Portugal 1497', fact: 'Jews were forced to convert or leave, and many settled in the Ottoman Empire.', use: 'Spain’s expulsion of its Jews and the Ottoman decision to accept them shows how states could either suppress or make use of religious diversity.' },
    { id: 'timar', unit: 'u4', kind: 'evidence', img: 'sipahi', clue: 'An Ottoman cavalryman like this was paid by what kind of land grant?', name: 'Timars', when: 'Ottoman Empire', fact: 'Grants of revenue from land, in exchange for military service.', use: 'The Ottoman timar system tied military elites to the state through land revenue, though their power changed as the empire’s rulers centralized.' },
    { id: 'boyars', unit: 'u4', kind: 'evidence', img: 'boyars', clue: 'Who were these nobles, and which tsars worked to weaken them?', name: 'Russian boyars', when: 'Russia', fact: 'Old landed nobles, whose power Ivan IV and Peter the Great reduced.', use: 'The declining power of the boyars under strong tsars shows how existing elites lost influence as monarchs grew more powerful.' }
  );

  /* ---------- written responses ---------- */
  course.responses.push(
    {
      id: 'u4-saq-secondary', unit: 'u4', type: 'saq', minutes: 13, title: 'Whose silver was it?', sources: ['silver'],
      intro: 'Short-answer question 1 on the real exam uses a secondary source, like this.',
      parts: [
        { id: 'a', label: 'A', prompt: 'Describe ONE reason the author gives for silver flowing to China.', model: 'The Ming state collected its taxes in silver and the metal was worth more in China than elsewhere, so Chinese demand drew silver there.', points: [{ id: 'a', label: 'A: describes a reason from the passage', detail: 'Give the details, not just the word “demand.”', rule: { type: 'terms', part: 'a', min: 1, terms: ['tax*', 'ming', 'demand', 'worth more', 'valu*', 'higher price'] } }] },
        { id: 'b', label: 'B', prompt: 'Describe ONE piece of evidence NOT in the passage that shows how silver connected distant regions.', model: 'The Manila Galleons carried American silver across the Pacific from Acapulco to Manila, where it purchased Chinese silks and porcelain.', points: [{ id: 'b', label: 'B: adds specific evidence from outside the passage', detail: 'It must be real, specific, and not already given in the passage.', rule: { type: 'terms', part: 'b', min: 1, terms: ['manila', 'galleon*', 'acapulco', 'porcelain', 'silk*', 'mit’a', 'mita', 'single whip', 'spice*', 'tea', 'pacific'] } }] },
        { id: 'c', label: 'C', prompt: 'Explain ONE way a European state or company tried to control global trade from 1450 to 1750.', model: 'Under mercantilism, states chartered joint-stock companies such as the Dutch VOC with monopolies, so that wealth from Asian trade would flow to the home country and not to its rivals.', points: [{ id: 'c', label: 'C: explains an attempt to control trade', detail: 'Name the method and explain how or why it worked.', rule: { type: 'terms', part: 'c', min: 1, terms: ['mercantil*', 'joint-stock', 'joint stock', 'voc', 'dutch east india', 'east india company', 'monopol*', 'trading post*', 'elmina', 'goa', 'malacca', 'hormuz', 'tariff*', 'navigation act*'] } }] }
      ]
    },
    {
      id: 'u4-saq-primary', unit: 'u4', type: 'saq', minutes: 13, title: 'A priest accuses', sources: ['lascasas'],
      intro: 'Short-answer question 2 on the real exam uses a primary source, like this.',
      parts: [
        { id: 'a', label: 'A', prompt: 'Describe ONE way Las Casas’s purpose might affect how he presents what happened in Hispaniola.', model: 'Las Casas was writing to persuade the Spanish crown to stop abuses, so his comparison of Spaniards to wolves and sheep and his numbers may be chosen for moral force more than precision.', points: [{ id: 'a', label: 'A: describes how his purpose affects the account', detail: 'Connect his goal to something in how he writes.', rule: { type: 'terms', part: 'a', min: 1, terms: ['persuad*', 'crown', 'king', 'reform', 'purpose', 'priest', 'exaggerat*', 'sheep', 'wolves', 'tygers', 'tigers', 'stop', 'audience', 'moral'] } }] },
        { id: 'b', label: 'B', prompt: 'Explain ONE factor other than violence that contributed to the decline in Indigenous population in the Americas.', model: 'Diseases such as smallpox and measles spread from the Eastern Hemisphere, and because Indigenous people had no prior exposure, epidemics killed very large numbers.', points: [{ id: 'b', label: 'B: explains another cause of population decline', detail: 'Name the factor and say how it caused deaths.', rule: { type: 'terms', part: 'b', min: 1, terms: ['smallpox', 'measles', 'malaria', 'disease*', 'epidemic*', 'immun*', 'overwork*', 'mit’a', 'mita', 'encomienda', 'famine', 'starv*', 'exposure'] } }] },
        { id: 'c', label: 'C', prompt: 'Explain ONE way a labor system in the Americas changed after Indigenous populations declined.', model: 'As Indigenous populations collapsed, colonists increasingly imported enslaved Africans, so chattel slavery on plantations came to replace the encomienda in many regions.', points: [{ id: 'c', label: 'C: explains a change in labor', detail: 'Say what changed and why.', rule: { type: 'terms', part: 'c', min: 1, terms: ['slave*', 'enslav*', 'african*', 'plantation*', 'chattel', 'hacienda', 'indentur*', 'atlantic', 'middle passage'] } }] }
      ]
    },
    {
      id: 'u4-saq-image', unit: 'u4', type: 'saq', minutes: 13, title: 'A family in categories', sources: ['img-casta'],
      intro: 'Short-answer question 3 on the real exam uses a source that isn’t text, like this image.',
      parts: [
        { id: 'a', label: 'A', prompt: 'Describe ONE way this painting reflects social categories in Spanish America.', model: 'The painting labels a Spanish father, African mother and their child by category, showing that colonial society classified people by ancestry.', points: [{ id: 'a', label: 'A: describes what the painting shows about categories', detail: 'Use something you can see in the source.', rule: { type: 'terms', part: 'a', min: 1, terms: ['casta', 'categor*', 'label*', 'ancestry', 'race*', 'racial', 'mixed', 'mulat*', 'hierarch*', 'class*', 'mestiz*'] } }] },
        { id: 'b', label: 'B', prompt: 'Explain ONE economic or political reason colonial elites might want a system like this.', model: 'Ranking people by ancestry protected the privileges of Spanish-born peninsulares, who held the top offices, and it justified using Indigenous and African people for forced labor.', points: [{ id: 'b', label: 'B: explains why elites would want it', detail: 'Connect the hierarchy to power, labor or wealth.', rule: { type: 'terms', part: 'b', min: 1, terms: ['peninsular*', 'creole*', 'criollo*', 'labor', 'slave*', 'power', 'privilege*', 'office*', 'tax*', 'tribute', 'control', 'elite*', 'justif*'] } }] },
        { id: 'c', label: 'C', prompt: 'Explain ONE way a state outside the Americas treated a social or religious group differently from 1450 to 1750.', model: 'Qing rulers placed restrictions on Han Chinese subjects, such as requiring the queue, as a way of asserting Manchu authority over a much larger population.', points: [{ id: 'c', label: 'C: explains another state’s treatment of a group', detail: 'It has to be outside the Americas.', rule: { type: 'terms', part: 'c', min: 1, terms: ['qing', 'manchu', 'han', 'queue', 'jews', 'jewish', 'expel*', 'expuls*', 'ottoman*', 'millet*', 'mughal*', 'jizya', 'akbar', 'aurangzeb', 'huguenot*'] } }] }
      ]
    },
    {
      id: 'u4-saq-columbus', unit: 'u4', type: 'saq', minutes: 13, title: 'First impressions', sources: ['columbus'],
      intro: 'A primary-source question on contact, written for Topic 4.2.',
      parts: [
        { id: 'a', label: 'A', prompt: 'Describe ONE motive for exploration suggested by the passage.', model: 'Columbus says the people would “readily become Christians,” which suggests a religious motive of converting new subjects for the Spanish crown.', points: [{ id: 'a', label: 'A: describes a motive', detail: 'Tie the motive to the passage.', rule: { type: 'terms', part: 'a', min: 1, terms: ['christian*', 'convert*', 'religio*', 'servant*', 'labor', 'god', 'wealth', 'gold', 'empire', 'spread'] } }] },
        { id: 'b', label: 'B', prompt: 'Explain ONE reason a historian should be careful using this passage as evidence about Taíno society.', model: 'Columbus had only just met the Taíno and shared no language with them, so his claim that they have no religion reflects his Christian assumptions more than real knowledge.', points: [{ id: 'b', label: 'B: explains a limit of the source', detail: 'Connect who he is or what he could know to the problem.', rule: { type: 'terms', part: 'b', min: 1, terms: ['language', 'assum*', 'european', 'christian', 'bias*', 'sponsor*', 'monarch*', 'audience', 'just met', 'first', 'days', 'purpose', 'point of view', 'impress*'] } }] },
        { id: 'c', label: 'C', prompt: 'Explain ONE long-term effect of the contact that began with this voyage.', model: 'Contact began the Columbian Exchange, which brought diseases like smallpox to the Americas and spread American crops like potatoes and maize across Afro-Eurasia.', points: [{ id: 'c', label: 'C: explains a long-term effect', detail: 'Name the effect and explain the connection.', rule: { type: 'terms', part: 'c', min: 1, terms: ['columbian exchange', 'smallpox', 'disease*', 'potato*', 'maize', 'silver', 'slave*', 'plantation*', 'encomienda', 'colon*', 'population*', 'syncretis*'] } }] }
      ]
    },
    {
      id: 'u4-leq-exchange', unit: 'u4', type: 'leq', minutes: 40, title: 'Who gained from the exchange?',
      intro: 'The real long essay covers about half the course. This one stays inside Unit 4 so you can practice with what you’ve just learned.',
      prompt: 'In the period circa 1450 to 1750, new oceanic connections moved plants, animals, diseases and people between the hemispheres.\n\nEvaluate the extent to which the Columbian Exchange transformed societies in the period circa 1450 to 1750.\n\nYou may focus on any example(s). You are not expected to address the entire time period.',
      reasoningTerms: ['more than', 'most important', 'although', 'while', 'however', 'whereas', 'because', 'but also', 'not only', 'to a large extent', 'to some extent', 'primarily', 'mainly', 'less than', 'as a result', 'led to', 'caused'],
      topicTerms: ['columbian exchange', 'exchange', 'crop*', 'disease*', 'smallpox', 'potato*', 'maize', 'horse*', 'sugar'],
      contextTerms: ['caravel*', 'lateen', 'compass', 'exploration', 'columbus', 'da gama', 'transoceanic', 'silk road*', 'indian ocean', 'isolated', 'before 1492', 'earlier', 'previous', 'hemispheres'],
      evidenceTerms: ['smallpox', 'measles', 'malaria', 'potato*', 'maize', 'cassava', 'sweet potato*', 'horse*', 'cattle', 'pigs', 'okra', 'rice', 'sugar', 'tobacco', 'plantation*', 'mexica', 'aztec', 'inca', 'tenochtitlan', 'mit’a', 'mita', 'encomienda', 'chattel', 'slave*', 'qing', 'population*'],
      modelThesis: 'Although American crops improved nutrition across Afro-Eurasia, the Columbian Exchange transformed the Americas far more deeply, because disease destroyed Indigenous populations and led colonists to build plantation economies on enslaved African labor.',
      modelEvidence: ['Smallpox and measles killed huge numbers of Indigenous people, who had no prior exposure.', 'Potatoes in Europe and sweet potatoes and maize in China supported population growth.', 'Horses reshaped Indigenous life, and grazing animals changed American land.', 'As Indigenous populations fell, sugar plantations came to depend on enslaved Africans, changing the demographics of three continents.'],
      rubric: 'leq'
    },
    {
      id: 'u4-leq-labor', unit: 'u4', type: 'leq', minutes: 40, title: 'Old systems, new systems',
      intro: 'A continuity and change prompt. Show what changed and what stayed the same.',
      prompt: 'In the period circa 1450 to 1750, global trade increased the demand for labor around the world.\n\nDevelop an argument that evaluates the extent to which labor systems changed in the period circa 1450 to 1750.\n\nYou are not expected to address the entire time period.',
      reasoningTerms: ['change*', 'continu*', 'remained', 'although', 'while', 'however', 'whereas', 'because', 'but also', 'more than', 'to a large extent', 'to some extent', 'led to', 'caused', 'intensif*'],
      topicTerms: ['labor', 'slave*', 'slavery', 'enslav*', 'peasant*', 'serf*', 'mit’a', 'mita', 'encomienda', 'plantation*'],
      contextTerms: ['silver', 'trade', 'global', 'transoceanic', 'columbian exchange', 'disease*', 'exploration', 'mercantil*', 'earlier', 'before 1450', 'previous'],
      evidenceTerms: ['mit’a', 'mita', 'inca', 'encomienda', 'hacienda', 'chattel', 'indentur*', 'plantation*', 'sugar', 'potosí', 'potosi', 'middle passage', 'atlantic', 'household*', 'mediterranean', 'cotton', 'silk', 'linen', 'wool', 'artisan*', 'serf*', 'peasant*', 'maroon*', 'indian ocean'],
      modelThesis: 'Although older forms of labor such as peasant farming and household slavery continued, global trade changed labor by greatly expanding coerced systems, because silver mining and plantations demanded far more workers than local populations could supply.',
      modelEvidence: ['At Potosí, Spanish rulers redirected the Inca mit’a to silver mining: an old system with a new purpose.', 'Plantation chattel slavery in the Americas was far larger in scale and more racialized than older slavery.', 'Household slavery continued in Africa, and export to the Mediterranean and Indian Ocean regions went on.', 'Peasant and artisan labor intensified, such as cotton in India and silk in China, without yet being mechanized.'],
      rubric: 'leq'
    },
    {
      id: 'u4-dbq-contact', unit: 'u4', type: 'dbq', minutes: 60, title: 'A world remade?',
      intro: 'Real DBQs give you 60 minutes, including 15 to read. Plan first, then write. You can cite these as Doc 1 through Doc 7.',
      prompt: 'Evaluate the extent to which European maritime expansion transformed societies around the world in the period 1450 to 1750.',
      sources: ['columbus', 'lascasas', 'img-poma', 'img-potosi', 'equiano', 'img-surat', 'smith-discovery'],
      docTerms: [['columbus', 'good servants', 'taíno', 'taino', 'naked'], ['casas', 'hispaniola', 'three millions', 'sheep'], ['guaman', 'poma', 'atahualpa', 'cajamarca'], ['potosí', 'potosi', 'cieza', 'silver mountain'], ['equiano', 'middle passage', 'suffocat*'], ['surat', 'gujarat*'], ['smith', 'wealth of nations', 'sunk and lost']],
      reasoningTerms: ['more than', 'most important', 'although', 'while', 'however', 'whereas', 'because', 'but also', 'not only', 'to a large extent', 'to some extent', 'primarily', 'mainly', 'less than', 'as much as', 'continu*'],
      topicTerms: ['europe*', 'maritime', 'expansion', 'colon*', 'trade', 'spanish', 'portuguese'],
      contextTerms: ['caravel*', 'lateen', 'compass', 'exploration', 'gunpowder', 'overland', 'silk road*', 'indian ocean', 'ottoman', 'middlemen', 'before 1450', 'earlier', 'mongol*'],
      evidenceTerms: ['smallpox', 'measles', 'mit’a', 'mita', 'encomienda', 'manila', 'galleon*', 'plantation*', 'sugar', 'casta', 'guadalupe', 'syncretis*', 'tokugawa', 'ming', 'dejima', 'joint-stock', 'voc', 'mercantil*', 'elmina', 'asante', 'kongo', 'nzinga', 'pueblo', 'maroon*', 'omani*', 'swahili', 'porcelain', 'qing', 'potato*'],
      sourcingTerms: ['because', 'purpose', 'audience', 'point of view', 'perspective', 'as a', 'as an', 'intended', 'wanted to', 'historical situation', 'likely', 'bias*', 'to persuade', 'to justify', 'written for', 'priest', 'abolition*', 'economist', 'sponsor*', 'monarchs', 'king'],
      modelThesis: 'Although European expansion devastated the Americas and transformed Atlantic Africa through conquest, disease and slavery, it changed Asia far less, because Asian states and merchants kept control of their own markets and trade networks.',
      modelContext: 'Before 1450, Afro-Eurasian trade ran overland and through the Indian Ocean, with Europe at its edge. New ship designs and navigation tools, many learned from Islamic and Asian societies, let European states reach Asia by sea and the Americas for the first time.',
      modelEvidence: ['Docs 2 and 3 show conquest and collapse in the Americas. Las Casas wrote to persuade the crown, which may affect his figures, and Guaman Poma drew for the king to show abuses.', 'Doc 4 and Doc 5 show new systems of forced labor: Potosí’s silver, and the Middle Passage as Equiano, an abolitionist, describes it.', 'Doc 6 shows Surat still thriving as an Asian port. Dutch printmakers saw it as a rich market worth trading with, not as a conquered territory.', 'Beyond the documents: Tokugawa Japan confined the Dutch to Dejima, showing that Asian states could limit European influence.'],
      rubric: 'dbq'
    }
  );

  /* ---------- lessons ---------- */
  window.STUDY_LESSONS['ap-world'].push(
    {
      id: 'apw4-tech', unit: 'u4', title: 'Borrowed tools, new oceans',
      steps: [
        { type: 'teach', title: 'Europe didn’t do this alone', image: 'caravel', body: 'Europe’s ocean voyages relied on knowledge from elsewhere. The **compass** came from China, the **lateen sail** from the Indian Ocean world, and **astrolabes and star charts** from the Classical and Islamic worlds.\n\nEuropeans combined these with new ship designs. That’s the course’s main idea here: **cross-cultural exchange made ocean travel possible.**' },
        { type: 'match', prompt: 'Match each ship or tool to what it did.', pairs: [
          ['Caravel', 'Small, and could sail upwind'],
          ['Carrack', 'Large, for long voyages and cargo'],
          ['Fluyt', 'Cheap cargo with a small crew'],
          ['Astrolabe', 'Found latitude using the sun or stars'],
          ['Compass', 'Showed direction, even out of sight of land']
        ], why: 'You also need to know about wind and current patterns. Sailors learned to use them to get out and back.' },
        { type: 'q', ref: 'u4-01' },
        { type: 'q', ref: 'u4-02' },
        { type: 'q', ref: 'u4-04' }
      ]
    },
    {
      id: 'apw4-explore', unit: 'u4', title: 'Why go, and who paid?',
      steps: [
        { type: 'teach', title: 'States paid for it', image: 'cantino', body: 'The key word in this topic is **state-supported**. These were government projects.\n\nThe motives are often remembered as **God, gold and glory**. Europeans also wanted to reach Asian goods without paying the Italian and Muslim middlemen who controlled older routes.' },
        { type: 'order', prompt: 'Put these voyages in order, earliest first.', items: ['Portuguese sail down the African coast', 'Columbus reaches the Caribbean', 'Da Gama reaches India', 'Magellan’s expedition crosses the Pacific'], why: 'Note who sponsored each one: Portugal, Spain, Portugal, Spain. Rivalry between those two pushed exploration on.' },
        { type: 'sort', prompt: 'Which state sponsored this exploration?', buckets: ['Portugal', 'Spain'], items: [
          ['Trading posts along Africa to Asia', 0, 'Yes. That’s the Portuguese trading-post empire.'],
          ['Columbus’s voyages across the Atlantic', 1, 'Yes. Isabella and Ferdinand funded him.'],
          ['Da Gama’s route to Calicut', 0, 'Yes. Portugal reached India in 1498.'],
          ['Crossing the Pacific to the Philippines', 1, 'Yes. Magellan sailed for Spain.']
        ]},
        { type: 'pick', source: 'columbus', prompt: 'Why does Columbus mention that the people would be “good servants” and “become Christians”?', options: [
          ['He’s telling his royal sponsors what their investment can bring them', true, 'Right. His audience is Isabella and Ferdinand, so he emphasizes labor and converts.'],
          ['He’s writing a scientific study of Taíno society', false, 'He’d only just met them and shared no language with them.'],
          ['He’s warning Spain not to come back to these islands', false, 'The reverse: he’s making a case for why it’s worth returning.']
        ]},
        { type: 'q', ref: 'u4-07' },
        { type: 'q', ref: 'u4-10' },
        { type: 'q', ref: 'u4-11' }
      ]
    },
    {
      id: 'apw4-exchange', unit: 'u4', title: 'The Columbian Exchange',
      steps: [
        { type: 'teach', title: 'Two worlds collide, biologically', image: 'smallpox', body: 'After 1492, plants, animals and diseases crossed the Atlantic, and the effects were lopsided.\n\n**To the Americas:** smallpox, measles and malaria, along with horses, pigs, cattle, wheat and sugar.\n\n**To Afro-Eurasia:** potatoes, maize, cassava and tomatoes, which fed growing populations.' },
        { type: 'sort', prompt: 'Which way did it travel?', buckets: ['To the Americas', 'From the Americas'], items: [
          ['Smallpox', 0, 'Yes, with catastrophic effects on Indigenous populations.'],
          ['Potatoes', 1, 'Yes. They became a staple in Europe.'],
          ['Horses', 0, 'Yes. They transformed Indigenous life on the plains.'],
          ['Maize', 1, 'Yes. It spread to Africa and Asia.'],
          ['Sugar', 0, 'Yes, and it became the main plantation crop.'],
          ['Okra and rice, carried by enslaved Africans', 0, 'Yes. The course names them specifically.']
        ]},
        { type: 'q', ref: 'u4-13' },
        { type: 'q', ref: 'u4-17' },
        { type: 'q', ref: 'u4-18' }
      ]
    },
    {
      id: 'apw4-empires', unit: 'u4', title: 'Posts, plantations and limits',
      steps: [
        { type: 'teach', title: 'Not one kind of empire', image: 'elmina', body: 'Portugal held **trading posts** like Elmina. Spain conquered huge **territories** in the Americas. Later, the Dutch, French and British built empires too, driven by political, religious and economic rivalries.\n\nAnd local powers weren’t just bystanders. **Ming China and Tokugawa Japan** limited trade, while the **Asante and Kongo** grew through it.' },
        { type: 'stages', title: 'Still an Asian ocean', visual: 'indian-ocean', stages: [
          { name: 'Before', text: 'Asian and African merchants already run a rich trading network across the Indian Ocean.' },
          { name: 'Portugal arrives', text: 'Portugal seizes ports and demands fees from ships. That’s **some disruption**, not a takeover.' },
          { name: 'Dutch and English', text: 'Joint-stock companies arrive, trading more than conquering in this period.' },
          { name: 'And yet', text: '**Swahili Arabs, Omanis, Gujaratis and Javanese** keep trading. Oman even pushes the Portuguese out of some ports. That’s a key continuity.' }
        ]},
        { type: 'teach', title: 'Who did the work?', image: 'potosi', body: 'Colonial economies needed labor, and they used old and new systems:\n\n**Existing:** the Inca **mit’a**, redirected to silver mines like Potosí.\n\n**New:** **encomienda** (settlers get Indigenous labor and tribute), **hacienda** (large estates), **indentured servitude** and **chattel slavery**.' },
        { type: 'match', prompt: 'Match each labor system to what it was.', pairs: [
          ['Mit’a', 'Inca rotational labor, used in Spanish mines'],
          ['Encomienda', 'Settlers granted Indigenous labor and tribute'],
          ['Chattel slavery', 'People owned as inherited property'],
          ['Indentured servitude', 'Labor for a set term, often for passage']
        ], why: 'Slavery in Africa also continued in older forms. What changed is the plantation system’s huge demand in the Americas.' },
        { type: 'q', ref: 'u4-19' },
        { type: 'q', ref: 'u4-20' },
        { type: 'q', ref: 'u4-22' },
        { type: 'q', ref: 'u4-23' }
      ]
    },
    {
      id: 'apw4-silver', unit: 'u4', title: 'Silver makes the world go round',
      steps: [
        { type: 'stages', title: 'Follow the silver', visual: 'silver-route', stages: [
          { name: 'Potosí', text: 'Forced laborers mine silver in Spanish Peru, and in Mexico too.' },
          { name: 'Acapulco', text: 'Silver reaches Mexico’s Pacific coast. Much of the rest crosses the Atlantic to Europe.' },
          { name: 'Manila', text: 'The **Manila Galleons** cross the Pacific to a Spanish port in the Philippines.' },
          { name: 'China', text: 'Chinese merchants take the silver, because the **Ming** collect taxes in it. In return they sell silk and porcelain. The world’s first truly global trade loop is complete.' }
        ]},
        { type: 'teach', title: 'Mercantilism', image: 'surat', body: 'European rulers believed wealth was limited, so one state’s gain was another’s loss. **Mercantilism** meant selling more than you buy, and using colonies as sources of raw materials.\n\n**Joint-stock companies** like the Dutch VOC and English East India Company let investors share the risk, and states gave them monopolies.' },
        { type: 'pick', source: 'smith-mercantile', prompt: 'What should you remember when using Adam Smith as a source on mercantilism?', options: [
          ['He was a critic, writing in 1776 to argue against it', true, 'Yes. He describes it accurately enough, but his goal is to argue against it.'],
          ['He was a mercantilist official explaining his own policy', false, 'He’s known as a critic of it, and a major one.'],
          ['He lived before mercantilism began', false, 'He wrote in 1776, well after it had started.']
        ]},
        { type: 'q', ref: 'u4-28' },
        { type: 'q', ref: 'u4-29' },
        { type: 'q', ref: 'u4-31' }
      ]
    },
    {
      id: 'apw4-atlantic', unit: 'u4', title: 'The Atlantic system and its people',
      steps: [
        { type: 'teach', title: 'Goods, wealth and people', image: 'brookes', body: 'The **Atlantic system** moved goods, wealth and enslaved people between Africa, the Americas and Europe. The crossing is called the **Middle Passage**.\n\nIt changed Africa too. Traders took more men than women, so some regions came to have more women than men, which restructured families and work.' },
        { type: 'pick', source: 'equiano', prompt: 'Equiano published this in 1789 as a British abolitionist. How should a historian use it?', options: [
          ['As a firsthand account written to persuade readers to end the trade', true, 'Right. It’s powerful testimony, and his purpose helps explain how he frames it.'],
          ['As a neutral record kept by a ship’s captain', false, 'Check the source line: he was a survivor, not a captain.'],
          ['As proof that all ships had equal conditions', false, 'One account can’t show that alone, though others back up his description.']
        ]},
        { type: 'teach', title: 'Blended beliefs', image: 'guadalupe', body: 'As people met, religions changed. **Syncretism** means blending belief systems. Examples include the **Virgin of Guadalupe** in Mexico, and **Vodun** and **Santería**, which joined African beliefs with Catholicism.\n\nReligion also spread and caused conflict. Remember all three: **reach, conflict and blending.**' },
        { type: 'q', ref: 'u4-32' },
        { type: 'q', ref: 'u4-33' },
        { type: 'q', ref: 'u4-34' }
      ]
    },
    {
      id: 'apw4-resist', unit: 'u4', title: 'Pushing back',
      steps: [
        { type: 'teach', title: 'States grew, and people resisted', image: 'nzinga', body: 'As states expanded and centralized, resistance came from many directions: nobles, peasants, Indigenous nations, regional powers and enslaved people.\n\n**Ana Nzinga** fought the Portuguese for decades in Southwest Africa. She shows that Africans weren’t just victims of this period.' },
        { type: 'sort', prompt: 'Is this resistance within Europe and Asia, or against colonial rule?', buckets: ['Against a home government', 'Against colonial rule'], items: [
          ['The Fronde in France', 0, 'Yes. Nobles and courts resisted royal power.'],
          ['Pueblo Revolt in New Mexico', 1, 'Yes. They expelled the Spanish in 1680.'],
          ['Cossack revolts in Russia', 0, 'Yes. Stenka Razin rose against the tsar’s officials.'],
          ['Maroon communities in Brazil', 1, 'Yes. People who escaped slavery built free settlements.'],
          ['Metacom’s War in New England', 1, 'Yes. He fought English colonial expansion.']
        ]},
        { type: 'recall', prompt: 'Without looking back: list as many examples of resistance from this unit as you can.', min: 3, terms: [
          ['Pueblo Revolt', 'pueblo', 'popé', 'pope'], ['Ana Nzinga', 'nzinga'], ['Maroons', 'maroon*', 'palmares'], ['The Fronde', 'fronde'], ['Cossack revolts', 'cossack*', 'razin'], ['Maratha conflict', 'maratha*', 'shivaji'], ['Metacom’s War', 'metacom', 'king philip*']
        ], why: 'Each of these is ready to use as evidence in an essay about state power.' },
        { type: 'q', ref: 'u4-35' },
        { type: 'q', ref: 'u4-38' },
        { type: 'q', ref: 'u4-39' }
      ]
    },
    {
      id: 'apw4-society', unit: 'u4', title: 'Who ranked where?',
      steps: [
        { type: 'teach', title: 'New elites, old elites', image: 'casta', body: 'Empires reshaped who held status. In the Americas, the **casta system** ranked people by ancestry. In China, the Manchu became a new ruling elite.\n\nOlder elites such as **boyars**, **Ottoman timar holders** and **European nobles** saw their power rise and fall as monarchs grew stronger.' },
        { type: 'teach', title: 'Include or exclude?', image: 'jews', body: 'States handled diversity in opposite ways.\n\n**Suppressed:** Spain and Portugal expelled their Jews, and the Qing placed limits on Han Chinese.\n\n**Accommodated:** the Ottomans accepted those Jews, and Mughal rulers like Akbar drew Hindus into government.\n\nThese make great essay comparisons, because the same group can be treated in opposite ways.' },
        { type: 'sort', prompt: 'Did this policy accommodate or restrict a group?', buckets: ['Accommodate', 'Restrict'], items: [
          ['Ottomans accept Jews expelled from Spain', 0, 'Yes. They gained skilled subjects.'],
          ['Qing rulers require Han men to wear the queue', 1, 'Yes. It marked submission to the Manchu.'],
          ['Akbar brings Rajput nobles into government', 0, 'Yes. It turned rivals into allies.'],
          ['Spain’s decree of 1492 against Jews', 1, 'Yes. They had to convert or leave.']
        ]},
        { type: 'q', ref: 'u4-41' },
        { type: 'q', ref: 'u4-43' },
        { type: 'q', ref: 'u4-44' }
      ]
    },
    {
      id: 'apw4-ccot', unit: 'u4', title: 'What changed, what didn’t',
      steps: [
        { type: 'teach', title: 'The unit in one question', image: 'manila', body: 'Topic 4.8 asks how economic developments affected social structures, and the strongest essays show **both** change and continuity.\n\n**Changed:** a truly global trade, American silver, plantation slavery and new racial hierarchies.\n\n**Continued:** Asian trade networks, peasant labor, and rulers using religion and elites to hold power.' },
        { type: 'sort', prompt: 'Is this a change or a continuity from 1450 to 1750?', buckets: ['Change', 'Continuity'], items: [
          ['Direct trade between the Americas and Asia', 0, 'Yes. It didn’t exist before Manila.'],
          ['Gujarati merchants trading across the Indian Ocean', 1, 'Yes. They were there before and after.'],
          ['Plantation slavery across the Atlantic', 0, 'Yes. Its scale and racial basis were new.'],
          ['Peasants doing most of the world’s farming', 1, 'Yes. It continued and intensified.'],
          ['Casta rankings in Spanish America', 0, 'Yes. A new social hierarchy.']
        ]},
        { type: 'recall', prompt: 'Without looking back: list everything you remember about **how labor worked** in this period.', min: 3, terms: [
          ['Mit’a', 'mit’a', 'mita'], ['Encomienda', 'encomienda'], ['Hacienda', 'hacienda'], ['Chattel slavery', 'chattel', 'slave*', 'enslav*'], ['Indentured servitude', 'indentur*'], ['Peasant labor', 'peasant*', 'serf*'], ['Artisan textiles', 'artisan*', 'cotton', 'silk', 'linen', 'wool']
        ], why: 'That’s the evidence bank for an essay on labor. The “Old systems, new systems” prompt in the write tab asks for exactly this.' },
        { type: 'q', ref: 'u4-45' },
        { type: 'q', ref: 'u4-46' },
        { type: 'q', ref: 'u4-47' }
      ]
    }
  );
})();
