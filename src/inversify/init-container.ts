import { Container } from "inversify";

export interface ContainerInitializationOptions {}

export function initContainer({}: ContainerInitializationOptions): Container {
  const container = new Container();

  return container;
}
