# Webová část aplikace SummerJob plánovač

## Vývoj

Potřebné nástroje navíc:

- [Node.js](https://nodejs.org/en/)
- Databáze (může být v Dockeru)
- Fronta AMQP (např. RabbitMQ v Dockeru)

Přejmenujte soubor `.env.sample` na `.env` ve složce `web` a nastavte všechny potřebné údaje.

Následně nainstalujte závislosti pomocí `npm` a spusťte aplikaci:

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
