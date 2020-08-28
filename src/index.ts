import DepsList from './depslist';

const depsList = new DepsList(
  process.argv.slice(2).filter((arg: string) => arg !== '--reverse')
);

(async () => {
  if (!process.argv.find((arg: string) => arg === '--reverse')) {
    (await depsList.list()).map((dep: string) => console.log(dep));
  } else {
    (await depsList.revList()).map((dep: string) => console.log(dep));
  }
})();
