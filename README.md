# Dynasty Draft Companion and Franchise Rankings

This is a Node/React based web app that provides some helpful assistance for dynasty leagues, especially those with multiple copies per player. This app integrates directly with MFL APIs to provide real-time draft updates and franchise rankings.

- **Draft Companion** provides an overview of the current draft status, depth charts, list of remaining player copies, as well as estimates for who might be available for a franchise's draft picks.
  - See [http://companion.onside.io/](http://companion.onside.io/) for an example.
- **Franchise Rankings** provides depth charts and franchise rankings based on FantasyPros player rankings.
  - See [http://companion.onside.io/ranks](http://companion.onside.io/ranks) for an example.

## Notice

This was a rushed 20 hour weekend project, and as such, the code quality is fairly poor and cuts a lot of corners. It's specifically designed for a 96-team league with 6 copies per player, so it may work incorrectly or not at all for other leagues.

This project is provided for educational purposes and has no guarantees.

## Usage

After configuring the application (see below), the application can be run on platforms supporting Node >= 4.0. It runs inefficiently and tends to crash occasionally in production (due to memory usage), so run it with a process manager that will automatically restart it after a crash. To run safely, it requires around 512mb of memory, but 256mb should be fine if you don't mind it crashing and restarting.

**Production (via process manager like PM2):**

```
npm install
npm run prestart
node lib/index.js
```

**Production (via npm script):**

```
npm install
npm start
```

**Development:**

```
npm install
npm run dev
```

## Configuration

- Copy `config.example.js` as `config.js`. The example config provides descriptions of each property along with example values.
- Update `config.js` with options for your league.
- That's it.

## License

This app is released under the **MIT license**, meaning you can use it or repurpose it for whatever you want. Attribution is appreciated if UI/UX features such as depth charts are cloned or copied.

## Copyright

(c) 2016-2017 Andy Kant

