const os = require("node:os");


function checkCpuUsage() {
  const cpus = os.cpus();

  return cpus.reduce((acc, cpu) => {
    let total = 0;
    for (let type in cpu.times) {
      total += cpu.times[type];
    }

    const cores = [...acc.cores, {
      user: Math.round(100 * cpu.times.user / total),
      nice: Math.round(100 * cpu.times.nice / total),
      sys: Math.round(100 * cpu.times.sys / total),
      idle: Math.round(100 * cpu.times.idle / total),
      irq: Math.round(100 * cpu.times.irq / total),
    }];

    const allTotal = acc.allTotal + total;
    const user = acc.totals.user + cpu.times.user;
    const nice = acc.totals.nice + cpu.times.nice;
    const sys = acc.totals.sys + cpu.times.sys;
    const idle = acc.totals.idle + cpu.times.idle;
    const irq = acc.totals.irq + cpu.times.irq;
    Object.assign(acc.totals, {
      user,
      nice,
      sys,
      idle,
      irq
    })
    return {
      ...acc,
      allTotal,
      totalSpeed: acc.totalSpeed + cpu.speed,
      average: {
        user: Math.round(100 * (user) / (allTotal)),
        nice: Math.round(100 * (nice) / (allTotal)),
        sys: Math.round(100 * (sys) / (allTotal)),
        idle: Math.round(100 * (idle) / (allTotal)),
        irq: Math.round(100 * (irq) / (allTotal))
      },
      cores
    }

  }, {
    coresCount: cpus.length,
    allTotal: 0,
    totalSpeed: 0,
    totals: {
      user: 0,
      nice: 0,
      sys: 0,
      idle: 0,
      irq: 0
    },
    average: {
      user: 0,
      nice: 0,
      sys: 0,
      idle: 0,
      irq: 0
    },
    cores: []
  })
}


module.exports = checkCpuUsage