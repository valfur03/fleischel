import { Container, interfaces } from "inversify";

export type ContainerInitializationProvider = Parameters<
  interfaces.BindingToSyntax<unknown>["to"]
>[0];
export type ContainerInitializationStaticProvider = {
  provide: interfaces.ServiceIdentifier<unknown>;
  useValue: Parameters<
    interfaces.BindingToSyntax<unknown>["toConstantValue"]
  >[0];
};
export type ContainerInitializationDynamicProvider = {
  provide: interfaces.ServiceIdentifier<unknown>;
  useFactory: Parameters<
    interfaces.BindingToSyntax<unknown>["toDynamicValue"]
  >[0];
};

export interface ContainerInitializationOptions {
  providers?: Array<
    | ContainerInitializationProvider
    | ContainerInitializationStaticProvider
    | ContainerInitializationDynamicProvider
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
  providers
    ?.filter(
      function (provider): provider is ContainerInitializationStaticProvider {
        return "useValue" in provider;
      },
    )
    .forEach((provider) =>
      container.bind(provider.provide).toConstantValue(provider.useValue),
    );
  providers
    ?.filter(
      function (provider): provider is ContainerInitializationDynamicProvider {
        return "useFactory" in provider;
      },
    )
    .forEach((provider) =>
      container.bind(provider.provide).toDynamicValue(provider.useFactory),
    );

  return container;
}
