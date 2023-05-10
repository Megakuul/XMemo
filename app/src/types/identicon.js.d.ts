declare module "identicon.js" {
  export default class Identicon {
    constructor(hash: string, options?: IdenticonOptions);
    toString(): string;
  }

  interface IdenticonOptions {
    size?: number;
    format?: "png" | "svg";
  }
}
