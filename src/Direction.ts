export enum Direction {
    NONE = "none",
    LEFT = "left",
    UP = "up",
    RIGHT = "right",
    DOWN = "down",
  }

export function getDirectionFromString(value: string): Direction | undefined {
  for (const key in Direction) {
      if (Direction[key as keyof typeof Direction] === value) {
          return Direction[key as keyof typeof Direction] as Direction;
      }
  }
  return undefined;
}
