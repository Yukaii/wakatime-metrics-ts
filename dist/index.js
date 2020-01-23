"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var axios_1 = require("axios");
var humanizeDuration = require("humanize-duration");
if (process.env.NODE_ENV === 'development') {
    require('dotenv').config();
}
var generateMetrics = function () { return __awaiter(void 0, void 0, void 0, function () {
    var langMetrics, activity, data, top5Langs, maxNameLength, totalSeconds, times, maxTimeLength;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, axios_1["default"].get(process.env.WAKATIME_LANGUAGE)];
            case 1:
                langMetrics = (_a.sent()).data;
                return [4 /*yield*/, axios_1["default"].get(process.env.WAKATIME_ACTIVITY)];
            case 2:
                activity = (_a.sent()).data;
                data = langMetrics.data;
                top5Langs = data.slice(0, 5);
                maxNameLength = Math.max.apply(Math, top5Langs.map(function (lang) { return lang.name.length; }));
                totalSeconds = activity.data.reduce(function (acc, item) { return item.grand_total.total_seconds + acc; }, 0);
                times = top5Langs.map(function (lang) { return humanizeDuration(Math.round(totalSeconds * lang.percent / 100) * 1000, {
                    units: ['h', 'm'],
                    round: true
                }); });
                maxTimeLength = Math.max.apply(Math, times.map(function (time) { return time.length; }));
                return [2 /*return*/, top5Langs.map(function (lang, idx) {
                        var block = Math.round(25 * lang.percent / 100);
                        var blocks = Array(block).fill('█').join('');
                        var time = humanizeDuration(Math.round(totalSeconds * lang.percent / 100) * 1000, {
                            units: ['h', 'm'],
                            round: true,
                            delimiter: ' '
                        });
                        return [
                            lang.name.padEnd(maxNameLength + 2),
                            time.padStart(maxTimeLength),
                            '  ',
                            blocks.padEnd(25, '░'),
                            ' ',
                            ("" + lang.percent).padStart(5),
                            '%',
                        ].join('');
                    }).join('\n')];
        }
    });
}); };
(function () { return __awaiter(void 0, void 0, void 0, function () {
    var metrics;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, generateMetrics()];
            case 1:
                metrics = _a.sent();
                return [4 /*yield*/, axios_1["default"].patch("https://api.github.com/gists/" + process.env.GIST_ID, {
                        files: {
                            "📊 Weekly development breakdown": {
                                content: metrics
                            }
                        }
                    }, {
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': "token " + process.env.GIST_TOKEN
                        }
                    })];
            case 2:
                _a.sent();
                process.exit(0);
                return [2 /*return*/];
        }
    });
}); })();
