# Aplikace pro dobrovolnickou brigádu SummerJob

Webová aplikace pro organizaci SummerJob, vyvíjená jako diplomová práce na FIT ČVUT v Praze.

## Instalace a první spuštění

Potřebné nástroje:

- [Docker](https://www.docker.com/)
- [Docker Compose](https://docs.docker.com/compose/)

Po naklonování repozitáře je potřeba nastavit connection string pro připojení k databázi. Aplikace využívá databázi PostgreSQL.

Použitý framework Next.js využívá soubor `.env` pro nastavení proměnných prostředí a proměnné vkládá do kódu [během kompilace](https://nextjs.org/docs/basic-features/environment-variables), je tedy nutné je nastavit před sestavením kontejneru a není možné je specifikovat později při spouštění kontejneru.

### Složka `web`

Přejmenujte soubor `.env.sample` na `.env` a nastavte všechny potřebné údaje podle instrukcí v souboru. Zvolte libovolné jméno a heslo pro připojení k databázi.

Následně je možné sestavit docker image pro web a pro pomocné nástroje (nastavení databáze):

```console
[repo/web]$ docker build -t summerjob/web .
[repo/web]$ docker build -t summerjob/scripts -f Dockerfile.scripts .
```

### Složka `planner`

Sestavte docker image pro Plánovač:

```console
[repo/planner]$ docker build -t summerjob/planner .
```

### Kořenová složka projektu

Vytvořte docker síť, do které budou připojeny kontejnery:

```console
[repo]$ docker network create summerjob-network
```

Upravte soubor `docker-compose.yaml` a nastavte všechny potřebné proměnné prostředí, parametry pro připojení Plánovače (`summerjob-planner`) a jméno sítě, pokud je jiné než `summerjob-network`. Zejména se jedná o změny následujících proměnných:

- summerjob-web
  - `DATABASE_URL` - connection string pro připojení k databázi, nahraďte `username` a `password` libovolným uživatelským jménem a heslem pro připojení k databázi
  - `EMAIL_SERVER` - connection string SMTP serveru pro odesílání e-mailů
  - `EMAIL_USER` - uživatelské jméno použité k odesílání e-mailů
  - `NEXTAUTH_URL` - Webová adresa, na které bude aplikace dostupná (nebo `http://localhost:3000` v případě lokálního spuštění)
  - `NEXTAUTH_SECRET` - libovolný řetězec, který slouží jako tajný klíč pro generování tokenů, `openssl rand -base64 32`
- summerjob-db
  - `POSTGRES_USER` - uživatelské jméno pro připojení k databázi, stejné jako v connection string pro web
  - `POSTGRES_PASSWORD` - heslo pro připojení k databázi, stejné jako v connection string pro web
  - `POSTGRES_DB` - jméno databáze, stejné jako v connection string pro web
- summerjob-planner
  - `DATABASE_URL` - connection string pro připojení k databázi, stejný jako connection string pro web

Nyní je možné spustit kontejnery pomocí docker-compose:

```console
[web]$ docker compose up -d
```

### Nastavení databáze

Do databáze je nutné propsat schéma a vytvořit první administrátorský účet. Vytvořte kontejner pomocí image `summerjob/scripts` a spustťe příkaz na vytvoření schématu. Následně spusťte příkaz na vytvoření prvního administrátorského účtu:

```console
[web]$ docker run --rm --network summerjob-network -it summerjob/scripts
root@<container-id>:/app# npx prisma db push
root@<container-id>:/app# npm run create-admin
Průvodce vytvořením prvního administrátorského účtu
Zadejte ...

root@<container-id>:/app# exit
```

Databáze si pamatuje data i po restartu kontejneru, takže krok výše je potřeba provést pouze jednou.

Aplikace je nyní dostupná na adrese `http://localhost:3000`.

## Spouštění a zastavování

Pro spuštění a zastavování aplikace je možné použít příkazy `docker compose`:

```console
[web]$ docker compose up -d
```

```console
[web]$ docker compose down
```

Aplikace běží na adrese `http://localhost:3000`.

## Procházení databáze

Pro inspekci databáze je možné použít například aplikaci pgAdmin. Pokud chceme pouze zobrazit a upravit data v tabulkách summerjobu, je možné použít nástroj [Prisma Studio](https://www.prisma.io/studio). Pro jeho spuštění je potřeba vytvořit kontejner pomocí image `summerjob/scripts` a použít příkaz na spuštění Prisma Studio:

```console
[web]$ docker run --rm --network summerjob-network -it -p 5555:5555 summerjob/scripts
root@<container-id>:/app# npx prisma studio
Prisma Studio is running at http://localhost:5555 ...
```

Prisma Studio je nyní dostupné na adrese `http://localhost:5555`.

Pokud běží aplikace na vzdáleném systému, kde není vhodné otevírat porty, je možné využít SSH tunelování. V tomto případě je potřeba vytvořit SSH tunel na port 5555 a poté spustit Prisma Studio, na které se následně půjde připojit lokálně:

```console
[local]$ ssh -L 5555:<remote-host>:5555 <remote-user>@<remote-host>
[remote]$ docker run --rm --network summerjob-network -it -p 5555:5555 summerjob/scripts
root@<container-id>:/app# npx prisma studio
Prisma Studio is running at http://localhost:5555 ...
```

## Troubleshooting

### Poskytovatel e-mailů zablokoval odesílání

Při odesílání většího množství e-mailů může dojít k dosažení limitu poskytovatele a následnému dočasnému zablokování odesílání. V takovém případě se není možné přihlásit do aplikace přes webové rozhraní a v logu kontejneru se objeví chyba odesílání, typicky `451`.

Aby se tomuto problému předešlo, nastavuje se platnost přihlášení na 30 dní, což pokryje celé trvání ročníku SummerJobu.

Pokud by však bylo nutné přihlásit administrátora či člena týmu a není možné počkat na uvolnění limitu (obvykle desítky minut až jednotky hodin), je možné provést nouzové vygenerování nové session cookie:

```console
[web]$ docker run --rm --network summerjob-network -it -p 5555:5555 summerjob/scripts
root@<container-id>:/app# npm run create-session
Zadejte email: admin@example.cz
Session token vytvořen:
  Název cookie: session-token
  Hodnota cookie: <session-token>
  ...
```

## Vývoj

Potřebné nástroje navíc:

- [Node.js](https://nodejs.org/en/)
- Databáze (může být v Dockeru)
- Fronta AMQP (např. RabbitMQ v Dockeru)

Stejným způsobem jako výše nastavíme všechny potřebné údaje v souboru `.env`.
Alternativně je možné použít např. soubor `.env.local` [a další](https://nextjs.org/docs/basic-features/environment-variables), aby nebylo nutné měnit soubor `.env`.

Následně nainstalujeme závislosti pomocí `npm` a spustíme aplikaci:

```console
[web]$ npm install
[web]$ npm run dev
```

Tento příkaz spustí aplikaci v režimu vývoje, který automaticky restartuje aplikaci po každé změně v kódu. Aplikace je dostupná na adrese `http://localhost:3000`.

Obdobně je možné spustit i Plánovač. Ve složce `planner` přejmenujte `.env.sample` na `.env` a nastavte všechny potřebné údaje stejné jako v `docker-compose.yaml`. Následně je možné program spustit:

```console
[planner]$ npm install
[planner]$ npm run start
```

### Smazání a seedování databáze

Pro smazání databáze je možné použít připravený skript:

```console
[web]$ npm run delete-db
```

Pro seedování jsou k dispozici následující skripty:

- `seed` - Vytvoří 100 uživatelů a přibližně 70 jobů a další potřebná data.
- `seed-mini` - Vytvoří 5 uživatelů, malé množství jobů a další potřebná data.

```console
[web]$ npm run seed
```

### Úprava dat v databázi

Pro úpravu dat v databázi je možné použít nástroj [Prisma Studio](https://www.prisma.io/studio).

```console
[web]$ npx prisma studio
```

### Přihlašování

Během vývoje je zablokováno odesílání e-mailů a uživateli je povoleno přihlášení na libovolnou e-mailovou adresu.

Session cookies se nastavují jako Http Only a není je tedy možné odstranit automaticky, pokud dojde například ke změně dat v databázi. Před přihlášením je tedy nutné smazat cookie `next-auth.session-token` v prohlížeči.
