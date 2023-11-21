#!/usr/bin/env node

import { Command } from "commander";
const program = new Command();
import { create } from "xmlbuilder2";

// the npm outdated json output
interface Input {
  [key: string]: {
    current: string;
    wanted: string;
    latest: string;
    location: string;
    dependent?: string; // introduced somewhere between node 14 and 20
  };
}

interface Options {
  D: boolean;
}

const debug = (options: Options, name: string, log: any): void => {
  if (options.D) {
    console.log({ name: log });
  }
};

const error = (message: string, e: any, exit = true): void => {
  console.error(message);
  console.error(e);
  if (exit) process.exit(1);
};

const parseXml = (input: Input): string => {
  const testcase = Object.keys(input).map((key) => {
    const { current, wanted, latest, location, dependent } = input[key];
    return {
      "@name": `${key} is out of date: current: ${current}, wanted: ${wanted}, latest: ${latest}, location: ${location}${
        dependent ? "dependent: " + dependent : ""
      }`,
      "@file": location,
      "@classname": key + "@" + current,
      failure: {
        "@message": `${key} is out of date`,
        "#text": `current: ${current}, wanted: ${wanted}, latest: ${latest}, location: ${location}${
          dependent ? "dependent: " + dependent : ""
        }`,
      },
    };
  });

  const root = {
    testsuites: {
      testsuite: {
        "@name": "NPM Outdated",
        "@errors": 0,
        "@failures": 0,
        "@tests": input.length,
        testcase,
      },
    },
  };
  const doc = create(root);
  const xml = doc.end({ prettyPrint: true });
  return xml;
};

program
  .name("npm-outdated-xml")
  .description("Convert npm outdated json output to xml")
  .version("1.1.1");

program
  .description("npm outdated --json | npx npm-outdated-xml")
  .option("--debug, -d", "output extra debugging")
  .action(() => {
    const options = program.opts();

    debug(options as Options, "options", options);

    // read the input
    process.stdin.resume();
    let rawInput = "";
    process.stdin.on("data", (input) => {
      rawInput += input;
    });

    // when input ends, parse the file
    process.stdin.on("end", () => {
      let input: Input = {};
      try {
        input = JSON.parse(rawInput);
      } catch (e) {
        error("Error parsing JSON input", e, true);
      }

      try {
        const xml = parseXml(input);
        console.log(xml);
      } catch (e) {
        error("Error parsing npm outdated report", e, true);
      }
    });
  });

program.parse(process.argv);
