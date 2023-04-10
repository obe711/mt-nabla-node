const { EventEmitter } = require('node:events');
const os = require("node:os");
const DevNull = require("./DevNull");
const checkDiskSpace = require("./libs/disk");
const checkCpuUsage = require("./libs/cpu");

const DEFAULT_UPDATE_INTERVAL = 990;

const SYS_STAT_UPDATE_EVENT = "data"
const GB = 1073741824;
/**
 * System status event emmiter
 */
class NablaSystem extends EventEmitter {
  constructor(options = {}) {
    super();
    this.options = options;
    this.logger = options.logger || new DevNull();
    this.interval = options.interval || DEFAULT_UPDATE_INTERVAL;
    const p_interval = setInterval(() => {
      this.send();
    }, this.interval);

    p_interval.unref();
  };


  /**
   * Emit system data
   * @private
   */
  async send() {
    const diskData = await checkDiskSpace("/");
    const hostname = os.hostname();
    const uptime = Math.round(os.uptime());
    const totalMemory = os.totalmem();
    const freeMemory = os.freemem();
    const usedMemory = totalMemory - freeMemory;
    const memoryUsage = usedMemory / totalMemory;
    const cpus = checkCpuUsage();
    const loadavg = os.loadavg();
    this.emit(SYS_STAT_UPDATE_EVENT, { disk: diskData, hostname, uptime, memoryUsage: memoryUsage * 100, memory: Math.round(totalMemory / GB), cpus, loadavg });
  }
}

module.exports = {
  NablaSystem,
  SYS_STAT_UPDATE_EVENT
} 