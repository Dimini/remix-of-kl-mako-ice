// Per-kraj contextual framing for the RegionImpact section.
// Sources are general public knowledge (SHMÚ, IUR, INESS, news reports).
// This is contextual framing, NOT candidate scoring — no citations stored.

export type RegionStat = {
  iconKey: "health" | "wallet" | "air" | "trees" | "wind" | "bus" | "zap" | "recycle" | "drop";
  label: string;
  desc: string;
};

export type RegionImpactRow = {
  iconKey: "wind" | "trees" | "bus" | "zap" | "recycle" | "drop" | "heart" | "wallet";
  issue: string;
  influence: string; // Ako to ovplyvňujú župan / primátor
  matters: string;   // Prečo to ovplyvňuje obyvateľov
};

export type RegionImpact = {
  capital: string;
  intro: string;
  stats: RegionStat[];           // 3 cards (Zdravie / Peňaženka / Ovzdušie alebo podobne)
  rows: RegionImpactRow[];       // 5 issue rows
};

export const REGION_IMPACT: Record<string, RegionImpact> = {
  // ────────────────────── BRATISLAVSKÝ KRAJ ──────────────────────
  BA: {
    capital: "Bratislava",
    intro:
      "Bratislavský kraj je hospodárskym motorom Slovenska, no platí za to dopravnými zápchami, miznúcimi zelenými plochami v Petržalke a Ružinove a tlakom na pitnú vodu zo Žitného ostrova.",
    stats: [
      {
        iconKey: "health",
        label: "Zdravie",
        desc: "Doprava na D1, D2 a Prístavnom moste je hlavným zdrojom NO₂ a prachu — Bratislava pravidelne prekračuje limity WHO.",
      },
      {
        iconKey: "wallet",
        label: "Peňaženka",
        desc: "Domácnosti v Petržalke majú jedny z najvyšších nákladov na chladenie v lete kvôli panelovým bytom bez tieňa.",
      },
      {
        iconKey: "drop",
        label: "Voda",
        desc: "Žitný ostrov — najväčšia zásobáreň pitnej vody v strednej Európe — je ohrozený poľnohospodárskou chémiou a starými skládkami (Vrakuňa).",
      },
    ],
    rows: [
      {
        iconKey: "bus",
        issue: "Doprava a MHD",
        influence: "Župan rozhoduje o regionálnych autobusoch a IDS BK. Primátor o električkách, MHD a parkovacej politike.",
        matters: "Lepšia integrácia BID a nová električka do Petržalky znížia denné zápchy a ušetria hodiny v aute.",
      },
      {
        iconKey: "trees",
        issue: "Zelené plochy a tepelné ostrovy",
        influence: "Mesto rozhoduje o zachovaní lesoparku, výsadbe stromov v Petržalke a regulácii zástavby.",
        matters: "V lete teploty v centre prekračujú 38 °C — viac stromov priamo znižuje úmrtnosť seniorov v horúčavách.",
      },
      {
        iconKey: "drop",
        issue: "Žitný ostrov a pitná voda",
        influence: "Župan koordinuje s vodármi, štátom a poľnohospodármi ochranné pásma.",
        matters: "Bez ochrany hrozí, že budúcich 20 rokov budeme platiť za drahšiu dovážanú vodu — ako vo Vrakuni.",
      },
      {
        iconKey: "zap",
        issue: "Energetická obnova bytoviek",
        influence: "Mesto a kraj rozdeľujú eurofondy na zatepľovanie a fotovoltiku na školách a úradoch.",
        matters: "Zateplený panelák ušetrí domácnosti 200–500 € ročne na kúrení.",
      },
      {
        iconKey: "wind",
        issue: "Smog a doprava cez mesto",
        influence: "Primátor môže zaviesť nízkoemisné zóny, drahšie parkovanie pre dieselové autá a zlepšiť P+R.",
        matters: "Menej áut v centre = menej astmy u detí a kratšie čakanie sanitiek v zápchach.",
      },
    ],
  },

  // ────────────────────── TRNAVSKÝ KRAJ ──────────────────────
  TT: {
    capital: "Trnava",
    intro:
      "Trnavský kraj je obilnicou Slovenska a zároveň najsuchším regiónom — sucho, závlahy a budúcnosť jadrovej elektrárne Jaslovské Bohunice sú témy, o ktorých rozhoduje župa.",
    stats: [
      {
        iconKey: "drop",
        label: "Sucho",
        desc: "Podunajská nížina patrí medzi oblasti s najrýchlejším poklesom hladiny spodných vôd v EÚ.",
      },
      {
        iconKey: "wallet",
        label: "Peňaženka",
        desc: "Závod Stellantis (PSA) je najväčší zamestnávateľ — jeho prechod na elektromobilitu rozhodne o tisíckach pracovných miest.",
      },
      {
        iconKey: "zap",
        label: "Energia",
        desc: "Jaslovské Bohunice (V1 demontáž, nový zdroj?) sú strategickým zdrojom — kraj má hlas v plánovaní.",
      },
    ],
    rows: [
      {
        iconKey: "drop",
        issue: "Sucho a závlahy",
        influence: "Župan koordinuje s SVP a poľnohospodármi obnovu závlahových systémov a vodozádržných opatrení.",
        matters: "Bez závlah klesnú úrody, vyššie ceny chleba a zeleniny doplatia všetci spotrebitelia.",
      },
      {
        iconKey: "bus",
        issue: "Železničné spojenie Trnava–Bratislava",
        influence: "Kraj tlačí na ŽSR a štát na dvojkoľajku a zrýchlenie spojov.",
        matters: "Tisícky ľudí dochádzajú denne do BA — lepší vlak = menej áut na D1 a viac času s rodinou.",
      },
      {
        iconKey: "zap",
        issue: "Jadrová energetika a teplo",
        influence: "Župan zastupuje región pri rozhodnutiach o nových blokoch a využití odpadového tepla z JE.",
        matters: "Lacné odpadové teplo z Bohuníc by mohlo vykurovať Trnavu a Hlohovec za zlomok ceny plynu.",
      },
      {
        iconKey: "wind",
        issue: "Priemyselné emisie",
        influence: "Primátor reguluje umiestňovanie nových prevádzok a kontrolu existujúcich (Stellantis, ZF).",
        matters: "V Trnave sa periodicky prekračujú limity prachu — najmä v zime kombináciou priemyslu a kúrenia.",
      },
      {
        iconKey: "trees",
        issue: "Krajinotvorba a vetrolamy",
        influence: "Kraj rozhoduje o obnove vetrolamov a remízok rozoraných v 70. rokoch.",
        matters: "Vetrolamy znižujú odnos pôdy, chránia úrody a vrátili by tieň do prehrievanej krajiny.",
      },
    ],
  },

  // ────────────────────── TRENČIANSKY KRAJ ──────────────────────
  TN: {
    capital: "Trenčín",
    intro:
      "Trenčiansky kraj žije transformáciou hornej Nitry — útlmom baní v Handlovej a Novákoch, hľadaním nových pracovných miest a riešením znečistenia z chemického priemyslu.",
    stats: [
      {
        iconKey: "wallet",
        label: "Peňaženka",
        desc: "Handlová a Prievidza dostávajú miliardy z Fondu spravodlivej transformácie — kto a ako ich utratí, rozhoduje kraj.",
      },
      {
        iconKey: "air",
        label: "Ovzdušie",
        desc: "Nováky a okolie patrili medzi ekologicky najzaťaženejšie územia SR — odkaz po elektrárni a chémii pretrváva.",
      },
      {
        iconKey: "health",
        label: "Zdravie",
        desc: "V regióne sú nadpriemerné výskyty rakoviny pľúc — historicky spojené s baníctvom a spaľovaním uhlia.",
      },
    ],
    rows: [
      {
        iconKey: "zap",
        issue: "Spravodlivá transformácia hornej Nitry",
        influence: "Župan riadi Akčný plán transformácie — kde vzniknú nové fabriky, rekvalifikácie, geotermál.",
        matters: "Po zatvorení baní v 2023 ide o tisíce rodín — buď nové stabilné práce, alebo odliv ľudí z regiónu.",
      },
      {
        iconKey: "wind",
        issue: "Znečistenie z chemického priemyslu",
        influence: "Kraj kontroluje povolenia pre Fortischem (Nováky) a podobné prevádzky.",
        matters: "Ortuťová kontaminácia rieky Nitra je jeden z najhorších envirohriechov SR — ovplyvňuje vodu aj ryby.",
      },
      {
        iconKey: "drop",
        issue: "Rieka Váh a povodne",
        influence: "Župan koordinuje protipovodňové opatrenia s SVP — prirodzené poldre vs. betónové hrádze.",
        matters: "Trenčín, Nové Mesto a Púchov majú opakované problémy s veľkou vodou — opatrenia chránia majetok.",
      },
      {
        iconKey: "bus",
        issue: "Železnica a obchvaty",
        influence: "Kraj tlačí na modernizáciu trate Bratislava–Žilina a obchvat Trenčína.",
        matters: "Lepšie vlaky a obchvat = menej kamiónov v centre Trenčína a tichšie noci.",
      },
      {
        iconKey: "trees",
        issue: "Lesné kalamity a kôrovec",
        influence: "Kraj koordinuje s Lesmi SR obnovu kalamitných plôch v Strážovských vrchoch.",
        matters: "Mŕtve smrečiny zvyšujú riziko požiarov a povodní — obnova chráni domy v podhorí.",
      },
    ],
  },

  // ────────────────────── NITRIANSKY KRAJ ──────────────────────
  NR: {
    capital: "Nitra",
    intro:
      "Nitriansky kraj kombinuje úrodnú Podunajskú nížinu, Jaguar Land Rover a jadrovú elektráreň Mochovce — sucho, dopravné zaťaženie a budúcnosť priemyslu sú každodenné témy.",
    stats: [
      {
        iconKey: "drop",
        label: "Voda",
        desc: "Podunajská nížina trpí najsilnejším suchom v SR — JLR navyše spotrebuje obrovské množstvá vody.",
      },
      {
        iconKey: "wallet",
        label: "Peňaženka",
        desc: "JLR a dodávatelia sú motorom regiónu — prechod na elektromobilitu rozhodne o tisíckach miest.",
      },
      {
        iconKey: "zap",
        label: "Energia",
        desc: "Mochovce (3. a 4. blok) zabezpečujú energetickú sebestačnosť SR — kraj má slovo pri bezpečnosti.",
      },
    ],
    rows: [
      {
        iconKey: "bus",
        issue: "Doprava okolo JLR a R1",
        influence: "Župan tlačí na dostavbu R7/R8 a regionálne autobusy pre dochádzajúcich do JLR.",
        matters: "Tisíce áut denne smerujú do priemyselného parku — lepšia MHD ušetrí palivo a čas.",
      },
      {
        iconKey: "drop",
        issue: "Sucho v Podunajskej nížine",
        influence: "Kraj koordinuje obnovu závlah a vodozádržných nádrží.",
        matters: "Slovensko stráca pôdnu vlhkosť — bez závlah klesnú úrody zeleniny aj obilia.",
      },
      {
        iconKey: "trees",
        issue: "Záber poľnohospodárskej pôdy",
        influence: "Kraj rozhoduje o územnom plánovaní — ďalšie haly vs. ochrana ornice.",
        matters: "Najúrodnejšia pôda SR sa pod halami stráca natrvalo — ovplyvňuje potravinovú sebestačnosť.",
      },
      {
        iconKey: "wind",
        issue: "Ovzdušie v Nitre a Šali",
        influence: "Primátor reguluje kúrenie tuhým palivom a podporuje výmenu kotlov.",
        matters: "Šaľa (Duslo) a Nitra majú v zime smogové epizódy — priamy vplyv na astmu detí.",
      },
      {
        iconKey: "zap",
        issue: "Mochovce a teplo",
        influence: "Kraj môže iniciovať využitie odpadového tepla pre Levice a okolie.",
        matters: "Lacné teplo z JE = stovky eur úspory ročne pre domácnosti namiesto plynu.",
      },
    ],
  },

  // ────────────────────── ŽILINSKÝ KRAJ ──────────────────────
  ZA: {
    capital: "Žilina",
    intro:
      "Žilinský kraj zviera smog v dolinách (geografická pasca pod Malou Fatrou), zápasí s tlakom turizmu na Vysoké a Malé Tatry a buduje budúcnosť okolo automobilky Kia.",
    stats: [
      {
        iconKey: "air",
        label: "Ovzdušie",
        desc: "Žilinská kotlina patrí ku 5 najznečistenejším v SR — inverzie v zime držia smog pri zemi.",
      },
      {
        iconKey: "trees",
        label: "Príroda",
        desc: "Vysoké Tatry, Malá Fatra a Veľká Fatra sú pod tlakom turizmu, výstavby a kalamít smreka.",
      },
      {
        iconKey: "wallet",
        label: "Peňaženka",
        desc: "Kia Slovakia je najväčší zamestnávateľ — jej elektrifikácia ovplyvní celý subdodávateľský reťazec.",
      },
    ],
    rows: [
      {
        iconKey: "wind",
        issue: "Smog v Žilinskej kotline",
        influence: "Primátor zavedie nízkoemisné zóny, kraj dotuje výmenu kotlov na drevo a uhlie.",
        matters: "V zime ZA dlhodobo prekračuje limity PM10 — priamy dopad na detí a seniorov v meste.",
      },
      {
        iconKey: "trees",
        issue: "Tatry a turizmus",
        influence: "Kraj reguluje výstavbu apartmánov, parkoviská a ochranné pásma.",
        matters: "Bez regulácie hrozí, že Tatry skončia ako Donovaly — preplnené, drahé, znehodnotené.",
      },
      {
        iconKey: "bus",
        issue: "Železnica do Bratislavy a Košíc",
        influence: "Kraj tlačí na modernizáciu severného koridoru a integrované cestovné lístky.",
        matters: "Žilina je dopravná križovatka — lepší vlak = menej kamiónov a áut na D1.",
      },
      {
        iconKey: "zap",
        issue: "Vodné elektrárne a Váh",
        influence: "Kraj má slovo pri obnove malých vodných elektrární a ekologických prietokoch.",
        matters: "Malé elektrárne dávajú lacný prúd, ale môžu poškodiť ryby — rovnováha je politická voľba.",
      },
      {
        iconKey: "drop",
        issue: "Lesné kalamity a povodne",
        influence: "Kraj koordinuje s Lesmi SR a SVP obnovu kalamitných plôch a poldre.",
        matters: "Mŕtve smreky v Tatrách zvyšujú riziko povodní v Liptove a na Orave — chránia domy a cesty.",
      },
    ],
  },

  // ────────────────────── BANSKOBYSTRICKÝ KRAJ ──────────────────────
  BB: {
    capital: "Banská Bystrica",
    intro:
      "Banskobystrický kraj je najväčší v SR a najmenej hustý — kúrenie drevom a uhlím, lesné kalamity v Nízkych Tatrách a útlm tradičných závodov definujú jeho výzvy.",
    stats: [
      {
        iconKey: "air",
        label: "Ovzdušie",
        desc: "Lokálne kúrenie tuhým palivom je najväčší zdroj prachu — v Krupine, Žiari a BB sa prekračujú limity.",
      },
      {
        iconKey: "trees",
        label: "Lesy",
        desc: "Nízke Tatry a Polana — kalamity smreka zničili tisíce hektárov, otázka je, ako obnoviť.",
      },
      {
        iconKey: "wallet",
        label: "Peňaženka",
        desc: "Žiar nad Hronom (hliník), Brezno a Detva — budúcnosť priemyslu rozhoduje o stovkách rodín.",
      },
    ],
    rows: [
      {
        iconKey: "wind",
        issue: "Kúrenie tuhým palivom",
        influence: "Kraj a mesto dotujú výmenu starých kotlov na uhlie a drevo za tepelné čerpadlá a plyn.",
        matters: "V malých obciach je kúrenie najväčší zdroj rakovinotvorných benzo(a)pyrénov — priamo v pľúcach.",
      },
      {
        iconKey: "trees",
        issue: "Obnova kalamitných lesov",
        influence: "Kraj koordinuje obnovu — monokultúra smreka vs. zmiešané lesy odolné voči klíme.",
        matters: "Zlá obnova = ďalšie kalamity o 30 rokov a strata vody, dreva aj turizmu pre vnúčatá.",
      },
      {
        iconKey: "zap",
        issue: "Geotermálna energia",
        influence: "Kraj môže podporiť projekty geotermálu (BB má potenciál) namiesto plynu.",
        matters: "Geotermál = lacné stabilné teplo z domácich zdrojov, nezávislé od cien plynu.",
      },
      {
        iconKey: "bus",
        issue: "Vidiecka autobusová doprava",
        influence: "Župan rozhoduje o linkách do malých obcí — aj 1 spoj denne udrží obec živú.",
        matters: "Bez autobusu seniori nedostanú lieky, deti nedôjdu do školy — obce vymierajú.",
      },
      {
        iconKey: "drop",
        issue: "Sucho a zachytávanie vody",
        influence: "Kraj môže investovať do vodozádržných nádrží, mokradí a obnovy potokov.",
        matters: "Stredné Slovensko vysychá rýchlejšie ako čakali — voda je prežitie pre poľnohospodárov.",
      },
    ],
  },

  // ────────────────────── PREŠOVSKÝ KRAJ ──────────────────────
  PO: {
    capital: "Prešov",
    intro:
      "Prešovský kraj je najmladší a najchudobnejší — kombinuje krásu Vysokých Tatier, Pieniny a Slovenský raj s energetickou chudobou v rómskych osadách a slabou infraštruktúrou.",
    stats: [
      {
        iconKey: "wallet",
        label: "Energetická chudoba",
        desc: "PO kraj má najvyšší podiel domácností v energetickej chudobe — kúria často odpadom a mokrým drevom.",
      },
      {
        iconKey: "air",
        label: "Ovzdušie",
        desc: "Lokálne kúrenie a inverzie v Prešove a Poprade vedú k zimným smogovým epizódam.",
      },
      {
        iconKey: "trees",
        label: "Príroda",
        desc: "Pieniny, Slovenský raj, Vysoké a Nízke Tatry — turizmus je šanca aj hrozba.",
      },
    ],
    rows: [
      {
        iconKey: "zap",
        issue: "Energetická chudoba a osady",
        influence: "Kraj môže nasmerovať eurofondy na zatepľovanie a tepelné čerpadlá v marginalizovaných komunitách.",
        matters: "Rodina v osade dnes minie 60 % príjmu na kúrenie — zatepľovanie je sociálna aj envirootázka.",
      },
      {
        iconKey: "drop",
        issue: "Povodne v podtatranských obciach",
        influence: "Župan koordinuje protipovodňovú ochranu a obnovu mokradí v podhorí Tatier.",
        matters: "Bystré toky pod Tatrami pravidelne ničia domy v Spišskej Belej, Kežmarku — opatrenia chránia majetok.",
      },
      {
        iconKey: "bus",
        issue: "Vidiecka MHD a vlaky",
        influence: "Kraj rozhoduje o linkách do okrajových obcí — Snina, Medzilaborce, Stará Ľubovňa.",
        matters: "V mnohých obciach chodí 2 spoje denne — bez auta sa žiť nedá, čo núti mladých odísť.",
      },
      {
        iconKey: "trees",
        issue: "Tatry a turizmus",
        influence: "Kraj reguluje výstavbu, parkoviská a kapacity v TANAP-e.",
        matters: "Vysoké Tatry sú hlavný cestovný ruch SR — zlá regulácia ich znehodnotí na 50 rokov.",
      },
      {
        iconKey: "wind",
        issue: "Ovzdušie v Prešove a Poprade",
        influence: "Mestá môžu zaviesť dotácie na kotly, monitoring a obmedzenia spaľovania odpadu.",
        matters: "V zime smog drží na zemi — astma u detí v PO patrí k najvyšším v SR.",
      },
    ],
  },

  // ────────────────────── KOŠICKÝ KRAJ ──────────────────────
  KE: {
    capital: "Košice",
    intro:
      "Košický kraj je definovaný U.S. Steel — najväčším priemyselným zamestnávateľom aj najväčším znečisťovateľom ovzdušia v SR. Pridáva sa zaostávajúca MHD a deficit zelene v centre.",
    stats: [
      {
        iconKey: "air",
        label: "Ovzdušie",
        desc: "Košice patria medzi mestá s najhorším ovzduším v SR kvôli U.S. Steel a doprave.",
      },
      {
        iconKey: "wallet",
        label: "Peňaženka",
        desc: "U.S. Steel zamestnáva ~10 000 ľudí — jeho dekarbonizácia rozhodne o tisíckach rodín.",
      },
      {
        iconKey: "trees",
        label: "Kvalita života",
        desc: "Košice majú deficit zelených plôch — letné teploty v centre dosahujú až 40 °C.",
      },
    ],
    rows: [
      {
        iconKey: "wind",
        issue: "Emisie z U.S. Steel",
        influence: "Kraj a mesto majú slovo v EIA a v rokovaniach o dekarbonizácii (vodíková redukcia).",
        matters: "Železiarne sú najväčší zdroj prachu v SR — priamo ovplyvňujú astmu a srdcové choroby v Košiciach.",
      },
      {
        iconKey: "bus",
        issue: "Električky a MHD",
        influence: "Primátor rozhoduje o obnove tratí, nových linkách (Sídlisko Ťahanovce) a integrácii s VLAK.",
        matters: "KE má historicky druhú najväčšiu električkovú sieť SR — modernizácia ušetrí čas a vzduch.",
      },
      {
        iconKey: "trees",
        issue: "Zeleň a tepelné ostrovy",
        influence: "Mesto rozhoduje o výsadbe stromov, mestskom parku a ochrane Mestského lesa.",
        matters: "V centre sa v lete dýcha 40 °C — viac stromov priamo zachraňuje životy v horúčavách.",
      },
      {
        iconKey: "zap",
        issue: "Odpadové teplo z U.S. Steel",
        influence: "Mesto a TEKO môžu prepojiť teplárenský systém s odpadovým teplom z huty.",
        matters: "Lacné teplo by mohlo zlacniť kúrenie pre tisíce panelových bytov v Košiciach.",
      },
      {
        iconKey: "drop",
        issue: "Hornád a povodne",
        influence: "Kraj koordinuje protipovodňové opatrenia a revitalizáciu nábrežia Hornádu.",
        matters: "Revitalizácia rieky znamená nové promenády, chládok v lete a ochranu pred záplavami.",
      },
    ],
  },
};
