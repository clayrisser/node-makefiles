import execa from 'execa';

export default async function depCruise(...args: string[]): Promise<any> {
  let result = {};
  try {
    if (!args.length) {
      args = (
        await execa('find', [
          '-name',
          '*.js',
          '-not',
          '-path',
          './node_modules/*',
          '-o',
          '-name',
          '*.jsx',
          '-not',
          '-path',
          './node_modules/*',
          '-o',
          '-name',
          '*.ts',
          '-not',
          '-path',
          './node_modules/*',
          '-o',
          '-name',
          '*.tsx',
          '-not',
          '-path',
          './node_modules/*'
        ])
      ).stdout.split('\n');
    }
    result = JSON.parse(
      (await execa('depcruise', ['--output-type', 'json', ...args])).stdout
    );
  } catch (err) {
    console.error(err);
  }
  return result;
}
