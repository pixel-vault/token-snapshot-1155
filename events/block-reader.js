"use strict";

import { readdir, readFile } from "fs";
import { join } from "path";
import { promisify } from "util";

import { parameters } from "../config/parameters.js";

const readdirAsync = promisify(readdir);
const readFileAsync = promisify(readFile);

const getMinimalSingle = (pastEvents) => {
  return pastEvents.map((tx) => {
    return {
      transactionHash: tx.transactionHash,
      from: tx.args["1"],
      to: tx.args["2"],
      id: tx.args["3"].hex,
      value: tx.args["4"].hex
    };
  });
};

const getMinimalBatch = (pastEvents) => {
  return pastEvents.map((tx) => {
    return {
      transactionHash: tx.transactionHash,
      from: tx.args["1"],
      to: tx.args["2"],
      id: tx.args["3"].map(function (val) { return val.hex }),
      value: tx.args["4"].map(function (val) { return val.hex })
    };
  });
};

export const getEvents = async (contractAddress) => {
  const directory = parameters.eventsDownloadFolder.replace(/{token}/g, contractAddress);
  const files = await readdirAsync(directory);
  files.sort((a, b) => {
    return parseInt(a.split(".")[0]) - parseInt(b.split(".")[0]);
  });
  let events = [];

  console.log("Parsing files.");

  for await (const file of files) {
    console.log("Parsing ", file);

    const contents = await readFileAsync(join(directory, file));
    const parsed = JSON.parse(contents.toString());

    if(parsed[0].event === "TransferBatch") {
      events = events.concat(getMinimalBatch(parsed));
      console.log(events)
    } else {
      events = events.concat(getMinimalSingle(parsed));
    }
  }

  return events;
};
