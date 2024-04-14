// biome-ignore lint/style/useNodejsImportProtocol: <explanation>
import { execFile } from "child_process";

type Result = BeginResult | EndResult | MatchResult;
interface BeginResult {
  type: "begin";
}
interface EndResult {
  type: "end";
}

export interface MatchResult {
  type: "match";
  data: {
    path: {
      text: string;
    };
    lines: {
      text: string;
    };
    line_number: number;
    absolute_offset: number;
    submatches: {
      match: {
        text: string;
      };
      start: number;
      end: number;
    }[];
  };
}

export async function existsRg(cmd: string): Promise<boolean> {
  return new Promise((resolve, _) => {
    execFile(cmd, ["--version"], (error, _stdout, _stderr) => {
      if (error) {
        console.dir(error);
      }
      resolve(!error);
    });
  });
}

export async function rg(
  cmd: string,
  ...args: string[]
): Promise<MatchResult[]> {
  return new Promise((resolve, _) => {
    execFile(
      cmd,
      ["--json", ...args],
      { maxBuffer: 100 * 1024 * 1024 },
      (_, stdout, _stderr) => {
        const results = stdout
          .split("\n")
          .filter((x: string) => x)
          .map((x: string) => JSON.parse(x) as Result)
          .filter((x: Result) => x.type === "match") as MatchResult[];
        resolve(results);
      },
    );
  });
}
