'use strict';

//-[ Require config and use ]-!/

if (global.Fca.Require.FastConfig.Config != 'default') {
    //do ssth
}

const Language = global.Fca.Require.languageFile.find((/** @type {{ Language: string; }} */i) => i.Language == global.Fca.Require.FastConfig.Language).Folder.Index;

//-[ Require All Package Need Use ]-!/

var utils = global.Fca.Require.utils,
    logger = global.Fca.Require.logger,
    fs = global.Fca.Require.fs,
    getText = global.Fca.getText,
    log = global.Fca.Require.log,
    express = require("express")(),
    { join } = require('path'),
    cheerio = require("cheerio"),
    { readFileSync, writeFileSync } = require('fs-extra'),
    Database = require("./Extra/Database"),
    readline = require("readline"),
    chalk = require("chalk"),
    figlet = require("figlet"),
    os = require("os"),
    deasync = require('deasync'),
    Security = require("./Extra/Security/Base"),
    { getAll, deleteAll } = require('./Extra/ExtraGetThread'),
    ws = require('ws'),
    Websocket = require('./Extra/Src/Websocket'),
    Convert = require('ansi-to-html');

//-[ Set Variable For Process ]-!/

log.maxRecordSize = 100;
var checkVerified = null;
const Boolean_Option = ['online','selfListen','listenEvents','updatePresence','forceLogin','autoMarkDelivery','autoMarkRead','listenTyping','autoReconnect','emitReady'];

//-[ Set And Check Template HTML ]-!/

const css = readFileSync(join(__dirname, 'Extra', 'Html', 'Classic', 'style.css'));
const js = readFileSync(join(__dirname, 'Extra', 'Html', 'Classic', 'script.js'));

//-[ Function Generate HTML Template ]-!/

function ClassicHTML(UserName,Type,link) {
    return `<!DOCTYPE html>
    <html lang="en" >
        <head>
        <meta charset="UTF-8">
        <title>Horizon</title>
        <link rel="stylesheet" href="./style.css">
    </head>
    <body>
        <center>
            <marquee><b>waiting for u :d</b></marquee>
            <h2>Horizon User Infomation</h2>
            <h3>UserName: ${UserName} | Type: ${Type}</h3>
            <canvas id="myCanvas"></canvas>
            <script  src="./script.js"></script>
            <footer class="footer">
                <div id="music">
                    <audio autoplay="false" controls="true" loop="true" src="${link}">Your browser does not support the audio element.</audio>
                    <br><b>Session ID:</b> ${global.Fca.Require.Security.create().uuid}<br>
                    <br>Thanks For Using <b>Fca-Horizon-Remastered</b> - From <b>Kanzu</b> <3<br>
                </div>
            </footer>
        </center>
    </body>
    </html>`
}

//-[ Stating Http Infomation ]-!/

express.set('DFP', (process.env.PORT || process.env.port || 80));

express.use(function(req, res, next) {
    switch (req.url.split('?')[0]) {
        case '/script.js': {
            res.writeHead(200, { 'Content-Type': 'text/javascript' });
            res.write(js);
            break;
        }
        case '/style.css': {
            res.writeHead(200, { 'Content-Type': 'text/css' });
            res.write(css);
            break;
        }
        default: {
            res.writeHead(200, "OK", { "Content-Type": "text/html" });
            res.write(ClassicHTML(global.Fca.Require.FastConfig.HTML.UserName, "Premium Access", global.Fca.Require.FastConfig.HTML.MusicLink));
        }
    }
    res.end();
})

var Server;
if (global.Fca.Require.FastConfig.HTML.HTML) Server = express.listen(express.get('DFP'));

//-[ Function setOptions ]-!/

function setOptions(globalOptions, options) {
    Object.keys(options).map(function(key) {
        switch (Boolean_Option.includes(key)) {
            case true: {
                globalOptions[key] = Boolean(options[key]);
                break;
            }
            case false: {
                switch (key) {
                    case 'pauseLog': {
                        if (options.pauseLog) log.pause();
                        else log.resume();
                        break;
                    }
                    case 'logLevel': {
                        log.level = options.logLevel;
                        globalOptions.logLevel = options.logLevel;
                        break;
                    }
                    case 'logRecordSize': {
                        log.maxRecordSize = options.logRecordSize;
                        globalOptions.logRecordSize = options.logRecordSize;
                        break;
                    }
                    case 'pageID': {
                        globalOptions.pageID = options.pageID.toString();
                        break;
                    }
                    case 'userAgent': {
                        globalOptions.userAgent = (options.userAgent || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36');
                        break;
                    }
                    case 'proxy': {
                        if (typeof options.proxy != "string") {
                            delete globalOptions.proxy;
                            utils.setProxy();
                        } else {
                            globalOptions.proxy = options.proxy;
                            utils.setProxy(globalOptions.proxy);
                        }
                        break;
                    }
                    default: {
                        log.warn("setOptions", "Unrecognized option given to setOptions: " + key);
                        break;
                    }
                }
                break;
            }
        }
    });
}

function BypassAutomationNotification(resp, jar, globalOptions, appstate, ID) {
    global.Fca.BypassAutomationNotification = BypassAutomationNotification;
    try {
        let UID;
        if (ID) UID = ID;
        else if (appstate && Array.isArray(appstate)) {
            let userCookie = (appstate.find(i => i.key == 'c_user') || appstate.find(i => i.key == 'i_user'));
            UID = userCookie ? userCookie.value : null;
        }

        if (resp && resp.request && resp.request.uri && resp.request.uri.href.includes("checkpoint")) {
            if (resp.request.uri.href.includes('601051028565049')) {
                const fb_dtsg = utils.getFrom(resp.body, '["DTSGInitData",[],{"token":"', '","');
                const jazoest = utils.getFrom(resp.body, 'jazoest=', '",');
                const lsd = utils.getFrom(resp.body, "[\"LSD\",[],{\"token\":\"", "\"}");

                const FormBypass = {
                    av: UID,
                    fb_dtsg, jazoest, lsd,
                    fb_api_caller_class: "RelayModern",
                    fb_api_req_friendly_name: "FBScrapingWarningMutation",
                    variables: JSON.stringify({}),
                    server_timestamps: true,
                    doc_id: 6339492849481770
                };
                return utils.post("https://www.facebook.com/api/graphql/", jar, FormBypass, globalOptions)
                    .then(utils.saveCookies(jar)).then(function() {
                        global.Fca.Require.logger.Warning(global.Fca.Require.Language.Index.Bypass_AutoNoti);
                        return process.exit(1);                    
                    });
            }
        }
        return resp;
    } catch (e) {
        console.log(e);
        return resp;
    }
}

//-[ Function BuildAPI ]-!/

function buildAPI(globalOptions, html, jar, bypass_region) {
    const fb_dtsg = utils.getFroms(html, '["DTSGInitData",[],{"token":"', '","')[0];
    var userID;
    var cookie = jar.getCookies("https://www.facebook.com");
    var maybeUser = cookie.filter(val => val.cookieString().split("=")[0] === "c_user");
    var maybeTiktik = cookie.filter(val => val.cookieString().split("=")[0] === "i_user");

    if (maybeUser.length === 0 && maybeTiktik.length === 0) {
        if (global.Fca.Require.FastConfig.AutoLogin) {
            return global.Fca.Require.logger.Warning(global.Fca.Require.Language.Index.AutoLogin, () => global.Fca.Action('AutoLogin'));
        } else {
            return global.Fca.Require.logger.Error(global.Fca.Require.Language.Index.ErrAppState);
        }
    } else {
        userID = maybeTiktik[0] ? maybeTiktik[0].cookieString().split("=")[1] : maybeUser[0].cookieString().split("=")[1];
        process.env['UID'] = logger.Normal(getText(Language.UID, userID), userID);

        var clientID = (Math.random() * 2147483648 | 0).toString(16);
        var CHECK_MQTT = {
            oldFBMQTTMatch: html.match(/irisSeqID:"(.+?)",appID:219994525426954,endpoint:"(.+?)"/),
            newFBMQTTMatch: html.match(/{"app_id":"219994525426954","endpoint":"(.+?)","iris_seq_id":"(.+?)"}/),
            legacyFBMQTTMatch: html.match(/\["MqttWebConfig",\[\],{"fbid":"(.*?)","appID":219994525426954,"endpoint":"(.*?)","pollingEndpoint":"(.*?)"/)
        };

        var mqttEndpoint, region, irisSeqID;
        let Slot = Object.keys(CHECK_MQTT);
        Slot.map(function(MQTT) {
            if (CHECK_MQTT[MQTT] && !region) {
                if (MQTT == 'oldFBMQTTMatch') {
                    irisSeqID = CHECK_MQTT[MQTT][1];
                    mqttEndpoint = CHECK_MQTT[MQTT][2].replace(/\\\/ /g, "/");
                } else if (MQTT == 'newFBMQTTMatch') {
                    irisSeqID = CHECK_MQTT[MQTT][2];
                    mqttEndpoint = CHECK_MQTT[MQTT][1].replace(/\\\/ /g, "/");
                } else {
                    mqttEndpoint = CHECK_MQTT[MQTT][2].replace(/\\\/ /g, "/");
                }
                if (mqttEndpoint) region = new URL(mqttEndpoint).searchParams.get("region")?.toUpperCase();
            }
        });

        if (!region) region = ['PRN', "PNB", "VLL", "HKG", "SIN"][Math.random() * 5 | 0];
        if (!mqttEndpoint) mqttEndpoint = "wss://edge-chat.facebook.com/chat?region=" + region;

        var ctx = {
            userID, jar, clientID, globalOptions, loggedIn: true,
            access_token: 'NONE', clientMutationId: 0, mqttClient: undefined,
            lastSeqId: irisSeqID, syncToken: undefined, mqttEndpoint, region,
            firstListen: true, req_ID: 0, callback_Task: {}, fb_dtsg
        };

        var api = {
            setOptions: setOptions.bind(null, globalOptions),
            getAppState: () => utils.getAppState(jar)
        };

        var defaultFuncs = utils.makeDefaults(html, userID, ctx);
        api.postFormData = (url, body) => defaultFuncs.postFormData(url, ctx.jar, body);

        fs.readdirSync(__dirname + "/src").filter(File => File.endsWith(".js") && !File.includes('Dev_')).map(File => {
            api[File.split('.')[0]] = require('./src/' + File)(defaultFuncs, api, ctx);
        });

        return { ctx, defaultFuncs, api };
    }
}

//-[ Function makeLogin ]-!/

function makeLogin(jar, email, password, loginOptions, callback, prCallback) {
    return function(res) {
        var html = res.body, $ = cheerio.load(html), arr = [];
        $("#login_form input").map((i, v) => arr.push({ val: $(v).val(), name: $(v).attr("name") }));
        var form = utils.arrToForm(arr.filter(v => v.val && v.val.length));
        form.email = email;
        form.pass = password;
        form.locale = 'en_US';
        form.lgnjs = ~~(Date.now() / 1000);

        logger.Normal(Language.OnLogin);
        return utils.post("https://www.facebook.com/login/device-based/regular/login/?login_attempt=1&lwv=110", jar, form, loginOptions)
            .then(utils.saveCookies(jar))
            .then(function(res) {
                var headers = res.headers;
                if (!headers.location) throw { error: Language.InvaildAccount };
                return utils.get('https://www.facebook.com/', jar, null, loginOptions).then(utils.saveCookies(jar));
            });
    };
}

//-[ Function loginHelper ]-!/

function loginHelper(appState, email, password, globalOptions, callback, prCallback) {
    var jar = utils.getJar();
    var mainPromise;

    if (appState) {
        logger.Normal(Language.OnProcess);
        if (typeof appState === 'string') {
            try { appState = JSON.parse(appState); } catch (e) { /* silent */ }
        }
        
        appState.forEach(c => {
            var str = `${c.key}=${c.value}; expires=${c.expires}; domain=${c.domain}; path=${c.path};`;
            jar.setCookie(str, "https://" + c.domain.replace(/^\./, ""));
        });
        mainPromise = utils.get('https://www.facebook.com/', jar, null, globalOptions, { noRef: true }).then(utils.saveCookies(jar));
    } else {
        mainPromise = utils.get("https://www.facebook.com/", null, null, globalOptions, { noRef: true })
            .then(utils.saveCookies(jar))
            .then(makeLogin(jar, email, password, globalOptions, callback, prCallback));
    }

    mainPromise
        .then(res => BypassAutomationNotification(res, jar, globalOptions, appState))
        .then(res => {
            var Obj = buildAPI(globalOptions, res.body, jar, false);
            if (Obj) callback(null, Obj.api);
        })
        .catch(e => callback(e));
}

function login(loginData, options, callback) {
    if (typeof options === 'function') { callback = options; options = {}; }
    var globalOptions = {
        selfListen: false, listenEvents: true, listenTyping: false,
        updatePresence: false, forceLogin: false, autoMarkDelivery: false,
        autoMarkRead: false, autoReconnect: true, logRecordSize: 100,
        online: false, emitReady: false,
        userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36"
    };
    setOptions(globalOptions, options);
    return loginHelper(loginData.appState, loginData.email, loginData.password, globalOptions, callback);
}

module.exports = login;

