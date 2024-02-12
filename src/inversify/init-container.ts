import { Container, interfaces } from "inversify";

export type ContainerInitializationProvider = Parameters<
  interfaces.BindingToSyntax<unknown>["to"]
>[0];

export interface ContainerInitializationOptions {
  providers?: Array<
    | ContainerInitializationProvider
  >;
}

export function initContainer({
  providers,
}: ContainerInitializationOptions): Container {
  const container = new Container();
  providers
    ?.filter(function (provider): provider is ContainerInitializationProvider {
      return typeof provider === "function";
    })
    .forEach((provider) => container.bind(provider).to(provider));

  return container;
}
