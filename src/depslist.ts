import depCruise from './depCruise';

export default class DepsList {
  constructor(public files: string[]) {}

  private depCruiseCache: any;

  async list(): Promise<string[]> {
    return (await depCruise(...this.files)).modules.reduce(
      (deps: string[], value: any) => {
        if (
          value.source.indexOf('node_modules/') <= -1 &&
          /\.(j|t)sx?/.test(value.source)
        ) {
          deps.push(value.source);
        }
        return deps;
      },
      []
    );
  }

  async revList(): Promise<string[]> {
    let revList: string[] = [];
    await Promise.all(
      this.files.map(async (file: string) => {
        const list = await this.revDep(file);
        revList = [...revList, ...list];
      })
    );
    return [...new Set(revList)];
  }

  async revDep(file: string): Promise<string[]> {
    return (await this.depCruise()).modules
      .filter((value: any) => {
        return new Set(
          value.dependencies.map((value: any) => value.resolved)
        ).has(file);
      })
      .map((value: any) => value.source.replace(/^.\//g, ''));
  }

  async depCruise() {
    if (this.depCruiseCache) return this.depCruiseCache;
    const depCruiseCache = await depCruise();
    this.depCruiseCache = depCruiseCache;
    return this.depCruiseCache;
  }
}
