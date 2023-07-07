import { LogSync, Logging } from '@google-cloud/logging';
import type { LogEntry } from '@google-cloud/logging/build/src/entry';


const logging = new Logging();
logging.setProjectId();
logging.setDetectedResource();

function getLogSync () : LogSync {
    const callingFunctionName = new Error().stack!
        .split('\n')[3]
        .trim()
        .match(/at (\S+)/)![1];
    return logging.logSync(callingFunctionName);
}

export function info (message: string, labels?: Record<string, string>) {
    console.log(message);
    const log = getLogSync();
    const meta :LogEntry = { labels: labels };
    const entry = log.entry(meta, message);
    log.info(entry);
}

export function debug (message: string, labels?: Record<string, string>) {
    console.log(message);
    const log = getLogSync();
    const meta :LogEntry = { labels: labels };
    const entry = log.entry(meta, message);
    log.debug(entry);
}

export function alert (message: string, labels?: Record<string, string>) {
    console.log(message);
    const log = getLogSync();
    const meta :LogEntry = { labels: labels };
    const entry = log.entry(meta, message);
    log.alert(entry);
}

export function warning (message: string, labels?: Record<string, string>) {
    console.log(message);
    const log = getLogSync();
    const meta :LogEntry = { labels: labels };
    const entry = log.entry(meta, message);
    log.warning(entry);
}

export function error (message: string, labels?: Record<string, string>) {
    console.log(message);
    const log = getLogSync();
    const meta :LogEntry = { labels: labels };
    const entry = log.entry(meta, message);
    log.error(entry);
}

export function critical (message: string, labels?: Record<string, string>) {
    console.log(message);
    const log = getLogSync();
    const meta :LogEntry = { labels: labels };
    const entry = log.entry(meta, message);
    log.critical(entry);
}