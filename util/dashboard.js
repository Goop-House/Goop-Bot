
const url = require("url");
const path = require("path");

const Discord = require("discord.js");

const express = require("express");
const app = express();
const moment = require("moment");
require("moment-duration-format");


const passport = require("passport");
const session = require("express-session");
const SQLiteStore = require("connect-sqlite3")(session);
const Strategy = require("passport-discord").Strategy;


const helmet = require("helmet");

const md = require("marked");

module.exports = (client) => {
  
  const dataDir = path.resolve(`${process.cwd()}${path.sep}dashboard`);

  
  const templateDir = path.resolve(`${dataDir}${path.sep}templates`);

  
  app.use("/public", express.static(path.resolve(`${dataDir}${path.sep}public`)));


  passport.serializeUser((user, done) => {
    done(null, user);
  });
  passport.deserializeUser((obj, done) => {
    done(null, obj);
  });


  passport.use(new Strategy({
    clientID: client.application.id,
    clientSecret: client.config.dashboard.oauthSecret,
    callbackURL: client.config.dashboard.callbackURL,
    scope: ["identify", "guilds"]
  },
  (accessToken, refreshToken, profile, done) => {
    process.nextTick(() => done(null, profile));
  }));

  

  app.use(session({
    store: new SQLiteStore({ 
      dir: "./data"
    }),
    secret: client.config.dashboard.sessionSecret,
    resave: false,
    saveUninitialized: false,
  }));

  app.use(passport.initialize());
  app.use(passport.session());
  app.use(helmet());

  app.locals.domain = client.config.dashboard.domain;
  
  app.engine("html", require("ejs").renderFile);
  app.set("view engine", "html");


  var bodyParser = require("body-parser");
  app.use(bodyParser.json());       // to support JSON-encoded bodies
  app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
    extended: true
  })); 


  function checkAuth(req, res, next) {
    if (req.isAuthenticated()) return next();
    req.session.backURL = req.url;
    res.redirect("/login");
  }


  const renderTemplate = (res, req, template, data = {}) => {
    const baseData = {
      bot: client,
      path: req.path,
      user: req.isAuthenticated() ? req.user : null
    };
    res.render(path.resolve(`${templateDir}${path.sep}${template}`), Object.assign(baseData, data));
  };


  app.get("/login", (req, res, next) => {
    if (req.session.backURL) {
      next();
    } else if (req.headers.referer) {
      const parsed = url.parse(req.headers.referer);
      if (parsed.hostname === app.locals.domain) {
        req.session.backURL = parsed.path;
      }
    } else {
      req.session.backURL = "/";
    }
    next();
  },
  passport.authenticate("discord"));

  app.get("/callback", passport.authenticate("discord", { failureRedirect: "/autherror" }), (req, res) => {
    client.owners.includes(req.user.id) ? req.session.isAdmin = true : req.session.isAdmin = false;
    if (req.session.backURL) {
      const url = req.session.backURL;
      req.session.backURL = null;
      res.redirect(url);
    } else {
      res.redirect("/");
    }
  });
  app.get("/discord", (req, res) => {
    res.redirect("https://discord.gg/ebAA7WDxry");
  });
  
  app.get("/autherror", (req, res) => {
    renderTemplate(res, req, "autherror.ejs");
  });

  app.get("/logout", function(req, res) {
    req.session.destroy(() => {
      req.logout();
      res.redirect("/"); 
    });
  });

  app.get("/", (req, res) => {
    renderTemplate(res, req, "index.ejs");
  });


  app.get("/commands", (req, res) => {
    renderTemplate(res, req, "commands.ejs", {md});
  });
  
  app.get("/stats", (req, res) => {
    const duration = moment.duration(client.uptime).format(" D [days], H [hrs], m [mins], s [secs]");
    const members = client.guilds.cache.reduce((p, c) => p + c.memberCount, 0);
    const textChannels = client.channels.cache.filter(c => c.type === "text").size;
    const voiceChannels = client.channels.cache.filter(c => c.type === "voice").size;
    const guilds = client.guilds.cache.size;
    renderTemplate(res, req, "stats.ejs", {
      stats: {
        servers: guilds,
        members: members,
        text: textChannels,
        voice: voiceChannels,
        uptime: duration,
        memoryUsage: (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2),
        dVersion: Discord.version,
        nVersion: process.version
      }
    });
  });

  app.get("/dashboard", checkAuth, (req, res) => {
    const perms = Discord.Permissions;
    renderTemplate(res, req, "dashboard.ejs", {perms});
  });

  app.get("/admin", checkAuth, (req, res) => {
    if (!req.session.isAdmin) return res.redirect("/");
    renderTemplate(res, req, "admin.ejs");
  });

  app.get("/dashboard/:guildID", checkAuth, (req, res) => {
    res.redirect(`/dashboard/${req.params.guildID}/manage`);
  });

  app.get("/dashboard/:guildID/manage", checkAuth, (req, res) => {
    const guild = client.guilds.cache.get(req.params.guildID);
    if (!guild) return res.status(404);
    const isManaged = guild && !!guild.member(req.user.id) ? guild.member(req.user.id).permissions.has("MANAGE_GUILD") : false;
    if (!isManaged && !req.session.isAdmin) res.redirect("/");
    renderTemplate(res, req, "guild/manage.ejs", {guild});
  });


  app.post("/dashboard/:guildID/manage", checkAuth, (req, res) => {
    const guild = client.guilds.cache.get(req.params.guildID);
    if (!guild) return res.status(404);
    const isManaged = guild && !!guild.member(req.user.id) ? guild.member(req.user.id).permissions.has("MANAGE_GUILD") : false;
    if (!isManaged && !req.session.isAdmin) res.redirect("/");
    client.writeSettings(guild.id, req.body);
    res.redirect("/dashboard/"+req.params.guildID+"/manage");
  });

  app.get("/dashboard/:guildID/members", checkAuth, async (req, res) => {
    const guild = client.guilds.cache.get(req.params.guildID);
    if (!guild) return res.status(404);
    renderTemplate(res, req, "guild/members.ejs", {
      guild: guild,
      members: guild.members.cache.array()
    });
  });

  app.get("/dashboard/:guildID/members/list", checkAuth, async (req, res) => {
    const guild = client.guilds.cache.get(req.params.guildID);
    if (!guild) return res.status(404);
    if (req.query.fetch) {
      await guild.fetchMembers();
    }
    const totals = guild.members.size;
    const start = parseInt(req.query.start, 10) || 0;
    const limit = parseInt(req.query.limit, 10) || 50;
    let members = guild.members;
    
    if (req.query.filter && req.query.filter !== "null") {
      //if (!req.query.filtervalue) return res.status(400);
      members = members.filter(m=> {
        m = req.query.filterUser ? m.user : m;
        return m["displayName"].toLowerCase().includes(req.query.filter.toLowerCase());
      });
    }
    
    /*if (req.query.sortby) {
      members = members.sort((a, b) => a[req.query.sortby] > b[req.query.sortby]);
    }*/
    const memberArray = members.cache.array().slice(start, start+limit);
    
    const returnObject = [];
    for (let i = 0; i < memberArray.length; i++) {
      const m = memberArray[i];
      returnObject.push({
        id: m.id,
        status: m.user.presence.status,
        bot: m.user.bot,
        username: m.user.username,
        displayName: m.displayName,
        tag: m.user.tag,
        discriminator: m.user.discriminator,
        joinedAt: m.joinedTimestamp,
        createdAt: m.user.createdTimestamp,
        highestRole: {
          hexColor: m.roles.highest.hexColor
        },
        memberFor: moment.duration(Date.now() - m.joinedAt).format(" D [days], H [hrs], m [mins], s [secs]"),
        roles: m.roles.cache.map(r=>({
          name: r.name,
          id: r.id,
          hexColor: r.hexColor
        }))
      });
    }
    res.json({
      total: totals,
      page: (start/limit)+1,
      pageof: Math.ceil(members.size / limit),
      members: returnObject
    });
  });


  app.get("/dashboard/:guildID/leave", checkAuth, async (req, res) => {
    const guild = client.guilds.cache.get(req.params.guildID);
    if (!guild) return res.status(404);
    const isManaged = guild && !!guild.member(req.user.id) ? guild.member(req.user.id).permissions.has("MANAGE_GUILD") : false;
    if (!isManaged && !req.session.isAdmin) res.redirect("/");
    await guild.leave();
    res.redirect("/dashboard");
  });

  app.get("/dashboard/:guildID/reset", checkAuth, async (req, res) => {
    const guild = client.guilds.cache.get(req.params.guildID);
    if (!guild) return res.status(404);
    const isManaged = guild && !!guild.member(req.user.id) ? guild.member(req.user.id).permissions.has("MANAGE_GUILD") : false;
    if (!isManaged && !req.session.isAdmin) res.redirect("/");
    client.settings.delete(guild.id);
    res.redirect("/dashboard/"+req.params.guildID);
  });
  
  client.site = app.listen(client.config.dashboard.port);
};