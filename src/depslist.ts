import depCruise from './depCruise';

export interface DepsMap {
  [key: string]: string[];
}

export default class DepsList {
  constructor(public files: string[]) {}

  private depCruiseCache: any;

  private revDepsMap: DepsMap = {};

  private allRevDepsMap: DepsMap = {};

  private loadingResolvers: (() => any)[] = [];

  private loadingDepCruise = false;

  async list(): Promise<string[]> {
    return (await depCruise(...this.files)).modules
      .filter((value: any) => {
        return (
          value.source.indexOf('node_modules/') <= -1 &&
          /\.(j|t)sx?/.test(value.source)
        );
      })
      .map((mod: any) => mod.source);
  }

  async revList(): Promise<string[]> {
    let revList: string[] = [];
    await Promise.all(
      this.files.map(async (file: string) => {
        const list = await this.getAllRevDeps(file);
        revList = [...revList, ...list];
      })
    );
    return [...new Set(revList)];
  }

  async getAllRevDeps(resolved: string): Promise<string[]> {
    const directRevDeps = await this.getDirectRevDeps(resolved);
    if (!this.allRevDepsMap[resolved]) {
      this.allRevDepsMap[resolved] = [];
      this.allRevDepsMap[resolved].push(
        ...[
          resolved,
          ...directRevDeps,
          ...(
            await Promise.all(
              directRevDeps.map(async (revDep: string) => {
                return this.getAllRevDeps(revDep);
              })
            )
          ).flat()
        ]
      );
    }
    return this.allRevDepsMap[resolved];
  }

  async getDirectRevDeps(resolved: string): Promise<string[]> {
    if (!this.revDepsMap[resolved]) {
      this.revDepsMap[resolved] = (await this.depCruise()).modules
        .filter((mod: any) => {
          return new Set(
            mod.dependencies.map((value: any) => value.resolved)
          ).has(resolved);
        })
        .map((value: any) => value.source.replace(/^.\//g, ''));
    }
    return this.revDepsMap[resolved];
  }

  async depCruise() {
    if (this.depCruiseCache) return this.depCruiseCache;
    if (this.loadingDepCruise) {
      await new Promise((resolve) => this.loadingResolvers.push(resolve));
    } else {
      this.loadingDepCruise = true;
      const depCruiseCache = await depCruise();
      depCruiseCache.modules = depCruiseCache.modules.filter((value: any) => {
        return (
          value.source.indexOf('node_modules/') <= -1 &&
          /\.(j|t)sx?/.test(value.source)
        );
      });
      this.depCruiseCache = depCruiseCache;
      this.loadingResolvers.forEach((resolve: () => any) => resolve());
      this.loadingDepCruise = false;
    }
    return this.depCruiseCache;
  }
}
