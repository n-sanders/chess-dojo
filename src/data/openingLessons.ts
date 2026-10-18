export type LineLesson = {
  /** Paragraphs separated by a blank line. */
  history: string;
  ideas: string[];
  identify: string;
  /** One caption per ply of the branch's mainLine. */
  steps: string[];
};

/** Keyed by `whiteFirst` in the phase file. */
export const firstMoveIntros: Record<string, string> = {
  "King's Pawn":
    '1.e4 puts a pawn in the centre and opens lines for both the queen and the king\'s bishop in one move. Bobby Fischer called it "best by test". Black\'s reply decides what kind of game it becomes: 1...e5 leads to the Open Games, while 1...c5, 1...e6, 1...c6, 1...d5 and 1...d6 are the "semi-open" defenses, where Black challenges the centre without copying White.',
  "Queen's Pawn":
    "1.d4 also takes the centre, but the d-pawn is already defended by the queen, so these games tend to be slower and more strategic than 1.e4 games. Black usually answers 1...d5 (classical, occupy the centre) or 1...Nf6 (the Indian defenses, control the centre with pieces first and decide on a pawn structure later).",
};

/**
 * Keyed by the branch `name` (the defense family). Families whose only line shares
 * the family name (French, Caro-Kann, ...) are covered by their line lesson.
 */
export const familyIntros: Record<string, string> = {
  'Open Game':
    '1.e4 e5 is the Open Game: both sides put a pawn in the centre. After 2.Nf3 (attacking e5) 2...Nc6 (defending it), White\'s third move names the opening. The bishop to c4 is the Italian, the bishop to b5 is the Ruy Lopez, and the pawn break d4 is the Scotch. These are the oldest openings in chess and appear in the Göttingen manuscript of around 1490.',
  'Sicilian Defense':
    "1...c5 fights for the d4-square like 1...e5 does, but from the side, so the position is unbalanced from move one. Giulio Polerio analysed it in 1594, and Jacob Sarratt fixed the English name \"Sicilian Defence\" in 1813 after an old Italian manuscript that called it il gioco siciliano. It became the most popular answer to 1.e4 in the second half of the 20th century, played by Fischer, Tal and Kasparov. White's big decision is whether to open the position with d4 (the Open Sicilian) or sidestep the theory with something like 3.Bb5 (the Rossolimo).",
  "Queen's Pawn Game":
    "1.d4 d5 is the closed counterpart of 1.e4 e5: both sides claim the centre with a pawn. White then either challenges Black's d-pawn at once with 2.c4 (the Queen's Gambit) or builds a fixed, solid setup with Nf3, Bf4 and e3 (the London System).",
  'Indian Defense':
    'After 1.d4 Nf6 Black controls e4 with a knight instead of committing a pawn. The name dates from 1884 and comes from the Indian player Moheschunder Bannerjee, whose fianchetto setups puzzled John Cochrane in their games in the 1850s. Savielly Tartakower popularised the term in the 1920s, when the hypermodern school championed these defenses, and Soviet players proved them fully sound in the late 1940s. After 2.c4, 2...e6 heads for the Nimzo-Indian and 2...g6 heads for the King\'s Indian.',
};

/** Keyed by the branch `nextName` (the specific line). */
export const lineLessons: Record<string, LineLesson> = {
  'Italian Game': {
    history:
      'One of the oldest recorded openings. It appears in the Göttingen manuscript (around 1490), the earliest known work on modern chess, and was analysed by Damiano and Polerio in the 16th century. It fills the game collections of Gioachino Greco from the 1620s. For centuries it was known as the Giuoco Piano ("quiet game") after its main line 3...Bc5.\n\nIn the 20th century the Ruy Lopez took over at top level, but the slow c3/d3 setup, sometimes called the Giuoco Pianissimo, brought the Italian back. Karpov played it twice in the 1981 world championship. After Kramnik made the Berlin Defense against the Ruy Lopez so hard to crack in 2000, many elite players switched to the Italian, which avoids the Berlin entirely.',
    ideas: [
      'The "Italian bishop" on c4 aims at f7, the weakest point in Black\'s camp because only the king defends it.',
      'White develops quickly and gets ready to castle, keeping options for a sharp d4 break or a slow c3/d3 build-up.',
      'Black usually mirrors with 3...Bc5 (Giuoco Piano) or counterattacks e4 with 3...Nf6 (Two Knights Defense).',
    ],
    identify: 'After 1.e4 e5 2.Nf3 Nc6, the bishop lands on c4 and stares at f7. Compare: Bb5 is the Ruy Lopez, d4 is the Scotch.',
    steps: [
      'White grabs the centre and frees the queen and the light-squared bishop.',
      'Black copies: a pawn in the centre that stops White from playing d4 for free.',
      'The knight develops with a threat: it attacks the e5 pawn.',
      "Black defends e5 with a developing move. This is the starting point of the Italian, Ruy Lopez and Scotch.",
      'The bishop goes to c4 and aims at f7. That diagonal is the signature of the Italian Game.',
    ],
  },
  'Ruy Lopez': {
    history:
      'Named after Ruy López de Segura, a 16th-century Spanish priest who recommended 3.Bb5 over 3.Bc4 in his 1561 book Libro del Axedrez, although the move already appears in the Göttingen manuscript of around 1490. It only became popular in the mid-19th century, after Carl Jaenisch published deep analysis of it in 1847.\n\nSince then it has been the most important Open Game at master level, and some lines are analysed past move thirty. Black finds it so hard to equalise that the opening is nicknamed "the Spanish Torture". Its most famous modern episode is the Berlin Defense (3...Nf6), which Vladimir Kramnik used in the 2000 world championship to draw four of Garry Kasparov\'s eight White games.',
    ideas: [
      'The bishop attacks the knight that defends e5, which builds pressure on Black\'s centre over the long term.',
      'The threat is not immediate: 4.Bxc6 dxc6 5.Nxe5? Qd4! wins the pawn back with a fork. White plays for slow, lasting pressure instead.',
      'Unlike on c4, the bishop on b5 cannot be hit by a quick ...d5 from Black.',
      'Black usually replies 3...a6 (the Morphy Defense) to ask the bishop what it wants, or 3...Nf6 (the Berlin).',
    ],
    identify: 'After 1.e4 e5 2.Nf3 Nc6, the bishop goes to b5 and pins or pressures the c6 knight. If it stops on c4 instead, it is the Italian.',
    steps: [
      'White takes the centre with the king pawn.',
      'Black meets it symmetrically.',
      'The knight attacks e5.',
      'Black defends e5 with the knight.',
      'The "Spanish bishop" hits the defender of e5. This is the Ruy Lopez.',
    ],
  },
  'Scotch Game': {
    history:
      'First mentioned by Ercole del Rio in 1750, but named after a correspondence match between Edinburgh and London in 1824. It was common in the 19th century. By 1900 it had faded, because people thought it released the central tension too early and let Black equalise easily.\n\nGarry Kasparov revived it in the 1990s, including against Anatoly Karpov in their 1990 world championship match. He argued that it gives Black lasting strategic problems while avoiding the huge body of Ruy Lopez theory.',
    ideas: [
      'White breaks the centre open immediately instead of building pressure slowly.',
      'After 3...exd4 4.Nxd4 White has a free, active position and an extra central pawn on e4 against nothing on d5.',
      'A common pattern is Nxc6 bxc6, which gives Black doubled pawns.',
      'Black usually counters with 4...Bc5 or 4...Nf6, hitting the centralised knight or the e4 pawn.',
    ],
    identify: 'After 1.e4 e5 2.Nf3 Nc6, White pushes a pawn (d4) instead of developing a bishop. A pawn move here means Scotch.',
    steps: [
      'White takes the centre.',
      'Black mirrors.',
      'The knight attacks e5.',
      'Black defends it.',
      'White strikes in the centre at once. The pawn on d4 attacks e5 and opens lines for every white piece.',
    ],
  },
  'Open Sicilian': {
    history:
      'The Open Sicilian is the critical, most theoretical way to meet 1...c5. White gives up the d-pawn for Black\'s c-pawn to open lines and get a lead in development. Almost all the famous Sicilian sub-variations (the Najdorf, Dragon, Scheveningen, Sveshnikov and Taimanov) come from this position.\n\nIt was the main battlefield of the Sicilian in the second half of the 20th century, played by Fischer, Tal and Kasparov, and it still produces some of the sharpest games at every level.',
    ideas: [
      'Trading the c-pawn for the d-pawn unbalances the game. Black gets two centre pawns against one and a half-open c-file for counterplay.',
      'White gets a lead in development, more space, a half-open d-file and often attacking chances against Black\'s king.',
      'Opposite-side castling and racing pawn storms are common, so tactics decide many games.',
    ],
    identify: '1.e4 c5 2.Nf3 followed by d4 and a recapture on d4, so White has a knight in the centre and no d-pawn.',
    steps: [
      'White takes the centre.',
      "Black's c-pawn controls d4 from the side and breaks the symmetry. This is the Sicilian Defense.",
      'White develops and prepares to play d4.',
      'Black covers e5 and opens a diagonal for the light-squared bishop.',
      "White opens the centre. The \"Open\" in Open Sicilian means this d4 break.",
      'Black trades a wing pawn for a centre pawn, which gives the central majority and the half-open c-file.',
      'White recaptures with the knight. White leads in development and Black has the extra centre pawn.',
    ],
  },
  Rossolimo: {
    history:
      'Named after Nicolas Rossolimo (1910–1975), a Russian-born grandmaster who was many times champion of Paris and later ran a chess studio in New York\'s Greenwich Village. The move 3.Bb5 is much older; a game from 1845 already features it. But Rossolimo\'s frequent and successful use of it from 1948 onwards made it a respectable weapon.\n\nToday it is a top-level way to avoid the sharp, heavily analysed Open Sicilian lines after 2...Nc6, such as the Sveshnikov. It featured in the 2018 world championship match between Magnus Carlsen and Fabiano Caruana.',
    ideas: [
      'White dodges the Open Sicilian theory and gets a quieter game they understand better.',
      'The bishop pressures the c6 knight, which weakens Black\'s grip on d4 and e5.',
      'White is often happy to play Bxc6 and leave Black with doubled c-pawns.',
      'White castles quickly, then plays c3 and d4 with support, or a slow d3.',
    ],
    identify: '1.e4 c5 2.Nf3 Nc6 and then Bb5. It is a Ruy Lopez-style bishop move inside a Sicilian.',
    steps: [
      'White takes the centre.',
      'Black plays the Sicilian, hitting d4 from the side.',
      'White develops and keeps d4 in reserve.',
      'Black develops the knight to add more control of d4 and e5.',
      'Instead of opening the centre, White pins the knight. This is the Rossolimo.',
    ],
  },
  'French Defense': {
    history:
      'Named after a correspondence match between London and Paris that began in 1834. Jacques Chamouillet persuaded the Paris team to adopt 1...e6. It got little respect in the 19th century; Steinitz called it "the dullest of all openings". In the 20th century Géza Maróczy made it his main weapon, and Botvinnik, Korchnoi, Petrosian and Nimzowitsch shaped its theory.\n\nFor decades it has usually been the third most popular reply to 1.e4, after 1...c5 and 1...e5.',
    ideas: [
      'Black prepares ...d5 so that it can challenge e4 with the d-pawn supported by e6.',
      'The structure is solid and resilient. If White advances to e5, Black attacks the base of White\'s pawn chain with ...c5, and sometimes ...f6.',
      'The price is the "French bishop" on c8, which is shut in behind its own pawn on e6.',
      'White chooses between defending e4 (3.Nc3 or 3.Nd2), advancing (3.e5) or exchanging (3.exd5).',
    ],
    identify: 'Black answers 1.e4 with a quiet e6, then d5. The pawns stand side by side on e6 and d5.',
    steps: [
      'White takes the centre.',
      "Black's modest pawn move prepares ...d5 and opens the dark-squared bishop. This is the French Defense.",
      'White takes the whole centre while Black allows it.',
      'Black strikes at e4 with the d-pawn, supported by the e6 pawn. White must now defend, advance or trade.',
    ],
  },
  'Caro-Kann Defense': {
    history:
      'Named after the English player Horatio Caro and the Austrian Marcus Kann, who both analysed it in 1886. A year earlier, Kann had beaten the German champion Jacques Mieses with it in just 24 moves in Hamburg.\n\nIts main line is also called the Capablanca Variation, after the Cuban world champion. Karpov was another famous user, and the Caro-Kann gained a reputation as one of the most solid answers to 1.e4. It is still popular at top level, with players like Ding Liren and Alireza Firouzja.',
    ideas: [
      'Black supports ...d5 with the c-pawn instead of the e-pawn, so the light-squared bishop can still come out (often to f5 or g4).',
      'That fixes the French\'s main problem, but costs time. If Black later wants ...c5, it takes two moves instead of one.',
      'The structure is very sound and endgames tend to be comfortable for Black.',
    ],
    identify: 'Black answers 1.e4 with c6, then d5. The c6 pawn backs up d5, and the e-pawn is still at home.',
    steps: [
      'White takes the centre.',
      "Black prepares ...d5 with the c-pawn and keeps the c8 bishop's diagonal open. This is the Caro-Kann.",
      'White builds the ideal centre.',
      'Black hits e4. If White takes on d5, Black recaptures with the c-pawn and keeps a pawn in the centre.',
    ],
  },
  'Scandinavian Defense': {
    history:
      'Arguably the oldest recorded opening. It appears in a fictional game between Francesc de Castellví and Narcís Vinyoles in the Catalan poem Scachs d\'amor (Valencia, around 1475), perhaps the first documented game with the modern queen and bishop moves. Long called the Center Counter Defense, it was renamed in honour of late 19th-century Scandinavian analysts such as Ludvig Collijn.\n\nBent Larsen beat Karpov with it in 1979. In 1995 it reached a world championship match for the first time, when Anand used it against Kasparov. Magnus Carlsen beat Fabiano Caruana with it at the 2014 Olympiad.',
    ideas: [
      'The most direct reply to 1.e4: Black challenges the e-pawn immediately, so White never gets a two-pawn centre.',
      'After 2...Qxd5 3.Nc3 the queen has to move again, which costs time. In return, Black develops easily and has a clear structure.',
      'Black usually plays ...c6, ...Bf5 and ...e6, reaching a Caro-Kann-like structure with an active queen.',
    ],
    identify: 'Black answers 1.e4 with d5 straight away, and the queen soon recaptures on d5.',
    steps: [
      'White takes the centre.',
      'Black challenges e4 at once. This is the Scandinavian (Center Counter).',
      'White takes the pawn; holding it with 2.e5 would be passive.',
      'Black recaptures with the queen. It is exposed in the centre, and White will gain time against it with Nc3.',
    ],
  },
  'Pirc Defense': {
    history:
      'Named after the Slovenian grandmaster Vasja Pirc, who played it regularly from the late 1940s. In the former Soviet Union it is called the Ufimtsev Defense, after Anatoly Ufimtsev. It was considered an irregular opening in the 19th century. It became respectable by the 1960s, largely through the efforts of the Canadian grandmaster Duncan Suttles.\n\nIts first world championship appearance was game 17 of Fischer vs Spassky in 1972, the only time Fischer ever played it. The game was drawn.',
    ideas: [
      'A hypermodern defense: Black lets White build a big pawn centre on e4 and d4, then aims to undermine it.',
      'The bishop is fianchettoed on g7 (developed on the long diagonal) and pressures d4. Black then breaks with ...c5 or ...e5.',
      'It is flexible and unbalanced, but critics such as Kasparov consider it too passive for the very top level. White can attack aggressively, for example with f4 (the Austrian Attack).',
    ],
    identify: 'Black answers 1.e4 with d6, puts the knight on f6 and plays ...g6 for a fianchetto, while White already has pawns on e4 and d4.',
    steps: [
      'White takes the centre.',
      'Black plays a modest pawn move that covers e5 and c5 and does not fight for the centre directly yet.',
      'White accepts the invitation and builds a two-pawn centre.',
      'The knight attacks e4 and develops toward the kingside.',
      'White defends e4 with a developing move.',
      'Black prepares to fianchetto the bishop on g7. This is the defining move of the Pirc.',
    ],
  },
  "Queen's Gambit": {
    history:
      'One of the oldest openings. It appears in the Göttingen manuscript of 1490 and was analysed by Greco in the 17th century. In the 18th century Philipp Stamma of Aleppo recommended it, so it is sometimes called the Aleppo Gambit. It became common after the Vienna tournament of 1873 and peaked in the 1920s and 1930s. All but 2 of the 34 games in the 1927 world championship between Capablanca and Alekhine were Queen\'s Gambits.\n\nAfter World War II the Indian defenses took some of its share, but it remains a main road for 1.d4 players. A 2020 TV series made its name famous far beyond chess.',
    ideas: [
      'White offers the c-pawn to pull Black\'s d-pawn away from the centre, so White can later play e4.',
      'It is not a real gambit. After 2...dxc4 (the Queen\'s Gambit Accepted), Black cannot hold the pawn without problems and White usually wins it back.',
      'Black usually declines with 2...e6 (the Queen\'s Gambit Declined) or 2...c6 (the Slav) and keeps a pawn on d5.',
    ],
    identify: '1.d4 d5 and then White plays c4 right away, offering the c-pawn next to Black\'s d-pawn.',
    steps: [
      'White takes the centre with the queen pawn, which the queen already defends.',
      'Black claims an equal share of the centre.',
      "White offers the c-pawn to deflect d5 from the centre. This is the Queen's Gambit.",
    ],
  },
  'London System': {
    history:
      'The Irish-American master James Mason was the first to use it regularly, in the 1880s. The name comes from the strong London tournament of 1922, where it was played seven times, including by Capablanca, Alekhine and Rubinstein.\n\nIt stayed rare for decades. In the 21st century Gata Kamsky, Levon Aronian and Magnus Carlsen played it more often, and it became hugely popular at club level. Ding Liren won game 6 of the 2023 world championship against Ian Nepomniachtchi with it.',
    ideas: [
      'It is a "system": White aims for the same setup (d4, Nf3, Bf4, e3, c3, Nbd2, Bd3) against almost anything, so there is little theory to memorise.',
      'The bishop comes out to f4 before e3 shuts it in.',
      'White often puts a knight on e5 and plays for a kingside attack.',
      'It is solid but criticised as repetitive. A common answer for Black is ...c5 with ...Qb6, hitting the b2 pawn the bishop left behind.',
    ],
    identify: 'After 1.d4 White develops the dark-squared bishop to f4 early instead of playing c4.',
    steps: [
      'White takes the centre with the queen pawn.',
      'Black meets it with the d-pawn.',
      'White develops the knight and holds back c4.',
      'Black develops symmetrically.',
      'The bishop goes to f4 before e3 locks it in. This is the London System setup.',
    ],
  },
  'Nimzo-Indian': {
    history:
      'Developed by Aron Nimzowitsch, a leader of the hypermodern school, who introduced it to master chess in the early 20th century. An early example is Englisch vs Blackburne, London 1883.\n\nIt is one of the most respected defenses to 1.d4 and has been played by every world champion since Capablanca. White players often avoid it altogether with 3.Nf3 or 3.g3.',
    ideas: [
      'The bishop pins the c3 knight to the king, so White cannot easily play e4. Black controls the centre with pieces instead of pawns.',
      'Black is often happy to play ...Bxc3 and give up the bishop pair (two bishops versus bishop and knight) to double White\'s c-pawns.',
      'Black delays committing a pawn structure, so the game stays flexible and can transpose into Queen\'s Gambit or Queen\'s Indian positions.',
    ],
    identify: '1.d4 Nf6 2.c4 e6 3.Nc3 and then Bb4, a pin on the c3 knight. With ...g6 and ...Bg7 instead, it is the King\'s Indian.',
    steps: [
      'White takes the centre with the queen pawn.',
      'The knight controls e4 and d5. This is the Indian Defense.',
      'White adds the c-pawn to the fight for d5.',
      'Black opens the diagonal for the dark-squared bishop and keeps ...d5 available.',
      'White develops the knight and prepares e4.',
      'Black pins the knight and stops e4. This is the Nimzo-Indian.',
    ],
  },
  "King's Indian": {
    history:
      "Until the mid-1930s the King's Indian was considered suspect. The play and analysis of three Soviet players, Alexander Konstantinopolsky, Isaac Boleslavsky and David Bronstein, made it respectable. The modern name is credited to Hans Kmoch.\n\nIt became a favourite of Fischer, Tal and Kasparov. Kasparov gave it up after Vladimir Kramnik scored a series of critical wins against it. Hikaru Nakamura, Teimour Radjabov and Ding Liren have kept it alive at the top.",
    ideas: [
      'A hypermodern defense: Black lets White build a big pawn centre (often with e4 too), castles, and then strikes with ...e5 or ...c5.',
      'If White closes the centre with d5, the game becomes a race: White attacks on the queenside, and Black storms the kingside with ...f5, ...f4 and ...g5.',
      'The positions are complex and unbalanced, with winning chances for both sides.',
    ],
    identify: '1.d4 Nf6 2.c4 g6 3.Nc3 Bg7, with the bishop fianchettoed on g7. If Black pins with ...Bb4 instead, it is the Nimzo-Indian.',
    steps: [
      'White takes the centre with the queen pawn.',
      'The knight controls e4 and d5. This is the Indian Defense.',
      'White grabs more space with the c-pawn.',
      "Black prepares to fianchetto the dark-squared bishop and does not challenge the centre yet.",
      'White develops and prepares e4 for a full pawn centre.',
      "The bishop settles on the long diagonal, aiming through d4. This is the King's Indian setup.",
    ],
  },
};

export const sources: { label: string; url: string }[] = [
  { label: 'Italian Game (Wikipedia)', url: 'https://en.wikipedia.org/wiki/Italian_Game' },
  { label: 'Ruy Lopez (Wikipedia)', url: 'https://en.wikipedia.org/wiki/Ruy_Lopez' },
  { label: 'Scotch Game (Wikipedia)', url: 'https://en.wikipedia.org/wiki/Scotch_Game' },
  { label: 'Sicilian Defence (Wikipedia)', url: 'https://en.wikipedia.org/wiki/Sicilian_Defence' },
  { label: 'Nicolas Rossolimo by Edward Winter (Chess Notes)', url: 'https://www.chesshistory.com/winter/extra/rossolimo.html' },
  { label: 'Nicolas Rossolimo (Wikipedia)', url: 'https://en.wikipedia.org/wiki/Nicolas_Rossolimo' },
  { label: 'French Defence (Wikipedia)', url: 'https://en.wikipedia.org/wiki/French_Defence' },
  { label: 'Caro–Kann Defence (Wikipedia)', url: 'https://en.wikipedia.org/wiki/Caro%E2%80%93Kann_Defence' },
  { label: 'Scandinavian Defense (Wikipedia)', url: 'https://en.wikipedia.org/wiki/Scandinavian_Defense' },
  { label: 'Pirc Defence (Wikipedia)', url: 'https://en.wikipedia.org/wiki/Pirc_Defence' },
  { label: "Queen's Gambit (Wikipedia)", url: 'https://en.wikipedia.org/wiki/Queen%27s_Gambit' },
  { label: 'London System (Wikipedia)', url: 'https://en.wikipedia.org/wiki/London_System' },
  { label: 'Indian Defence (Wikipedia)', url: 'https://en.wikipedia.org/wiki/Indian_Defence' },
  { label: 'Nimzo-Indian Defence (Wikipedia)', url: 'https://en.wikipedia.org/wiki/Nimzo-Indian_Defence' },
  { label: "King's Indian Defence (Wikipedia)", url: 'https://en.wikipedia.org/wiki/King%27s_Indian_Defence' },
];
