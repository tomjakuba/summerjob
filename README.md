# Aplikace pro dobrovolnickou brigádu SummerJob

Webová aplikace pro organizaci SummerJob, vyvíjená jako diplomová práce na FIT ČVUT v Praze.

## Instalace a první spuštění

Tato aplikace je stále ve fázi vývoje a proces instalace se může změnit.

Potřebné nástroje:

- [Docker](https://www.docker.com/)
- [Docker Compose](https://docs.docker.com/compose/)

Po naklonování repozitáře je potřeba nastavit connection string pro připojení k databázi. Aplikace využívá databázi PostgreSQL, ale mělo by být možné použít i další SQL databáze. Přejmenujte soubor `.env.sample` na `.env` a zvolte libovolné uživatelské jméno a heslo pro připojení k databázi:

Ukázka možného nastavení:

```console
[web/summerjob]$ cat .env
DATABASE_URL="postgresql://username:password@summerjob-db:5432/summerjob?schema=public"
```

Následně je možné sestavit docker image pro web a pro pomocné nástroje (nastavení databáze):

```console
[web/summerjob]$ docker build -t summerjob/web .
[web/summerjob]$ docker build -t summerjob/scripts -f Dockerfile.scripts .
```

Vytvoříme si docker síť, do které budeme připojovat kontejnery:

```console
[web/summerjob]$ docker network create summerjob-network
```

Upravíme soubor `web/docker-compose.yaml` a nastavíme uživatelské jméno a heslo pro připojení k databázi (stejné jako v `.env`) a jméno sítě:

```console
[web]$ cat docker-compose.yaml
version: "3"

services:
  summerjob-web:
  ...
    networks:
      - summerjob-network

  summerjob-db:
    ...
    environment:
      POSTGRES_USER: username
      POSTGRES_PASSWORD: password
      POSTGRES_DB: summerjob
    networks:
      - summerjob-network

networks:
  summerjob-network:
    external: true

...
```

Nyní je možné spustit kontejnery pomocí docker-compose:

```console
[web]$ docker compose up -d
```

Do databáze je nutné propsat schéma. Vytvoříme si kontejner pomocí image `summerjob/scripts` a spustíme příkaz na vytvoření schématu. Volitelně je možné vložit do databáze i testovací data:

```console
[web]$ docker run --rm --network summerjob-network -it summerjob/scripts
root@<container-id>:/app# npx prisma db push
root@<container-id>:/app# npm run seed
root@<container-id>:/app# exit
```

Databáze si pamatuje data i po restartu kontejneru, takže krok výše je potřeba provést pouze jednou.

Aplikace je nyní dostupná na adrese `http://localhost:3000`.

## Spouštění a zastavování

Pro spuštění a zastavování aplikace je možné použít příkazy docker-compose:

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
```

Prisma Studio je nyní dostupné na adrese `http://localhost:5555`.

Pokud běží aplikace na vzdáleném systému, kde není vhodné otevírat porty, je možné využít SSH tunelování. V tomto případě je potřeba vytvořit SSH tunel na port 5555 a poté spustit Prisma Studio, na které se následně půjde připojit lokálně:

```console
[local]$ ssh -L 5555:<remote-host>:5555 <remote-user>@<remote-host>
```

## Spuštění pro vývoj

Potřebné nástroje navíc:

- [Node.js](https://nodejs.org/en/)
- Databáze (může být v Dockeru)

Stejným způsobem jako výše nastavíme connection string pro připojení k databázi.

Následně nainstalujeme závislosti pomocí `npm` a spustíme aplikaci:

```console
[web/summerjob]$ npm install
[web/summerjob]$ npm run dev
```

Tento příkaz spustí aplikaci v režimu vývoje, který automaticky restartuje aplikaci po každé změně v kódu. Aplikace je dostupná na adrese `http://localhost:3000`.
