import util from 'util';
const exec = util.promisify(require('child_process').exec);

export async function execPython(cmd) {
  const { stdout, stderr } = await exec(cmd);
  return stdout
};