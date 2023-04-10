const { execFile } = require('node:child_process');
const { existsSync } = require('node:fs');
const { normalize, sep } = require('node:path');

const GB = 1073741824;
const KB = 1048576

function getFirstExistingParentPath(directoryPath) {
  let parentDirectoryPath = directoryPath
  let parentDirectoryFound = existsSync(parentDirectoryPath)

  while (!parentDirectoryFound) {
    parentDirectoryPath = normalize(parentDirectoryPath + '/..')
    parentDirectoryFound = existsSync(parentDirectoryPath)
  }

  return parentDirectoryPath
}

function checkDiskSpace(directoryPath) {

  function mapOutput(
    stdout,
    filter,
    mapping,
    coefficient,
  ) {

    const parsed = stdout.trim().split('\n').slice(1).map(line => {
      return line.trim().split(/\s+(?=[\d/])/)
    })

    const filtered = parsed.filter(filter)

    if (filtered.length === 0) {
      throw Error("no match")
    }

    const diskData = filtered[0]

    return {
      diskPath: diskData[mapping.diskPath],
      free: (parseInt(diskData[mapping.free], 10) * coefficient) / KB,
      size: (parseInt(diskData[mapping.size], 10) * coefficient) / KB,
      used: (parseInt(diskData[mapping.used], 10) * coefficient) / KB,
      capacity: diskData[mapping.capacity]
    }
  }

  function check(
    cmd,
    filter,
    mapping,
    coefficient = 1,
  ) {
    return new Promise((resolve, reject) => {
      const [
        file,
        ...args
      ] = cmd

      /* istanbul ignore if */
      if (file === undefined) {
        return Promise.reject(new Error('cmd must contain at least one item'))
      }

      execFile(file, args, (error, stdout) => {
        if (error) {
          reject(error)
        }

        try {
          resolve(mapOutput(stdout, filter, mapping, coefficient))
        } catch (error2) {
          reject(error2)
        }
      })
    })
  }

  function checkUnix(directoryPath) {
    if (!normalize(directoryPath).startsWith(sep)) {
      return new Promise((resolve, reject) => {
        reject(new InvalidPathError(`The following path is invalid (should start by ${sep}): ${directoryPath}`))
      })
    }

    const pathToCheck = getFirstExistingParentPath(directoryPath)

    return check(
      [
        'df',
        '-Pk',
        '--',
        pathToCheck,
      ],
      () => true, // We should only get one line, so we did not need to filter
      {
        diskPath: 5,
        free: 3,
        size: 1,
        capacity: 4,
        used: 2
      },
      //1024, // We get sizes in kB, we need to convert that to bytes
      1
    )
  }

  return checkUnix(directoryPath);

}

module.exports = checkDiskSpace;