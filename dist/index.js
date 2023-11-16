#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var commander_1 = require("commander");
var program = new commander_1.Command();
var xmlbuilder2_1 = require("xmlbuilder2");
var debug = function (options, name, log) {
    if (options.D) {
        console.log({ name: log });
    }
};
var error = function (message, e, exit) {
    if (exit === void 0) { exit = true; }
    console.error(message);
    console.error(e);
    if (exit)
        process.exit(1);
};
var parseXml = function (input) {
    var testcase = Object.keys(input).map(function (key) {
        var _a = input[key], current = _a.current, wanted = _a.wanted, latest = _a.latest, location = _a.location, dependent = _a.dependent;
        return {
            "@name": key,
            "@file": location,
            failure: {
                "@message": "".concat(key, " is out of date"),
                "#text": "current: ".concat(current, ", wanted: ").concat(wanted, ", latest: ").concat(latest, ", location: ").concat(location).concat(dependent ? "dependent: " + dependent : ""),
            },
        };
    });
    var root = {
        testsuites: {
            testsuite: {
                "@name": "NPM Outdated",
                "@errors": 0,
                "@failures": 0,
                "@tests": input.length,
                testcase: testcase,
            },
        },
    };
    var doc = (0, xmlbuilder2_1.create)(root);
    var xml = doc.end({ prettyPrint: true });
    return xml;
};
program
    .name("npm-outdated-xml")
    .description("Convert npm outdated json output to xml")
    .version("0.0.1");
program
    .description("npm outdated --json | npx npm-outdated-xml")
    .option("--debug, -d", "output extra debugging")
    .action(function () {
    var options = program.opts();
    debug(options, "options", options);
    // read the input
    process.stdin.resume();
    var rawInput = "";
    process.stdin.on("data", function (input) {
        rawInput += input;
    });
    // when input ends, parse the file
    process.stdin.on("end", function () {
        var input = {};
        try {
            input = JSON.parse(rawInput);
        }
        catch (e) {
            error("Error parsing JSON input", e, true);
        }
        try {
            var xml = parseXml(input);
            console.log(xml);
        }
        catch (e) {
            error("Error parsing npm outdated report", e, true);
        }
    });
});
program.parse(process.argv);
