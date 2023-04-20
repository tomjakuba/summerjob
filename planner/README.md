# Plánovací komponenta aplikace SummerJob Plánovač

Automatický plánovací systém. Aplikace přijímá data přes AMQP s ID plánu na naplánování, získá z databáze potřebné informace a po naplánování uloží výsledek do databáze. Komunikace v opačném směru přes AMQP neprobíhá.

Aplikace pro komunikaci s databází využívá [Prisma](https://www.prisma.io/).

## Popis zpracování dat

Plánování probíhá v následujících krocích:

- Spuštěním aplikace dojde k připojení do AMQP fronty zpráv pomocí souboru `src/receive.ts` a systém čeká na příchozí zprávu s ID plánu k naplánování v následujícím formátu: `{"planId": "<uuid here>"}`.
- Po přijetí zprávy a ověření struktury dojde k zavolání konkrétního plánovače, kterému je předán zdroj dat. Tyto komponenty implementují rozhraní `Planner` a `DataSource` a je tedy možné vytvořit vlastní plánovač. Výchozí plánovač je v `src/planners/BasicPlanner.ts` a zdroj dat je `src/datasources/Prisma.ts`.
- Plánovač získá pomocí zdroje dat z databáze potřebné informace a naplánuje plán. Výsledek vrátí a volající (`receive.ts`) jej uloží do databáze.
- Po naplánování se zpráva z fronty automaticky smaže a aplikace čeká na další zprávu.

## Základní plánovač (BasicPlanner)

Základní plánovač je implementován v `src/planners/BasicPlanner.ts`. Plánovač je založen na jednoduchém algoritmu na principu [Hladového algoritmu](https://cs.wikipedia.org/wiki/Hladov%C3%BD_algoritmus). Plánovač bere v potaz alergie, adorace, sdílené jízdy, dostupnost pracantů atd. tak, aby tvořil korektní plán. Jediná výjimka akceptovatelná pro plánovač je přiřazení adorujícího pracanta k jobu, který není v oblasti adorace. To se může stát například v případě, že na jobech v oblasti adorace nejsou volná místa.

Plánovač je spuštěn pomocí funkce `start`.
Po načtení dat ze zdroje dat probíhá plánování v následujících krocích:

- Naplnění všech jobů do minima, které je pro job možné. Plánovač přiřadí požadované minimum silných pracantů, normálních pracantů, pokusí se najít sdílenou jízdu, popř. přiřadí řidiče, určí zodpovědného pracanta. Po skončení tohoto kroku jsou všechny joby naplněny do minima a neobsahují chyby. Probíhá v `planJobsRecursive`.
- Doplnění všech jobů o další pracanty do _min(kapacita jobu, kapacita auta)_. Do jobů se doplňují náhodně silní a obyčejní pracanti, ale ne majitelé aut. Probíhá v `planFillJobs`.
- Joby jsou seřazeny podle počtu chybějících pracantů do maximální kapacity jobu sestupně. Do jobů se přiřazují zbylí volní řidiči, pokud je na jobu >= 2 volných míst. Pokud jsou v jobu pracanti, kteří mají naplánovanou sdílenou dopravu s řidičem z jiného jobu, jsou z dopravy odebráni a přidáni do auta nově přiřazeného řidiče. Odpovídá funkci `addExtraDrivers`.
- Doplnění všech jobů o další pracanty do _min(kapacita jobu, kapacita přiřazených aut)_. Do jobů se doplňují náhodně silní i obyčejní pracanti i řidiči, ale není vytvářena nová ani sdílená doprava. Probíhá v `planFillJobs`.

Výsledek ze z funkce vrácen a volající se postará o uložení do databáze.

## Tvorba vlastního plánovače

Vlastní plánovač je možné vytvořit implementací rozhraní `Planner` a využít existujícího zdroje dat, popř. vytvořit vlastní zdroj. Vzhledem k tomu, že komunikace probíhá jednosměrně přes protokol AMQP, je možné i vytvořit vlastní plánovač v libovolném jazyce a tuto implementaci zcela nahradit.
