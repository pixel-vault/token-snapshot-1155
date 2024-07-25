"use strict";

import { promisify } from "util";

import { parameters } from "../config/parameters.js";
import { writeFile } from "../export/file-helper.js";
import { tryBlockByBlock } from "./block-by-block.js";
import { getEvents } from "./block-reader.js";
import { getFiles } from "./last-downloaded-block.js";

const sleep = promisify(setTimeout);

const groupBy = (objectArray, property) => {
  return objectArray.reduce((acc, obj) => {
    const key = obj[property];
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(obj);
    return acc;
  }, {});
};

const tryGetEvents = async (start, end, contract) => {
  try {
    const filterSingle = contract.filters.TransferSingle();
    const filterBatch = contract.filters.TransferBatch();

    const pastEventsSingle = await contract.queryFilter(filterSingle, start, end);
    const pastEventsBatch = await contract.queryFilter(filterBatch, start, end);

    const pastEvents = pastEventsSingle.concat(pastEventsBatch);

    if (pastEvents.length) {
      console.info("Successfully imported ", pastEvents.length, " events");
    }

    const group = groupBy(pastEvents, "blockNumber");

    for (const key in group) {
      if (Object.prototype.hasOwnProperty.call(group, key)) {
        const blockNumber = key;
        const data = group[key];

        const file = parameters.eventsDownloadFilePath
          .replace(/{token}/g, contract.address)
          .replace(/{blockNumber}/, blockNumber);

        writeFile(file, data);
      }
    }
  } catch (e) {
    console.log(e);
    console.log("Could not get events due to an error. Now checking block by block.");
    await tryBlockByBlock(contract, start, end);
  }
};

export const getEventsData = async (config, provider, contract) => {
  const blockHeight = await provider.getBlockNumber();
  let fromBlock = parseInt(config.fromBlock) || 0;
  const blocksPerBatch = parseInt(config.blocksPerBatch) || 0;
  const delay = parseInt(config.delay) || 0;
  const toBlock = parseInt(config.toBlock) || blockHeight;

  const lastDownloadedBlock = await getFiles(contract.address);

  if (lastDownloadedBlock) {
    console.log("Resuming from the last downloaded block #", lastDownloadedBlock);
    fromBlock = lastDownloadedBlock + 1;
  }
  console.log("From %d to %d", fromBlock, toBlock);

  let start = fromBlock;
  let end = fromBlock + blocksPerBatch;

  let i = 0;

  while (end < toBlock) {
    i++;

    if (delay) {
      await sleep(delay);
    }

    console.log("Batch", i + 1, " From", start, "to", end);

    await tryGetEvents(start, end, contract);

    start = end + 1;
    end = start + blocksPerBatch;

    if (end > toBlock) {
      end = toBlock;
    }
  }

  const events = await getEvents(contract.address);

  const data = {
    events: events
  };

  return data;
};
